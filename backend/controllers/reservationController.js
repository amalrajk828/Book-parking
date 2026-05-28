import Booking from '../models/Booking.js';

// @desc    Verify reservation by Booking ID
// @route   GET /api/reservations/verify/:bookingId
// @access  Private (Guide / Admin)
export const verifyReservation = async (req, res, next) => {
  try {
    const rawBookingId = req.params.bookingId;
    
    if (!rawBookingId) {
      return res.status(400).json({ success: false, message: 'Please provide a Booking ID' });
    }

    const cleanBookingId = rawBookingId.trim().toUpperCase();

    const reservation = await Booking.findOne({ bookingId: cleanBookingId })
      .populate('area')
      .populate('slot')
      .populate('user', 'username email phone');

    if (!reservation) {
      return res.status(404).json({ success: false, message: `Reservation with Booking ID '${cleanBookingId}' not found.` });
    }

    res.status(200).json({
      success: true,
      reservation,
    });
  } catch (error) {
    next(error);
  }
};
