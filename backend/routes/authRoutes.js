import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  createGuide, 
  forgotPassword, 
  resetPassword 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.post('/create-guide', protect, authorize('admin'), createGuide);

export default router;
