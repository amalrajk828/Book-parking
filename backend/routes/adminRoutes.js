import express from 'express';
import {
  getAnalytics,
  getUsers,
  toggleBlockUser,
  getGuides,
  getGuideLogs,
  updateSlotStatus,
  getAllBookings,
  adminUpdateUser,
  adminUpdateGuide,
  adminUpdateBookingStatus,
  adminRecoverBooking,
  getAdminActivityLogs
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes are restricted to logged-in Admins
router.use(protect);
router.use(authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.put('/users/:id/block', toggleBlockUser);
router.get('/guides', getGuides);
router.get('/logs', getGuideLogs);
router.put('/slots/:id', updateSlotStatus);

// New Super Admin Override Routes
router.get('/bookings', getAllBookings);
router.patch('/user/:id', adminUpdateUser);
router.patch('/guide/:id', adminUpdateGuide);
router.patch('/booking/:id/status', adminUpdateBookingStatus);
router.patch('/booking/:id/recover', adminRecoverBooking);
router.get('/activity-logs', getAdminActivityLogs);

export default router;
