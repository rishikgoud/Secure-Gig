import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Proposal } from '../models/Proposal';
import JobPost, { IJobPost } from '../models/JobPost';
import User, { IUser } from '../models/User';
import { AppError } from '../utils/errors';
import { proposalSchema, updateProposalStatusSchema } from '../validation/schemas';
import { validateJobExists, validateUniqueProposal, logRequest } from '../middleware/validation';
import { logger } from '../utils/logger';
import { z } from 'zod';

const queryProposalsSchema = z.object({
  jobId: z.string().optional(),
  freelancerId: z.string().optional(),
  status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn', 'shortlisted']).optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => Math.min(parseInt(val) || 20, 100)).optional(),
  sortBy: z.enum(['submittedAt', 'updatedAt', 'proposedRate.amount']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Create a new proposal
export const createProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('=== PROPOSAL CREATION START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', req.headers);
    
    // For hackathon: Use mock user if no authentication
    let userId = req.user?._id;
    let userRole = req.user?.role;
    
    if (!userId) {
      // Mock user for development/hackathon
      userId = '507f1f77bcf86cd799439011';
      userRole = 'freelancer';
      console.log('Using mock user for proposal creation:', userId);
    }
    
    logger.info('Proposal creation request', {
      userId,
      jobId: req.body.jobId,
      userRole
    });
    
    // Simplified validation for hackathon - just check required fields
    const { jobId, coverLetter, proposedRate, timeline, experience } = req.body;
    
    if (!jobId) {
      throw new AppError('jobId is required', 400);
    }
    if (!coverLetter) {
      throw new AppError('coverLetter is required', 400);
    }
    if (!proposedRate || !proposedRate.amount) {
      throw new AppError('proposedRate.amount is required', 400);
    }
    if (!timeline) {
      throw new AppError('timeline is required', 400);
    }
    
    console.log('Basic validation passed');
    
    // Verify job exists
    const job = await JobPost.findById(jobId);
    if (!job) {
      console.log('Job not found:', jobId);
      throw new AppError('Job not found', 404);
    }

    console.log('Found job:', job._id, job.title, 'Status:', job.status);

    // Check if freelancer already applied to this job
    const existingProposal = await Proposal.findOne({
      jobId: jobId,
      freelancerId: userId,
      isActive: true
    });

    if (existingProposal) {
      throw new AppError('You have already submitted a proposal for this job', 409);
    }

    // Create simplified proposal data
    const proposalData = {
      jobId: jobId,
      freelancerId: userId,
      coverLetter: coverLetter,
      proposedRate: {
        amount: Number(proposedRate.amount),
        currency: proposedRate.currency || 'AVAX',
        type: proposedRate.type || 'fixed'
      },
      timeline: {
        duration: Number(timeline.duration || timeline),
        unit: timeline.unit || 'weeks',
        startDate: timeline.startDate ? new Date(timeline.startDate) : undefined
      },
      experience: experience || coverLetter, // Use coverLetter as fallback
      portfolioLinks: req.body.portfolioLinks || [],
      status: 'pending',
      isActive: true
    };

    console.log('Creating proposal with data:', JSON.stringify(proposalData, null, 2));
    
    const proposal = new Proposal(proposalData);
    await proposal.save();
    console.log('Proposal saved successfully:', proposal._id);

    // Populate proposal with job details
    await proposal.populate([
      {
        path: 'jobId',
        select: 'title budget category clientId'
      }
    ]);

    logger.info('Proposal created successfully', {
      proposalId: proposal._id,
      jobId: job._id,
      freelancerId: userId
    });

    res.status(201).json({
      success: true,
      message: 'Proposal submitted successfully',
      data: {
        id: proposal._id,
        _id: proposal._id,
        jobId: proposal.jobId,
        freelancerId: proposal.freelancerId,
        coverLetter: proposal.coverLetter,
        proposedRate: proposal.proposedRate,
        timeline: proposal.timeline,
        status: proposal.status,
        submittedAt: proposal.submittedAt
      }
    });

  } catch (error) {
    console.error('=== PROPOSAL CREATION ERROR ===');
    console.error('Error:', error);
    
    if (error instanceof AppError) {
      logger.warn('Proposal creation failed', { message: error.message });
      res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
      return;
    }

    logger.error('Unexpected error creating proposal', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    });
  }
};

