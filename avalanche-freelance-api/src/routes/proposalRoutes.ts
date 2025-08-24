import { Router } from 'express';
import { 
  createProposal,
  getProposals,
  getProposalById,
  updateProposalStatus,
  withdrawProposal,
  getProposalStats
} from '../controllers/proposalController';
import { 
  validateObjectId, 
  validateJobExists, 
  validateUniqueProposal, 
  logRequest 
} from '../middleware/validation';

const router = Router();

// Note: Authentication middleware will be added when auth system is integrated

// Create a new proposal (freelancers only) - SIMPLIFIED FOR HACKATHON
router.post('/', 
  logRequest,
  createProposal
);

// Get proposals with filtering and pagination
router.get('/', logRequest, getProposals);

// Get proposals for a specific job (for clients)
router.get('/job/:jobId', 
  logRequest,
  validateObjectId('jobId'),
  getProposals
);

// Get proposals by user (for freelancers - "My Proposals")
router.get('/user/:userId', 
  logRequest,
  validateObjectId('userId'),
  getProposals
);

// Get freelancer's own proposals (legacy route)
router.get('/freelancer/:freelancerId', 
  logRequest,
  validateObjectId('freelancerId'),
  getProposals
);

// Get proposal statistics
router.get('/stats', getProposalStats);

// Get single proposal by ID
router.get('/:id', 
  logRequest,
  validateObjectId('id'),
  getProposalById
);

// Update proposal status (clients only)
router.patch('/:id/status', 
  logRequest,
  validateObjectId('id'),
  updateProposalStatus
);

// Withdraw proposal (freelancers only)
router.patch('/:id/withdraw', 
  logRequest,
  validateObjectId('id'),
  withdrawProposal
);

export default router;
