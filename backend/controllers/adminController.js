import User from '../models/User.js';
import Booking from '../models/Booking.js';
import ParkingArea from '../models/ParkingArea.js';
import ParkingSlot from '../models/ParkingSlot.js';
import Payment from '../models/Payment.js';
import AdminActivityLog from '../models/AdminActivityLog.js';

// @desc    Get dashboard metrics & chart records
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalGuides = await User.countDocuments({ role: 'guide' });
    const totalBookings = await Booking.countDocuments({});
    const activeAreas = await ParkingArea.countDocuments({});
    
    // Revenue calculations
    const allBookings = await Booking.find({ status: { $in: ['confirmed', 'checked-in', 'checked-out'] } });
    const totalRevenue = allBookings.reduce((sum, b) => sum + (b.actualAmount || b.estimatedAmount || 0), 0);

    // Mock/Simulated daily revenue for charting (last 7 days)
    const dailyRevenue = [
      { date: 'Mon', revenue: totalRevenue * 0.12 },
      { date: 'Tue', revenue: totalRevenue * 0.15 },
      { date: 'Wed', revenue: totalRevenue * 0.11 },
      { date: 'Thu', revenue: totalRevenue * 0.18 },
      { date: 'Fri', revenue: totalRevenue * 0.22 },
      { date: 'Sat', revenue: totalRevenue * 0.14 },
      { date: 'Sun', revenue: totalRevenue * 0.08 }
    ];

    // Monthly revenue (current month & previous months)
    const monthlyRevenue = [
      { month: 'Jan', revenue: totalRevenue * 0.7 },
      { month: 'Feb', revenue: totalRevenue * 0.8 },
      { month: 'Mar', revenue: totalRevenue * 0.95 },
      { month: 'Apr', revenue: totalRevenue * 0.85 },
      { month: 'May', revenue: totalRevenue }
    ];

    // Slot usage statistics
    const totalSlotsCount = await ParkingSlot.countDocuments({});
    const availableSlotsCount = await ParkingSlot.countDocuments({ status: 'available' });
    const reservedSlotsCount = await ParkingSlot.countDocuments({ status: 'reserved' });
    const occupiedSlotsCount = await ParkingSlot.countDocuments({ status: 'occupied' });
    const expiredSlotsCount = await ParkingSlot.countDocuments({ status: 'expired' });

    const occupancyData = [
      { name: 'Available', value: availableSlotsCount },
      { name: 'Reserved', value: reservedSlotsCount },
      { name: 'Occupied', value: occupiedSlotsCount },
      { name: 'Expired', value: expiredSlotsCount }
    ];

    // Peak Hour Analysis (occupancy per hour of the day)
    const peakHours = [
      { hour: '08:00', bookings: 12 },
      { hour: '10:00', bookings: 25 },
      { hour: '12:00', bookings: 42 },
      { hour: '14:00', bookings: 38 },
      { hour: '16:00', bookings: 48 },
      { hour: '18:00', bookings: 35 },
      { hour: '20:00', bookings: 18 }
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalGuides,
        totalBookings,
        activeAreas,
        totalRevenue: Math.round(totalRevenue),
      },
      charts: {
        dailyRevenue,
        monthlyRevenue,
        occupancyData,
        peakHours,
        slotOverview: {
          total: totalSlotsCount,
          available: availableSlotsCount,
          reserved: reservedSlotsCount,
          occupied: occupiedSlotsCount,
          expired: expiredSlotsCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle block/unblock status of a user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
export const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot block an admin user' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.username} has been ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all guides list with their assigned areas
// @route   GET /api/admin/guides
// @access  Private/Admin
export const getGuides = async (req, res, next) => {
  try {
    const guides = await User.find({ role: 'guide' }).populate('assignedArea', 'name areaId').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: guides.length, guides });
  } catch (error) {
    next(error);
  }
};

