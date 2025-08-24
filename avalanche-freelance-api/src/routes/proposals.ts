import express from 'express';
import {
  createProposal,
  getProposals,
  getProposalById,
  updateProposalStatus,
  withdrawProposal,
  getProposalStats
} from '../controllers/proposalController';
import { authenticate, authorize } from '../middleware/auth';
// Remove validation imports for now - will implement inline validation

const router = express.Router();

/**
 * @route   POST /api/proposals
 * @desc    Create a new proposal (freelancers only)
 * @access  Private (Freelancer)
 */
router.post(
  '/',
  authenticate,
  authorize('freelancer'),
  createProposal
);

/**
 * @route   GET /api/proposals/my-proposals
 * @desc    Get current user's proposals
 * @access  Private (Freelancer)
 */
router.get(
  '/my-proposals',
  authenticate,
  authorize('freelancer'),
  async (req, res, next) => {
    // Add freelancerId to query params from authenticated user
    req.query.freelancerId = req.user!._id as string;
    next();
  },
  getProposals
);

/**
 * @route   GET /api/proposals/freelancer/:freelancerId
 * @desc    Get proposals by freelancer ID (for clients to view)
 * @access  Private (Client or Freelancer - with ownership check)
 */
router.get(
  '/freelancer/:freelancerId',
  authenticate,
  async (req, res, next) => {
    // Allow freelancers to view their own proposals or clients to view any
    if (req.user!.role === 'freelancer' && req.params.freelancerId !== req.user!._id) {
      res.status(403).json({
        success: false,
        message: 'Freelancers can only view their own proposals'
      });
      return;
    }
    next();
  },
  getProposals
);

/**
 * @route   GET /api/proposals/job/:jobId
 * @desc    Get proposals for a specific job (clients only)
 * @access  Private (Client)
 */
router.get(
  '/job/:jobId',
  authenticate,
  authorize('client'),
  async (req, res, next) => {
    req.query.jobId = req.params.jobId as string;
    next();
  },
  getProposals
);

/**
 * @route   GET /api/proposals/:id
 * @desc    Get proposal by ID
 * @access  Private (Freelancer who owns it or Client who owns the job)
 */
router.get(
  '/:id',
  authenticate,
  getProposalById
);

/**
 * @route   PATCH /api/proposals/:id/status
 * @desc    Update proposal status (clients only)
 * @access  Private (Client)
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize('client'),
  updateProposalStatus
);

/**
 * @route   PATCH /api/proposals/:id/withdraw
 * @desc    Withdraw proposal (freelancers only)
 * @access  Private (Freelancer who owns the proposal)
 */
router.patch(
  '/:id/withdraw',
  authenticate,
  authorize('freelancer'),
  withdrawProposal
);

/**
 * @route   GET /api/proposals/stats/freelancer
 * @desc    Get proposal statistics for current freelancer
 * @access  Private (Freelancer)
 */
router.get(
  '/stats/freelancer',
  authenticate,
  authorize('freelancer'),
  async (req, res, next) => {
    req.query.freelancerId = req.user!._id as string;
    next();
  },
  getProposalStats
);

/**
 * @route   GET /api/proposals/stats/job/:jobId
 * @desc    Get proposal statistics for a job (clients only)
 * @access  Private (Client)
 */
router.get(
  '/stats/job/:jobId',
  authenticate,
  authorize('client'),
  async (req, res, next) => {
    req.query.jobId = req.params.jobId as string;
    next();
  },
  getProposalStats
);

export default router;