// Get proposals with filtering and pagination
export const getProposals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('=== GET PROPOSALS START ===');
    console.log('Route params:', req.params);
    console.log('Query params:', req.query);
    
    // For hackathon: Use mock user if no authentication
    let userId = req.user?._id || '507f1f77bcf86cd799439011';
    let userRole = req.user?.role || 'freelancer';
    
    // Determine the query type based on route parameters
    const { jobId, userId: paramUserId, freelancerId } = req.params;
    
    logger.info('Getting proposals', { 
      userId, 
      userRole, 
      routeParams: req.params,
      query: req.query 
    });

    // Validate query parameters
    const {
      status,
      page = 1,
      limit = 20,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = queryProposalsSchema.parse(req.query);

    // Build query based on route and parameters
    let matchQuery: any = { isActive: true };

    if (jobId) {
      // GET /api/proposals/job/:jobId - Get proposals for a specific job
      console.log('Getting proposals for job:', jobId);
      matchQuery.jobId = new mongoose.Types.ObjectId(jobId);
    } else if (paramUserId || freelancerId) {
      // GET /api/proposals/user/:userId or /api/proposals/freelancer/:freelancerId
      const targetUserId = paramUserId || freelancerId;
      console.log('Getting proposals for user:', targetUserId);
      matchQuery.freelancerId = new mongoose.Types.ObjectId(targetUserId);
    } else {
      // GET /api/proposals - Get all proposals (with role-based filtering)
      console.log('Getting all proposals for user role:', userRole);
      if (userRole === 'freelancer') {
        matchQuery.freelancerId = new mongoose.Types.ObjectId(userId);
      } else if (userRole === 'client') {
        // Get all proposals for client's jobs
        const clientJobs = await JobPost.find({ clientId: userId }).select('_id');
        if (clientJobs.length > 0) {
          matchQuery.jobId = { $in: clientJobs.map((job: any) => job._id) };
        } else {
          // No jobs found, return empty result
          res.json({
            success: true,
            data: {
              proposals: [],
              pagination: {
                page,
                limit,
                totalPages: 0,
                totalCount: 0,
                hasNext: false,
                hasPrev: false
              }
            }
          });
          return;
        }
      }
    }

    // Apply status filter
    if (status) {
      matchQuery.status = status;
    }

    console.log('Match query:', JSON.stringify(matchQuery, null, 2));

    // Build sort object
    const sortQuery: any = {};
    sortQuery[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get proposals with population
    const skip = (page - 1) * limit;
    
    const [proposals, totalCount] = await Promise.all([
      Proposal.find(matchQuery)
        .populate({
          path: 'jobId',
          select: 'title description budget category deadline skills clientId status'
        })
        .populate({
          path: 'freelancerId',
          select: 'name email profile.avatar profile.bio profile.skills ratings'
        })
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Proposal.countDocuments(matchQuery)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    console.log(`Found ${proposals.length} proposals out of ${totalCount} total`);

    logger.info('Proposals fetched successfully', {
      totalCount,
      page,
      limit,
      filters: matchQuery
    });

    res.json({
      success: true,
      data: {
        proposals: proposals.map(proposal => ({
          ...proposal,
          id: proposal._id,
          _id: proposal._id
        })),
        pagination: {
          page,
          limit,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error: unknown) {
    console.error('=== GET PROPOSALS ERROR ===');
    console.error('Error fetching proposals:', error instanceof Error ? error.message : 'Unknown error');
    next(error);
  }
};

// Get single proposal by ID
export const getProposalById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // TODO: Replace with proper authentication when auth middleware is integrated
    const userId = (req.user as any)?._id || '507f1f77bcf86cd799439011'; // Mock ObjectId
    const userRole = (req.user as any)?.role || 'freelancer'; // Default to freelancer for testing
    const proposalId = req.params.id;

    logger.info('Getting proposal by ID', { userId, userRole, proposalId });

    if (!mongoose.Types.ObjectId.isValid(proposalId)) {
      throw new AppError('Invalid proposal ID', 400);
    }

    const proposal = await Proposal.findById(proposalId)
      .populate({
        path: 'jobId',
        select: 'title description budget category deadline skills client status'
      })
      .populate({
        path: 'freelancerId',
        select: 'name email profile.avatar profile.bio profile.skills profile.hourlyRate ratings isVerified'
      });

    if (!proposal || !proposal.isActive) {
      throw new AppError('Proposal not found', 404);
    }

    // Check permissions
    if (userRole === 'freelancer' && proposal.freelancerId.toString() !== userId.toString()) {
      throw new AppError('Access denied', 403);
    }

    if (userRole === 'client') {
      const job = await JobPost.findById(proposal.jobId);
      if (!job || job.clientId.toString() !== userId.toString()) {
        throw new AppError('Access denied', 403);
      }
    }

    logger.info('Proposal retrieved successfully', {
      proposalId,
      userId,
      userRole
    });

    res.json({
      success: true,
      data: proposal
    });

  } catch (error: unknown) {
    console.error('Error fetching proposal by ID:', error instanceof Error ? error.message : 'Unknown error');
    next(error);
  }
};

// Update proposal status (clients only)
export const updateProposalStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // TODO: Replace with proper authentication when auth middleware is integrated
    const userId = (req.user as any)?._id || '507f1f77bcf86cd799439011'; // Mock ObjectId
    const userRole = (req.user as any)?.role || 'client'; // Default to client for testing
    const proposalId = req.params.id;

    logger.info('Updating proposal status', { userId, userRole, proposalId, body: req.body });

    if (!mongoose.Types.ObjectId.isValid(proposalId)) {
      throw new AppError('Invalid proposal ID', 400);
    }

    // Validate request body
    const { status, clientResponse } = updateProposalStatusSchema.parse(req.body);

    const proposal = await Proposal.findById(proposalId);
    if (!proposal || !proposal.isActive) {
      throw new AppError('Proposal not found', 404);
    }

    // Verify client owns the job
    const job = await JobPost.findById(proposal.jobId);
    if (!job || job.clientId.toString() !== userId.toString()) {
      throw new AppError('Access denied', 403);
    }

    // Update proposal
    proposal.status = status;
    if (clientResponse) {
      proposal.clientResponse = {
        message: clientResponse.message,
        respondedAt: new Date()
      };
    }
    await proposal.save();

    // Populate for response
    await proposal.populate([
      {
        path: 'jobId',
        select: 'title budget category'
      },
      {
        path: 'freelancerId',
        select: 'name profile.avatar'
      }
    ]);

    // Broadcast status update to freelancer
    try {
      const { getSocketManager } = await import('../services/socketManager');
      const socketManager = getSocketManager();
      
      if (socketManager) {
        socketManager.broadcastProposalStatusUpdate({
          proposalId: proposal._id,
          jobId: job._id,
          jobTitle: job.title,
          freelancerId: proposal.freelancerId,
          status: proposal.status,
          clientResponse: proposal.clientResponse
        });
      }
    } catch (socketError) {
      console.error('Socket manager not available:', socketError);
    }

    logger.info('Proposal status updated successfully', {
      proposalId,
      newStatus: status,
      clientId: userId
    });

    res.json({
      success: true,
      message: 'Proposal status updated successfully',
      data: proposal
    });

  } catch (error: unknown) {
    console.error('Error updating proposal status:', error instanceof Error ? error.message : 'Unknown error');
    next(error);
  }
};

// Withdraw proposal (freelancers only)
export const withdrawProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // TODO: Replace with proper authentication when auth middleware is integrated
    const userId = (req.user as any)?._id || '507f1f77bcf86cd799439011'; // Mock ObjectId
    const userRole = (req.user as any)?.role || 'freelancer'; // Default to freelancer for testing
    const proposalId = req.params.id;

    logger.info('Withdrawing proposal', { userId, userRole, proposalId });

    if (!mongoose.Types.ObjectId.isValid(proposalId)) {
      throw new AppError('Invalid proposal ID', 400);
    }

    const proposal = await Proposal.findById(proposalId);
    if (!proposal || !proposal.isActive) {
      throw new AppError('Proposal not found', 404);
    }

    // Verify freelancer owns the proposal
    if (proposal.freelancerId.toString() !== userId.toString()) {
      throw new AppError('Access denied', 403);
    }

    // Can only withdraw pending or shortlisted proposals
    if (!['pending', 'shortlisted'].includes(proposal.status)) {
      throw new AppError('Cannot withdraw proposal with current status', 400);
    }

    // Update proposal status
    proposal.status = 'withdrawn';
    await proposal.save();

    logger.info('Proposal withdrawn successfully', {
      proposalId,
      freelancerId: userId
    });

    res.json({
      success: true,
      message: 'Proposal withdrawn successfully'
    });

  } catch (error: unknown) {
    console.error('Error withdrawing proposal:', error instanceof Error ? error.message : 'Unknown error');
    next(error);
  }
};

