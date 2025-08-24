import express from 'express';
import {
  updateProfile,
  getUserProfile,
  searchUsers,
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  addExperience,
  addEducation,
  addReview,
  getDashboardData
} from '../controllers/userController';
import { protect, restrictTo } from '../controllers/authController';
import { validate, validateQuery } from '../middleware/errorHandler';
import { profileUpdateSchema, paginationSchema } from '../validation/schemas';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Profile management
router.patch('/profile', validate(profileUpdateSchema), updateProfile);
router.get('/profile/:userId', getUserProfile);
router.get('/dashboard', getDashboardData);

// User search (for finding freelancers/clients)
router.get('/search', validateQuery(paginationSchema), searchUsers);

// Portfolio management
router.post('/portfolio', addPortfolioItem);
router.patch('/portfolio/:portfolioId', updatePortfolioItem);
router.delete('/portfolio/:portfolioId', deletePortfolioItem);

// Experience management
router.post('/experience', addExperience);

// Education management
router.post('/education', addEducation);

// Reviews and ratings
router.post('/:userId/review', addReview);

export default router;
