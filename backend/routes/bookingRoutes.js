import express from 'express';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  verifyQR,
  confirmCheckIn,
  confirmCheckOut,
  cancelBooking,
  getBookingsByUser
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Protected routes (User, Guide, Admin)
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);
router.get('/user/:userId', protect, getBookingsByUser);
router.get('/:id', protect, getBookingById);
router.post('/:id/cancel', protect, cancelBooking);

// Guide / Admin only routes
router.post('/verify-qr', protect, authorize('guide', 'admin'), verifyQR);
router.post('/:id/check-in', protect, authorize('guide', 'admin'), confirmCheckIn);
router.post('/:id/check-out', protect, authorize('guide', 'admin'), confirmCheckOut);

export default router;
