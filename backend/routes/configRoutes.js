import express from 'express';
import { getConfig, updateConfig } from '../controllers/configController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// GET /api/config (Public)
router.get('/', (req, res, next) => {
  console.log('[DEBUG] GET /api/config route hit');
  getConfig(req, res, next);
});

// PUT /api/config (Admin Only)
router.put('/', protect, authorize('admin'), (req, res, next) => {
  console.log('[DEBUG] PUT /api/config route hit by user:', req.user?._id || 'unknown');
  updateConfig(req, res, next);
});

export default router;
