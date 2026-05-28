import express from 'express';
import {
  createParkingArea,
  getParkingAreas,
  getParkingAreaById,
  updateParkingArea,
  deleteParkingArea,
  assignGuide,
  getUniqueCities
} from '../controllers/parkingAreaController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getParkingAreas);
router.get('/cities', getUniqueCities);
router.get('/:id', getParkingAreaById);

// Admin-only protected routes
router.post('/', protect, authorize('admin'), createParkingArea);
router.put('/:id', protect, authorize('admin'), updateParkingArea);
router.delete('/:id', protect, authorize('admin'), deleteParkingArea);
router.put('/:id/assign-guide', protect, authorize('admin'), assignGuide);

export default router;
