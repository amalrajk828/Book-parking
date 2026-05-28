import express from 'express';
import { getBookingBySlot } from '../controllers/bookingController.js';
import { updateSlotStatus } from '../controllers/parkingSlotController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Retrieve active booking associated with selected slot ID (For guides/admins inspecting dashboard slots)
router.get('/:slotId/booking', protect, authorize('guide', 'admin'), getBookingBySlot);

// Update parking slot status safely (For guides/admins inspecting slot matrices)
router.put('/:id/status', protect, authorize('guide', 'admin'), updateSlotStatus);
router.patch('/:id/status', protect, authorize('guide', 'admin'), updateSlotStatus);

export default router;
