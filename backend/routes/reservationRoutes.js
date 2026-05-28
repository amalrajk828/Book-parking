import express from 'express';
import { verifyReservation } from '../controllers/reservationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Protected lookup accessible to Parking Guides and System Admins
router.get('/verify/:bookingId', protect, authorize('guide', 'admin'), verifyReservation);

export default router;
