import ParkingSlot from '../models/ParkingSlot.js';
import Booking from '../models/Booking.js';
import ParkingArea from '../models/ParkingArea.js';
import GuideActivityLog from '../models/GuideActivityLog.js';

// @desc    Automatically sync slot status counts inside parent ParkingArea model
export const syncParkingAreaCounts = async (areaId) => {
  try {
    const totalSlots = await ParkingSlot.countDocuments({ area: areaId });
    const availableSlots = await ParkingSlot.countDocuments({ area: areaId, status: 'available' });
    const occupiedSlots = await ParkingSlot.countDocuments({ area: areaId, status: 'occupied' });

    await ParkingArea.findByIdAndUpdate(areaId, {
      totalSlots,
      availableSlots,
      occupiedSlots
    });
  } catch (error) {
    console.error(`[ERROR] Failed to synchronize slot status counts for area ${areaId}:`, error);
  }
};

// @desc    Update slot status (for guides/admins)
// @route   PATCH/PUT /api/slots/:id/status
// @access  Private (Guide / Admin)
export const updateSlotStatus = async (req, res, next) => {
  try {
    console.log('[DEBUG] Slot status route hit');
    console.log('[DEBUG] Slot ID:', req.params.id);
    console.log('[DEBUG] Status:', req.body.status);

    const { status } = req.body;

    const allowedStatuses = ['available', 'reserved', 'occupied', 'expired', 'maintenance', 'blocked'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid slot status value. Allowed statuses: ${allowedStatuses.join(', ')}`
      });
    }

    const slot = await ParkingSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Parking slot not found'
      });
    }

    // Role & Area Authorization Checks:
    // Guides can only update slots within their assigned parking area
    if (req.user.role === 'guide') {
      if (!req.user.assignedArea || slot.area.toString() !== req.user.assignedArea.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only manage slots within your assigned parking area.'
        });
      }
    }

    const oldStatus = slot.status;

    // Validation Rules check to prevent conflicts:
    // 1. occupied -> available: block if active booking exists
    if (oldStatus === 'occupied' && status === 'available') {
      const activeBooking = await Booking.findOne({
        slot: slot._id,
        status: { $in: ['confirmed', 'checked-in'] }
      });
      if (activeBooking) {
        return res.status(400).json({
          success: false,
          message: 'Cannot mark occupied slot as available while an active booking exists. Please check out the customer first.'
        });
      }
    }

    // 2. reserved -> maintenance: block if booking is active
    if (oldStatus === 'reserved' && status === 'maintenance') {
      const activeBooking = await Booking.findOne({
        slot: slot._id,
        status: { $in: ['confirmed', 'checked-in'] }
      });
      if (activeBooking) {
        return res.status(400).json({
          success: false,
          message: 'Cannot mark reserved slot as maintenance while there is an active booking.'
        });
      }
    }

    // Process status updates
    slot.status = status;

    // If status changed to available, free up booking bindings
    if (status === 'available') {
      if (slot.bookingDetails && slot.bookingDetails.bookingId) {
        const booking = await Booking.findById(slot.bookingDetails.bookingId);
        if (booking && booking.status !== 'checked-out' && booking.status !== 'cancelled') {
          booking.status = 'checked-out';
          booking.checkOutTime = new Date();
          await booking.save();
        }
      }
      slot.bookingDetails = { bookingId: null };
      slot.activeTiming = { start: null, end: null };
      slot.vehicleDetails = { type: 'Car', number: '', owner: '' };
    } else if (status === 'occupied') {
      // If status changed to occupied (Checked In), make sure corresponding booking is marked checked-in
      if (slot.bookingDetails && slot.bookingDetails.bookingId) {
        const booking = await Booking.findById(slot.bookingDetails.bookingId);
        if (booking && booking.status === 'confirmed') {
          booking.status = 'checked-in';
          booking.checkInTime = new Date();
          await booking.save();
        }
      }
    } else if (status === 'maintenance' || status === 'blocked') {
      // Free up bindings if slot is marked as maintenance or blocked and no active bookings exist
      slot.bookingDetails = { bookingId: null };
      slot.activeTiming = { start: null, end: null };
      slot.vehicleDetails = { type: 'Car', number: '', owner: '' };
    }

    await slot.save();

    // Database counts synchronization
    await syncParkingAreaCounts(slot.area);

    // Activity Logging for Guide Slot Modifications
    await GuideActivityLog.create({
      guide: req.user._id,
      guideName: req.user.username,
      slotId: slot.slotId,
      previousStatus: oldStatus,
      newStatus: status,
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Slot status updated successfully',
      slot
    });
  } catch (error) {
    next(error);
  }
};
