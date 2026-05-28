import express from 'express';
import { getConfig, updateConfig } from '../controllers/configController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// GET /api/config (Public)
router.get('/', getConfig);

// PUT /api/config (Admin Only)
router.put('/', protect, authorize('admin'), updateConfig);

export default router;
