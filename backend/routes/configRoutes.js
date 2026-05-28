console.log('[DEBUG] configRoutes file loading...');
import express from 'express';
import { getConfig, updateConfig } from '../controllers/configController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
console.log('[DEBUG] configRoutes imports loaded');

const router = express.Router();

// GET /api/config/test (Debug/Diagnostic)
router.get('/test', (req, res) => {
  console.log('[DEBUG] GET /api/config/test route hit');
  res.json({ message: 'Config route working' });
});

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