// Get proposal statistics
export const getProposalStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // TODO: Replace with proper authentication when auth middleware is integrated
    const userId = (req.user as any)?._id || '507f1f77bcf86cd799439011'; // Mock ObjectId
    const userRole = (req.user as any)?.role || 'freelancer'; // Default to freelancer for testing

    logger.info('Getting proposal stats', { userId, userRole });

    let matchQuery: any = { isActive: true };

    if (userRole === 'freelancer') {
      matchQuery.freelancerId = new mongoose.Types.ObjectId(userId);
    } else if (userRole === 'client') {
      // Get client's job IDs
      const clientJobs = await JobPost.find({ clientId: userId }).select('_id');
      matchQuery.jobId = { $in: clientJobs.map(job => job._id) };
    } else {
      throw new AppError('Invalid user role', 403);
    }

    // Aggregate pipeline to get proposal stats by status
    const pipeline = [
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$proposedRate.amount' }
        }
      }
    ];

    const stats = await Proposal.aggregate(pipeline);
    const totalProposals = await Proposal.countDocuments(matchQuery);

    // Format stats for response
    const formattedStats = {
      total: totalProposals,
      byStatus: stats.reduce((acc: any, stat: any) => {
        acc[stat._id] = {
          count: stat.count,
          totalValue: stat.totalValue
        };
        return acc;
      }, {})
    };

    logger.info('Proposal statistics retrieved', {
      userId,
      userRole,
      totalProposals
    });

    res.json({
      success: true,
      data: formattedStats
    });

  } catch (error: unknown) {
    console.error('Error fetching proposal stats:', error instanceof Error ? error.message : 'Unknown error');
    next(error);
  }
};

