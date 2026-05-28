import express from 'express';
import { getBookingBySlot, updateSlotStatusSafely } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Retrieve active booking associated with selected slot ID (For guides/admins inspecting dashboard slots)
router.get('/:slotId/booking', protect, authorize('guide', 'admin'), getBookingBySlot);

// Update parking slot status safely (For guides/admins inspecting slot matrices)
router.put('/:slotId/status', protect, authorize('guide', 'admin'), updateSlotStatusSafely);
router.patch('/:slotId/status', protect, authorize('guide', 'admin'), updateSlotStatusSafely);

export default router;
