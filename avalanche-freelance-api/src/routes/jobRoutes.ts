import express from 'express';
import {
  createJobPost,
  getJobPosts,
  getJobPost,
  getMyJobPosts,
  updateJobPost,
  deleteJobPost,
  updateJobStatus,
  getJobStats,
  getFeaturedJobs,
  getJobCategories,
  getPopularSkills
} from '../controllers/jobController';
import { protect, restrictTo } from '../controllers/authController';
import { validate, validateQuery } from '../middleware/errorHandler';
import { jobPostSchema, jobPostUpdateSchema, jobSearchSchema } from '../validation/schemas';

const router = express.Router();

// Public routes
router.get('/', validateQuery(jobSearchSchema), getJobPosts);
router.get('/featured', getFeaturedJobs);
router.get('/categories', getJobCategories);
router.get('/skills/popular', getPopularSkills);
router.get('/:jobId', getJobPost);

// Protected routes
router.use(protect);

// Client-only routes
router.post('/', restrictTo('client'), validate(jobPostSchema), createJobPost);
router.get('/my/posts', restrictTo('client'), getMyJobPosts);
router.patch('/:jobId', restrictTo('client'), validate(jobPostUpdateSchema), updateJobPost);
router.delete('/:jobId', restrictTo('client'), deleteJobPost);
router.patch('/:jobId/status', restrictTo('client'), updateJobStatus);
router.get('/:jobId/stats', restrictTo('client'), getJobStats);

export default router;
