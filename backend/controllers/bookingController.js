import Booking from '../models/Booking.js';
import GuideActivityLog from '../models/GuideActivityLog.js';
import mongoose from 'mongoose';
import ParkingArea from '../models/ParkingArea.js';
import ParkingSlot from '../models/ParkingSlot.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import { generateQR } from '../utils/qrGenerator.js';
import { sendBookingConfirmationEmail, sendExpiryAlertEmail, sendPaymentSuccessEmail } from '../utils/emailService.js';

// @desc    Create a new booking (reserve slot & process payment)
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res, next) => {
  try {
    const { areaId, slotId, vehicleDetails, reservedHours } = req.body;

    if (!areaId || !slotId || !vehicleDetails || !reservedHours) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const area = await ParkingArea.findById(areaId);
    if (!area) {
      return res.status(404).json({ success: false, message: 'Parking Area not found' });
    }

    const slot = await ParkingSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Parking Slot not found' });
    }

    if (slot.status !== 'available') {
      return res.status(400).json({ success: false, message: 'This slot is already booked or occupied' });
    }

    const estimatedAmount = reservedHours * area.feePerHour;
    const bookingUniqueId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;

    // Set timings
    const startTime = new Date();
    const endTime = new Date();
    endTime.setHours(startTime.getHours() + Number(reservedHours));

    // Generate high-fidelity QR Code content
    const qrData = JSON.stringify({
      bookingId: bookingUniqueId,
      userId: req.user._id,
      slotId: slot.slotId,
      areaId: area.areaId,
      reservedHours,
      estimatedAmount,
      status: 'confirmed'
    });
    
    const qrCodeBase64 = await generateQR(qrData);

    // Create the booking
    const booking = await Booking.create({
      bookingId: bookingUniqueId,
      user: req.user._id,
      slot: slot._id,
      area: area._id,
      vehicleDetails,
      reservedHours,
      estimatedAmount,
      actualAmount: estimatedAmount,
      status: 'confirmed', // Confirmed after payment
      paymentStatus: 'paid', // Mark payment status as paid
      qrCode: qrCodeBase64,
    });

    // Update slot status
    slot.status = 'reserved';
    slot.bookingDetails = { bookingId: booking._id };
    slot.activeTiming = { start: startTime, end: endTime };
    slot.vehicleDetails = {
      type: vehicleDetails.type,
      number: vehicleDetails.number,
      owner: vehicleDetails.owner
    };
    await slot.save();

    // Create Payment log
    const paymentUniqueId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
    await Payment.create({
      paymentId: paymentUniqueId,
      booking: booking._id,
      user: req.user._id,
      amount: estimatedAmount,
      status: 'completed',
      transactionId: paymentUniqueId,
    });

    // Update Area slots count
    area.availableSlots = Math.max(0, area.availableSlots - 1);
    await area.save();

    // Create Notification
    await Notification.create({
      user: req.user._id,
      message: `Booking ${bookingUniqueId} confirmed for slot ${slot.slotId} at ${area.name}`,
      type: 'booking_confirmation',
    });

    // Send Confirmation Email
    try {
      await sendBookingConfirmationEmail(req.user.email, {
        bookingId: bookingUniqueId,
        slotId: slot.slotId,
        estimatedAmount,
      });
      await sendPaymentSuccessEmail(req.user.email, {
        bookingId: bookingUniqueId,
        amount: estimatedAmount,
        transactionId: paymentUniqueId,
      });
    } catch (emailErr) {
      console.log('Nodemailer alert: email sending failed, logged to console.');
    }

    res.status(201).json({
      success: true,
      message: 'Booking completed successfully',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('area')
      .populate('slot')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details by id
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res, next) => {
  try {
    const isObjectId = mongoose.isValidObjectId(req.params.id);
    let query = isObjectId ? { _id: req.params.id } : { bookingId: req.params.id.toUpperCase() };

    const booking = await Booking.findOne(query)
      .populate('area')
      .populate('slot')
      .populate('user', 'username email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Security: Only user, guide, or admin can read booking
    if (req.user.role === 'user' && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify QR Code details (Parking Guide scanner API)
// @route   POST /api/bookings/verify-qr
// @access  Private/Guide
export const verifyQR = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Please provide a Booking ID' });
    }

    // Try finding by custom bookingId (e.g. BK-123456) or database ObjectId
    const booking = await Booking.findOne({
      $or: [
        { bookingId: bookingId.toUpperCase() },
        { _id: mongoose.isValidObjectId(bookingId) ? bookingId : null }
      ]
    })
    .populate('area')
    .populate('slot')
    .populate('user', 'username email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Invalid ticket details. Booking not found.' });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm User Arrival / Check-in
// @route   POST /api/bookings/:id/check-in
// @access  Private/Guide
export const confirmCheckIn = async (req, res, next) => {
  try {
    const isObjectId = mongoose.isValidObjectId(req.params.id);
    let query = isObjectId ? { _id: req.params.id } : { bookingId: req.params.id.toUpperCase() };

    const booking = await Booking.findOne(query).populate('slot').populate('area');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: `Cannot check-in booking with status '${booking.status}'` });
    }

    booking.status = 'checked-in';
    booking.checkInTime = new Date();
    await booking.save();

    // Update slot
    const slot = booking.slot;
    slot.status = 'occupied';
    await slot.save();

    // Update Area count
    const area = booking.area;
    area.occupiedSlots = Math.min(area.totalSlots, area.occupiedSlots + 1);
    await area.save();

    res.status(200).json({
      success: true,
      message: 'Check-in confirmed successfully. Slot is now occupied.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-out user & calculate overtime charges
// @route   POST /api/bookings/:id/check-out
// @access  Private/Guide
export const confirmCheckOut = async (req, res, next) => {
  try {
    const isObjectId = mongoose.isValidObjectId(req.params.id);
    let query = isObjectId ? { _id: req.params.id } : { bookingId: req.params.id.toUpperCase() };

    const booking = await Booking.findOne(query)
      .populate('slot')
      .populate('area')
      .populate('user', 'email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'checked-in') {
      return res.status(400).json({ success: false, message: 'User is not currently checked-in' });
    }

    if (!booking.checkInTime) {
      return res.status(400).json({ success: false, message: 'Check-in timestamp is missing. Cannot perform check-out.' });
    }

    let checkOutTime = new Date();
    // Support simulator override duration
    if (req.body.overrideDurationHours !== undefined) {
      const overrideHours = Number(req.body.overrideDurationHours);
      const checkInDate = new Date(booking.checkInTime);
      checkOutTime = new Date(checkInDate.getTime() + overrideHours * 60 * 60 * 1000);
    }

    const checkInMs = new Date(booking.checkInTime).getTime();
    const checkOutMs = checkOutTime.getTime();

    if (checkOutMs < checkInMs) {
      return res.status(400).json({ success: false, message: 'Check-out timestamp cannot be earlier than check-in timestamp.' });
    }

    booking.checkOutTime = checkOutTime;
    booking.status = 'checked-out';

    // Calculate billing details (Per-Minute extra charges)
    const actualDurationMinutes = Math.max(0, Math.round((checkOutMs - checkInMs) / (1000 * 60)));
    const bookedDurationMinutes = booking.reservedHours * 60;
    const extraMinutes = Math.max(0, actualDurationMinutes - bookedDurationMinutes);

    const hourlyExtraRate = booking.area.extraFeePerHour || booking.area.feePerHour;
    const perMinuteCharge = hourlyExtraRate / 60;
    const rawExtraCharge = extraMinutes * perMinuteCharge;
    const extraCharge = Math.round(rawExtraCharge);

    const finalAmount = booking.estimatedAmount + extraCharge;

    booking.extraMinutes = extraMinutes;
    booking.extraCharge = extraCharge;
    booking.extraCharges = extraCharge; // compatibility
    booking.finalAmount = finalAmount;
    booking.actualAmount = finalAmount; // compatibility
    booking.overtimeStatus = extraCharge > 0 ? 'paid' : 'none';

    await booking.save();

    // Release slot
    const slot = booking.slot;
    slot.status = 'available';
    slot.bookingDetails = { bookingId: null };
    slot.activeTiming = { start: null, end: null };
    slot.vehicleDetails = { type: 'Car', number: '', owner: '' };
    await slot.save();

    // Update Area count
    const area = booking.area;
    area.availableSlots = Math.min(area.totalSlots, area.availableSlots + 1);
    area.occupiedSlots = Math.max(0, area.occupiedSlots - 1);
    await area.save();

    // If extra charge is due, log transaction
    if (extraCharge > 0) {
      const extraTxnId = `TXN-OVER-${Math.floor(10000000 + Math.random() * 90000000)}`;
      await Payment.create({
        paymentId: extraTxnId,
        booking: booking._id,
        user: booking.user._id,
        amount: extraCharge,
        status: 'completed',
        transactionId: extraTxnId,
      });

      try {
        await sendPaymentSuccessEmail(booking.user.email, {
          bookingId: booking.bookingId,
          amount: extraCharge,
          transactionId: extraTxnId,
        });
      } catch (emailErr) {
        // ignore email errors
      }
    }

    res.status(200).json({
      success: true,
      message: 'Check-out completed and slot released successfully.',
      bookedDurationMinutes,
      actualDurationMinutes,
      extraMinutes,
      extraCharge,
      totalAmount: finalAmount,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   POST /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('slot').populate('area');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // User check
    if (req.user.role === 'user' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Can only cancel future bookings' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Release slot
    const slot = booking.slot;
    slot.status = 'available';
    slot.bookingDetails = { bookingId: null };
    slot.activeTiming = { start: null, end: null };
    slot.vehicleDetails = { type: 'Car', number: '', owner: '' };
    await slot.save();

    // Update Area count
    const area = booking.area;
    area.availableSlots = Math.min(area.totalSlots, area.availableSlots + 1);
    await area.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};



// @desc    Get user bookings
// @route   GET /api/bookings/user/:userId
// @access  Private
export const getBookingsByUser = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId })
      .populate('area')
      .populate('slot')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active booking for slot ID
// @route   GET /api/slots/:slotId/booking
// @access  Private (Guide / Admin)
export const getBookingBySlot = async (req, res, next) => {
  try {
    const slotId = req.params.slotId;

    const slot = await ParkingSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Parking slot not found.' });
    }

    let booking = null;
    if (slot.bookingDetails && slot.bookingDetails.bookingId) {
      booking = await Booking.findById(slot.bookingDetails.bookingId)
        .populate('area')
        .populate('slot')
        .populate('user', 'username email phone');
    }

    if (!booking) {
      // Find the active booking (confirmed, checked-in, or expired) associated with this slot ID
      booking = await Booking.findOne({
        slot: slotId,
        status: { $in: ['confirmed', 'checked-in', 'expired'] }
      })
      .populate('area')
      .populate('slot')
      .populate('user', 'username email phone');
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'No active booking found for this slot.' });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

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

// @desc    Update slot status safely (for guides/admins)
// @route   PUT/PATCH /api/slots/:slotId/status
// @access  Private (Guide / Admin)
export const updateSlotStatusSafely = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['available', 'reserved', 'occupied', 'expired', 'maintenance', 'blocked'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid slot status value.' });
    }

    const slot = await ParkingSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found.' });
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
      message: `Slot status updated from ${oldStatus} to ${status} successfully.`,
      slot
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details by QR Code lookup (Booking ID or ObjectId)
// @route   GET /api/bookings/qr/:bookingId
// @access  Private (Guide / Admin)
export const getBookingDetailsByQR = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Please provide a Booking ID or QR Token.' });
    }

    const booking = await Booking.findOne({
      $or: [
        { bookingId: bookingId.toUpperCase() },
        { _id: mongoose.isValidObjectId(bookingId) ? bookingId : null }
      ]
    })
    .populate('area')
    .populate('slot')
    .populate('user', 'username email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Ticket not found. Invalid QR code.' });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm QR check-in gate entry
// @route   PATCH /api/bookings/:id/checkin
// @access  Private (Guide / Admin)
export const checkInQR = async (req, res, next) => {
  try {
    const isObjectId = mongoose.isValidObjectId(req.params.id);
    let query = isObjectId ? { _id: req.params.id } : { bookingId: req.params.id.toUpperCase() };

    const booking = await Booking.findOne(query).populate('slot').populate('area');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Check-in invalid. Booking status is currently '${booking.status}'.`
      });
    }

    // Business Logic: Check if reservation expired before arrival
    const currentTime = new Date();
    const slot = booking.slot;
    if (slot && slot.activeTiming && slot.activeTiming.end && currentTime > new Date(slot.activeTiming.end)) {
      booking.status = 'expired';
      await booking.save();

      // Free slot
      slot.status = 'available';
      slot.bookingDetails = { bookingId: null };
      slot.activeTiming = { start: null, end: null };
      slot.vehicleDetails = { type: 'Car', number: '', owner: '' };
      await slot.save();

      // Sync Counts
      await syncParkingAreaCounts(slot.area);

      return res.status(400).json({
        success: false,
        message: 'Reservation has expired before arrival. Booking is now invalid and slot is freed.',
        booking
      });
    }

    booking.status = 'checked-in';
    booking.checkedIn = true;
    booking.checkInTime = new Date();
    await booking.save();

    // Update slot status
    if (slot) {
      slot.status = 'occupied';
      await slot.save();
    }

    // Dynamic Counts Sync
    await syncParkingAreaCounts(booking.area._id);

    res.status(200).json({
      success: true,
      message: 'Check-In gate entry successfully confirmed. Slot is now occupied.',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm QR checkout departure entry
// @route   PATCH /api/bookings/:id/checkout
// @access  Private (Guide / Admin)
export const checkOutQR = async (req, res, next) => {
  try {
    const isObjectId = mongoose.isValidObjectId(req.params.id);
    let query = isObjectId ? { _id: req.params.id } : { bookingId: req.params.id.toUpperCase() };

    const booking = await Booking.findOne(query)
      .populate('slot')
      .populate('area')
      .populate('user', 'email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'checked-in') {
      return res.status(400).json({ success: false, message: 'Check-out invalid. Customer is not currently checked-in.' });
    }

    if (!booking.checkInTime) {
      return res.status(400).json({ success: false, message: 'Check-in timestamp is missing. Cannot perform check-out.' });
    }

    const checkOutTime = new Date();
    const checkInMs = new Date(booking.checkInTime).getTime();
    const checkOutMs = checkOutTime.getTime();

    booking.checkOutTime = checkOutTime;
    booking.status = 'checked-out';
    booking.checkedOut = true;

    // Calculate billing details (Per-Minute extra charges)
    const actualDurationMinutes = Math.max(0, Math.round((checkOutMs - checkInMs) / (1000 * 60)));
    const bookedDurationMinutes = booking.reservedHours * 60;
    const extraMinutes = Math.max(0, actualDurationMinutes - bookedDurationMinutes);

    const hourlyExtraRate = booking.area.extraFeePerHour || booking.area.feePerHour;
    const perMinuteCharge = hourlyExtraRate / 60;
    const rawExtraCharge = extraMinutes * perMinuteCharge;
    const extraCharge = Math.round(rawExtraCharge);

    const finalAmount = booking.estimatedAmount + extraCharge;

    booking.extraMinutes = extraMinutes;
    booking.extraCharge = extraCharge;
    booking.extraCharges = extraCharge; // compatibility
    booking.finalAmount = finalAmount;
    booking.actualAmount = finalAmount; // compatibility
    booking.overtimeStatus = extraCharge > 0 ? 'paid' : 'none';

    await booking.save();

    // Release slot
    const slot = booking.slot;
    if (slot) {
      slot.status = 'available';
      slot.bookingDetails = { bookingId: null };
      slot.activeTiming = { start: null, end: null };
      slot.vehicleDetails = { type: 'Car', number: '', owner: '' };
      await slot.save();
    }

    // Dynamic Counts Sync
    await syncParkingAreaCounts(booking.area._id);

    // If extra charge is due, log transaction
    if (extraCharge > 0) {
      const extraTxnId = `TXN-OVER-${Math.floor(10000000 + Math.random() * 90000000)}`;
      await Payment.create({
        paymentId: extraTxnId,
        booking: booking._id,
        user: booking.user._id,
        amount: extraCharge,
        status: 'completed',
        transactionId: extraTxnId,
      });

      try {
        await sendPaymentSuccessEmail(booking.user.email, {
          bookingId: booking.bookingId,
          amount: extraCharge,
          transactionId: extraTxnId,
        });
      } catch (emailErr) {
        // ignore email errors
      }
    }

    res.status(200).json({
      success: true,
      message: 'Check-out completed and slot released successfully.',
      bookedDurationMinutes,
      actualDurationMinutes,
      extraMinutes,
      extraCharge,
      totalAmount: finalAmount,
      booking,
    });
  } catch (error) {
    next(error);
  }
};
