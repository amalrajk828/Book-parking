import Booking from '../models/Booking.js';

// @desc    Verify reservation by Booking ID
// @route   GET /api/reservations/verify/:bookingId
// @access  Private (Guide / Admin)
export const verifyReservation = async (req, res, next) => {
  try {
    const rawBookingId = req.params.bookingId;
    
    // Debug logging for query lifecycle
    console.log(`[BACKEND DEBUG] Ticket Verification triggered for Booking ID input: "${rawBookingId}"`);
    
    if (!rawBookingId) {
      console.log('[BACKEND DEBUG] Verification failed: Booking ID parameter is missing.');
      return res.status(400).json({ success: false, message: 'Please provide a Booking ID' });
    }

    // Trim whitespace and convert to uppercase for casing safety
    const cleanBookingId = rawBookingId.trim().toUpperCase();
    console.log(`[BACKEND DEBUG] Casing normalized and whitespace trimmed: "${cleanBookingId}"`);

    // Perform query with populated sub-collections
    const reservation = await Booking.findOne({ bookingId: cleanBookingId })
      .populate('area')
      .populate('slot')
      .populate('user', 'username email phone');

    if (!reservation) {
      console.log(`[BACKEND DEBUG] Query complete: Booking ID "${cleanBookingId}" NOT found in MongoDB.`);
      return res.status(404).json({ success: false, message: `Reservation with Booking ID '${cleanBookingId}' not found.` });
    }

    console.log(`[BACKEND DEBUG] Query success: Booking ID "${cleanBookingId}" found. Slot ID: ${reservation.slot?.slotId || 'A1'}. Status: ${reservation.status}.`);

    res.status(200).json({
      success: true,
      reservation,
    });
  } catch (error) {
    console.error(`[BACKEND DEBUG] Exception caught during Booking verification query: ${error.message}`, error);
    next(error);
  }
};