// @desc    Get check-in / check-out logs of all bookings
// @route   GET /api/admin/logs
// @access  Private/Admin
export const getGuideLogs = async (req, res, next) => {
  try {
    // Check-in / check-out logs are recorded inside Booking models that have check-in times
    const logs = await Booking.find({ checkInTime: { $ne: null } })
      .populate('user', 'username email phone')
      .populate('area', 'name areaId')
      .populate('slot', 'slotId')
      .sort({ checkInTime: -1 });

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit specific parking slot status
// @route   PUT /api/admin/slots/:id
// @access  Private/Admin
export const updateSlotStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    slot.status = status || slot.status;
    await slot.save();

    res.status(200).json({
      success: true,
      message: 'Slot status updated successfully',
      slot,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin list)
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'username email phone')
      .populate('slot', 'slotId status')
      .populate('area', 'name areaId feePerHour')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details (Admin control)
// @route   PATCH /api/admin/user/:id
// @access  Private/Admin
export const adminUpdateUser = async (req, res, next) => {
  try {
    const { username, email, phone, isBlocked } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const previousValues = {
      username: user.username,
      email: user.email,
      phone: user.phone,
      isBlocked: user.isBlocked,
    };

    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (isBlocked !== undefined) user.isBlocked = isBlocked;

    await user.save();

    // Audit Log
    await AdminActivityLog.create({
      admin: req.user._id,
      adminName: req.user.username,
      action: `Admin updated customer profile: ${user.username}`,
      targetType: 'User',
      targetId: user._id.toString(),
      previousValues,
      newValues: {
        username: user.username,
        email: user.email,
        phone: user.phone,
        isBlocked: user.isBlocked,
      },
    });

    res.status(200).json({
      success: true,
      message: 'User details updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update guide details & assignment (Admin control)
// @route   PATCH /api/admin/guide/:id
// @access  Private/Admin
export const adminUpdateGuide = async (req, res, next) => {
  try {
    const { username, email, phone, assignedArea, isBlocked } = req.body;
    const guide = await User.findById(req.params.id);

    if (!guide || guide.role !== 'guide') {
      return res.status(404).json({ success: false, message: 'Parking Guide not found' });
    }

    const previousValues = {
      username: guide.username,
      email: guide.email,
      phone: guide.phone,
      assignedArea: guide.assignedArea,
      isBlocked: guide.isBlocked,
    };

    if (username !== undefined) guide.username = username;
    if (email !== undefined) guide.email = email;
    if (phone !== undefined) guide.phone = phone;
    if (assignedArea !== undefined) guide.assignedArea = assignedArea || null;
    if (isBlocked !== undefined) guide.isBlocked = isBlocked;

    await guide.save();

    // Populate assignment details for audit log name resolution
    const updatedGuide = await User.findById(guide._id).populate('assignedArea', 'name');

    // Audit Log
    await AdminActivityLog.create({
      admin: req.user._id,
      adminName: req.user.username,
      action: `Admin updated guide profile & assignment: ${guide.username}`,
      targetType: 'Guide',
      targetId: guide._id.toString(),
      previousValues,
      newValues: {
        username: guide.username,
        email: guide.email,
        phone: guide.phone,
        assignedArea: guide.assignedArea,
        isBlocked: guide.isBlocked,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Parking Guide details updated successfully',
      guide: updatedGuide,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Booking parameter override and data sync
// @route   PATCH /api/admin/booking/:id/status
// @access  Private/Admin
export const adminUpdateBookingStatus = async (req, res, next) => {
  try {
    const { 
      bookingId, slot: slotId, status, checkInTime, 
      checkOutTime, paymentStatus, vehicleDetails,
      extraCharge, extraMinutes, overtimeStatus, finalAmount
    } = req.body;

    const booking = await Booking.findById(req.params.id).populate('slot').populate('area');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const previousValues = {
      bookingId: booking.bookingId,
      slot: booking.slot ? booking.slot._id : null,
      status: booking.status,
      checkInTime: booking.checkInTime,
      checkOutTime: booking.checkOutTime,
      paymentStatus: booking.paymentStatus,
      vehicleDetails: { ...booking.vehicleDetails?.toObject() },
      extraCharges: booking.extraCharges,
      actualAmount: booking.actualAmount,
    };

    // Apply basic updates first
    if (bookingId !== undefined) booking.bookingId = bookingId.toUpperCase();
    if (paymentStatus !== undefined) booking.paymentStatus = paymentStatus;
    if (extraMinutes !== undefined) booking.extraMinutes = extraMinutes;
    if (extraCharge !== undefined) {
      booking.extraCharge = extraCharge;
      booking.extraCharges = extraCharge;
    }
    if (overtimeStatus !== undefined) booking.overtimeStatus = overtimeStatus;
    if (finalAmount !== undefined) {
      booking.finalAmount = finalAmount;
      booking.actualAmount = finalAmount;
    } else if (extraCharge !== undefined) {
      booking.finalAmount = booking.estimatedAmount + Number(extraCharge);
      booking.actualAmount = booking.finalAmount;
    }
    if (vehicleDetails !== undefined) {
      booking.vehicleDetails = {
        ...booking.vehicleDetails,
        ...vehicleDetails
      };
    }

    // Handle check-in & check-out override times
    if (checkInTime !== undefined) booking.checkInTime = checkInTime ? new Date(checkInTime) : null;
    if (checkOutTime !== undefined) booking.checkOutTime = checkOutTime ? new Date(checkOutTime) : null;

    // Handle slot reassignment
    if (slotId !== undefined && slotId !== (booking.slot ? booking.slot._id.toString() : '')) {
      const oldSlotId = booking.slot ? booking.slot._id : null;
      const newSlotId = slotId;

      const oldSlot = oldSlotId ? await ParkingSlot.findById(oldSlotId) : null;
      const newSlot = await ParkingSlot.findById(newSlotId);

      if (!newSlot) {
        return res.status(404).json({ success: false, message: 'Reassigned parking slot not found' });
      }

      // Ensure the slot is free unless it's the one we are occupying
      if (newSlot.status !== 'available' && newSlot.bookingDetails?.bookingId?.toString() !== booking._id.toString()) {
        return res.status(400).json({ success: false, message: `Slot ${newSlot.slotId} is already ${newSlot.status} by another user.` });
      }

      // 1. Release the old slot
      if (oldSlot) {
        oldSlot.status = 'available';
        oldSlot.bookingDetails = { bookingId: null };
        oldSlot.activeTiming = { start: null, end: null };
        oldSlot.vehicleDetails = { type: 'Car', number: '', owner: '' };
        await oldSlot.save();

        // Decrement old area occupancy / free slot
        const oldArea = await ParkingArea.findById(oldSlot.area);
        if (oldArea) {
          if (booking.status === 'checked-in') {
            oldArea.occupiedSlots = Math.max(0, oldArea.occupiedSlots - 1);
            oldArea.availableSlots = Math.min(oldArea.totalSlots, oldArea.availableSlots + 1);
          } else if (booking.status === 'confirmed' || booking.status === 'pending') {
            oldArea.availableSlots = Math.min(oldArea.totalSlots, oldArea.availableSlots + 1);
          }
          await oldArea.save();
        }
      }

      // 2. Lock the new slot
      newSlot.status = booking.status === 'checked-in' ? 'occupied' : (booking.status === 'confirmed' || booking.status === 'pending' ? 'reserved' : 'available');
      newSlot.bookingDetails = { bookingId: booking._id };
      newSlot.activeTiming = {
        start: booking.checkInTime || booking.createdAt,
        end: new Date(new Date(booking.checkInTime || booking.createdAt).getTime() + (booking.reservedHours * 60 * 60 * 1000))
      };
      newSlot.vehicleDetails = {
        type: booking.vehicleDetails?.type || 'Car',
        number: booking.vehicleDetails?.number || '',
        owner: booking.vehicleDetails?.owner || ''
      };
      await newSlot.save();

      // Adjust new area available counts
      const newArea = await ParkingArea.findById(newSlot.area);
      if (newArea) {
        if (booking.status === 'checked-in') {
          newArea.occupiedSlots = Math.min(newArea.totalSlots, newArea.occupiedSlots + 1);
          newArea.availableSlots = Math.max(0, newArea.availableSlots - 1);
        } else if (booking.status === 'confirmed' || booking.status === 'pending') {
          newArea.availableSlots = Math.max(0, newArea.availableSlots - 1);
        }
        await newArea.save();
      }

      booking.slot = newSlotId;
      booking.area = newSlot.area;
    }

    // Handle status transitions and automatic DB synchronizations
    if (status !== undefined && status !== booking.status) {
      const prevStatus = booking.status;
      const slot = await ParkingSlot.findById(booking.slot);
      const area = await ParkingArea.findById(booking.area);

      if (slot && area) {
        // Safe check-in transition
        if (status === 'checked-in') {
          if (prevStatus === 'checked-out') {
            // Revert checkout
            if (slot.status !== 'available' && slot.bookingDetails?.bookingId?.toString() !== booking._id.toString()) {
              return res.status(400).json({ success: false, message: 'Original slot is occupied by another booking. Please reassign slot first.' });
            }
            slot.status = 'occupied';
            slot.bookingDetails = { bookingId: booking._id };
            slot.vehicleDetails = {
              type: booking.vehicleDetails?.type || 'Car',
              number: booking.vehicleDetails?.number || '',
              owner: booking.vehicleDetails?.owner || ''
            };
            area.occupiedSlots = Math.min(area.totalSlots, area.occupiedSlots + 1);
            area.availableSlots = Math.max(0, area.availableSlots - 1);
            booking.checkOutTime = null;
            booking.extraCharges = 0;
            booking.actualAmount = booking.estimatedAmount;
          } else {
            // Standard check-in
            slot.status = 'occupied';
            area.occupiedSlots = Math.min(area.totalSlots, area.occupiedSlots + 1);
            booking.checkInTime = booking.checkInTime || new Date();
          }
        }
        // Safe revert-to-active transition
        else if (status === 'confirmed' || status === 'pending') {
          if (prevStatus === 'checked-in') {
            // Revert check-in
            slot.status = 'reserved';
            area.occupiedSlots = Math.max(0, area.occupiedSlots - 1);
            booking.checkInTime = null;
          } else if (prevStatus === 'checked-out') {
            // Revert checkout fully to active state
            if (slot.status !== 'available' && slot.bookingDetails?.bookingId?.toString() !== booking._id.toString()) {
              return res.status(400).json({ success: false, message: 'Original slot is occupied by another booking. Please reassign slot first.' });
            }
            slot.status = 'reserved';
            slot.bookingDetails = { bookingId: booking._id };
            slot.vehicleDetails = {
              type: booking.vehicleDetails?.type || 'Car',
              number: booking.vehicleDetails?.number || '',
              owner: booking.vehicleDetails?.owner || ''
            };
            area.availableSlots = Math.max(0, area.availableSlots - 1);
            booking.checkInTime = null;
            booking.checkOutTime = null;
            booking.extraCharges = 0;
            booking.actualAmount = booking.estimatedAmount;
          } else {
            slot.status = 'reserved';
          }
        }
        // Safe check-out transition
        else if (status === 'checked-out') {
          slot.status = 'available';
          slot.bookingDetails = { bookingId: null };
          slot.activeTiming = { start: null, end: null };
          slot.vehicleDetails = { type: 'Car', number: '', owner: '' };

          area.availableSlots = Math.min(area.totalSlots, area.availableSlots + 1);
          if (prevStatus === 'checked-in') {
            area.occupiedSlots = Math.max(0, area.occupiedSlots - 1);
          }
          booking.checkOutTime = booking.checkOutTime || new Date();
        }
        // Safe cancellation or expiration transitions
        else if (status === 'cancelled' || status === 'expired') {
          slot.status = 'available';
          slot.bookingDetails = { bookingId: null };
          slot.activeTiming = { start: null, end: null };
          slot.vehicleDetails = { type: 'Car', number: '', owner: '' };

          if (prevStatus === 'checked-in') {
            area.occupiedSlots = Math.max(0, area.occupiedSlots - 1);
            area.availableSlots = Math.min(area.totalSlots, area.availableSlots + 1);
          } else if (prevStatus === 'confirmed' || prevStatus === 'pending') {
            area.availableSlots = Math.min(area.totalSlots, area.availableSlots + 1);
          }
          booking.checkInTime = null;
          booking.checkOutTime = null;
        }

        await slot.save();
        await area.save();
      }
      booking.status = status;
    }

    // Automatically recalculate duration & overtime fee if booking is completed (checked-out) and checkIn/checkOut exist
    if (booking.status === 'checked-out' && booking.checkInTime && booking.checkOutTime) {
      const checkInMs = new Date(booking.checkInTime).getTime();
      const checkOutMs = new Date(booking.checkOutTime).getTime();
      
      if (checkOutMs > checkInMs) {
        const actualDurationMinutes = Math.max(0, Math.round((checkOutMs - checkInMs) / (1000 * 60)));
        const bookedDurationMinutes = booking.reservedHours * 60;
        const calcExtraMinutes = Math.max(0, actualDurationMinutes - bookedDurationMinutes);
        
        if (extraMinutes === undefined) {
          booking.extraMinutes = calcExtraMinutes;
        }
        
        if (extraCharge === undefined) {
          const hourlyExtraRate = booking.area.extraFeePerHour || booking.area.feePerHour;
          const perMinuteCharge = hourlyExtraRate / 60;
          const roundedExtraCharge = Math.round(calcExtraMinutes * perMinuteCharge);
          booking.extraCharge = roundedExtraCharge;
          booking.extraCharges = roundedExtraCharge;
          booking.overtimeStatus = roundedExtraCharge > 0 ? 'paid' : 'none';
          
          if (finalAmount === undefined) {
            booking.finalAmount = booking.estimatedAmount + roundedExtraCharge;
            booking.actualAmount = booking.finalAmount;
          }
        }
      }
    }

    await booking.save();

    // Populate for clean display
    const updatedBooking = await Booking.findById(booking._id)
      .populate('slot', 'slotId')
      .populate('area', 'name areaId')
      .populate('user', 'username email');

    // Audit Log
    await AdminActivityLog.create({
      admin: req.user._id,
      adminName: req.user.username,
      action: `Admin updated parameters for Booking: ${booking.bookingId}`,
      targetType: 'Booking',
      targetId: booking._id.toString(),
      previousValues,
      newValues: {
        bookingId: booking.bookingId,
        slot: booking.slot,
        status: booking.status,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        paymentStatus: booking.paymentStatus,
        vehicleDetails: booking.vehicleDetails,
        extraCharges: booking.extraCharges,
        actualAmount: booking.actualAmount,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Booking details updated successfully and synchronized across models.',
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Guide Mistake Quick Recovery Routine
// @route   PATCH /api/admin/booking/:id/recover
// @access  Private/Admin
export const adminRecoverBooking = async (req, res, next) => {
  try {
    const { targetStatus } = req.body;
    const booking = await Booking.findById(req.params.id).populate('slot').populate('area');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!['confirmed', 'checked-in'].includes(targetStatus)) {
      return res.status(400).json({ success: false, message: 'Allowed recovery targets are: confirmed or checked-in' });
    }

    const previousValues = {
      status: booking.status,
      checkInTime: booking.checkInTime,
      checkOutTime: booking.checkOutTime,
      extraCharges: booking.extraCharges,
      actualAmount: booking.actualAmount,
      slotStatus: booking.slot ? booking.slot.status : null,
    };

    const slot = booking.slot;
    const area = booking.area;

    if (!slot || !area) {
      return res.status(400).json({ success: false, message: 'Assigned parking slot or area is missing' });
    }

    // 1. RECOVERY: Revert mistaken Checkout (Move completed stay back to Live Checked-In)
    if (targetStatus === 'checked-in') {
      if (booking.status !== 'checked-out') {
        return res.status(400).json({ success: false, message: 'Checkout recovery is only applicable to completed bookings' });
      }

      // Check slot availability
      if (slot.status !== 'available' && slot.bookingDetails?.bookingId?.toString() !== booking._id.toString()) {
        return res.status(400).json({ success: false, message: `Accidental checkout recovery blocked: slot ${slot.slotId} is currently reserved or occupied by another booking. Please reassign the slot first.` });
      }

      // Sync Slot
      slot.status = 'occupied';
      slot.bookingDetails = { bookingId: booking._id };
      slot.vehicleDetails = {
        type: booking.vehicleDetails?.type || 'Car',
        number: booking.vehicleDetails?.number || '',
        owner: booking.vehicleDetails?.owner || ''
      };
      await slot.save();

      // Sync Area available counts
      area.occupiedSlots = Math.min(area.totalSlots, area.occupiedSlots + 1);
      area.availableSlots = Math.max(0, area.availableSlots - 1);
      await area.save();

      // Sync Booking details
      booking.status = 'checked-in';
      booking.checkOutTime = null;
      booking.extraCharges = 0;
      booking.actualAmount = booking.estimatedAmount;
      await booking.save();
    }
    // 2. RECOVERY: Revert mistaken Check-in (Move checked-in vehicle back to active reserved confirmed status)
    else if (targetStatus === 'confirmed') {
      if (booking.status !== 'checked-in') {
        return res.status(400).json({ success: false, message: 'Check-in recovery is only applicable to checked-in bookings' });
      }

      // Sync Slot
      slot.status = 'reserved';
      slot.bookingDetails = { bookingId: booking._id };
      await slot.save();

      // Sync Area available counts
      area.occupiedSlots = Math.max(0, area.occupiedSlots - 1);
      await area.save();

      // Sync Booking details
      booking.status = 'confirmed';
      booking.checkInTime = null;
      booking.checkOutTime = null;
      booking.extraCharges = 0;
      booking.actualAmount = booking.estimatedAmount;
      await booking.save();
    }

    // Populate for clean output
    const populatedBooking = await Booking.findById(booking._id)
      .populate('slot', 'slotId')
      .populate('area', 'name areaId')
      .populate('user', 'username email');

    // Audit Log entry
    await AdminActivityLog.create({
      admin: req.user._id,
      adminName: req.user.username,
      action: `Admin reverted Guide operation for Booking ${booking.bookingId} to status: ${targetStatus}`,
      targetType: 'Booking',
      targetId: booking._id.toString(),
      previousValues,
      newValues: {
        status: booking.status,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        extraCharges: booking.extraCharges,
        actualAmount: booking.actualAmount,
        slotStatus: slot.status,
      },
    });

    res.status(200).json({
      success: true,
      message: `Recovery successful: Booking status reverted to ${targetStatus} and slot allocation restored.`,
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin Audit Log trails
// @route   GET /api/admin/activity-logs
// @access  Private/Admin
export const getAdminActivityLogs = async (req, res, next) => {
  try {
    const logs = await AdminActivityLog.find({})
      .populate('admin', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
};
