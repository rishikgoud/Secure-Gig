import express from 'express';
import {
  signup,
  login,
  logout,
  protect,
  getMe,
  updatePassword,
  deactivateAccount,
  verifyEmail,
  getUserStats
} from '../controllers/authController';
import { validate } from '../middleware/errorHandler';
import { signupSchema, loginSchema } from '../validation/schemas';

const router = express.Router();

// Public routes
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);

// Protected routes (require authentication)
router.use(protect); // All routes after this middleware require authentication

router.get('/me', getMe);
router.get('/stats', getUserStats);
router.patch('/update-password', updatePassword);
router.delete('/deactivate', deactivateAccount);
router.patch('/verify-email/:token', verifyEmail);

export default router;
