import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// GET /api/settings (Public access)
router.get('/settings', getSettings);

// PUT /api/admin/settings (Admin-only update)
router.put('/admin/settings', protect, authorize('admin'), updateSettings);

export default router;