// Get proposals for client's jobs (for escrow integration)
export const getClientJobProposals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const clientId = req.user.id;
    const query = queryProposalsSchema.parse(req.query);

    // Find all jobs posted by this client
    const clientJobs = await JobPost.find({ clientId }).select('_id');
    const jobIds = clientJobs.map(job => job._id);

    if (jobIds.length === 0) {
      return res.json({
        success: true,
        data: {
          proposals: [],
          pagination: {
            page: query.page || 1,
            limit: query.limit || 20,
            totalPages: 0,
            totalCount: 0,
            hasNext: false,
            hasPrev: false
          }
        }
      });
    }

    // Build filter for proposals on client's jobs
    const filter: any = {
      jobId: { $in: jobIds },
      status: query.status || 'accepted' // Default to accepted proposals for escrow
    };

    // Build sort options
    const sortField = query.sortBy || 'submittedAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortOrder };

    // Calculate pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Execute query with population
    const [proposals, totalCount] = await Promise.all([
      Proposal.find(filter)
        .populate('jobId', 'title description budget category status clientId')
        .populate('jobId.clientId', 'name email profile.avatar ratings.average isVerified')
        .populate('freelancerId', 'name email profile ratings.average isVerified')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Proposal.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    logger.info(`Retrieved ${proposals.length} proposals for client ${clientId}`, {
      clientId,
      filter,
      totalCount
    });

    return res.json({
      success: true,
      data: {
        proposals,
        pagination: {
          page,
          limit,
          totalPages,
          totalCount,
          hasNext,
          hasPrev
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching client job proposals:', error as Record<string, any>);
    next(error);
  }
};
