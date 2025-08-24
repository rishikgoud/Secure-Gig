import { Request, Response, NextFunction } from 'express';
import JobPost, { IJobPost } from '../models/JobPost';
import { IUser } from '../models/User';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import { getSocketManager } from '../config/socket';
import { jobSearchSchema, jobPostSchema, jobPostUpdateSchema } from '../validation/schemas';

// Extend Request interface for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// Create new job post
export const createJobPost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Validate input
  const validatedData = jobPostSchema.parse(req.body);
  
  // Ensure user is a client
  if (req.user!.role !== 'client') {
    return next(new AppError('Only clients can create job posts', 403));
  }

  // Create job post with automatic MongoDB ObjectId generation
  const jobPost = await JobPost.create({
    ...validatedData,
    clientId: req.user!._id
  });

  // Ensure the job has a valid _id (MongoDB automatically generates this)
  if (!jobPost._id) {
    logger.error('Job post created without _id', {
      jobPost: jobPost.toObject(),
      clientId: req.user!._id
    });
    return next(new AppError('Failed to generate job ID', 500));
  }

  // Populate client information
  await jobPost.populate('clientId', 'name profile.avatar ratings.average isVerified');

  logger.info('Job post created successfully', {
    jobId: jobPost._id,
    title: jobPost.title,
    clientId: req.user!._id,
    clientEmail: req.user!.email,
    budget: jobPost.budget,
    skills: jobPost.skills
  });

  // Broadcast new job to all connected freelancers in real-time
  try {
    const socketManager = getSocketManager();
    const user = req.user as any;
    
    const jobData = {
      _id: jobPost._id,
      title: jobPost.title,
      description: jobPost.description,
      budget: jobPost.budget,
      deadline: jobPost.timeline?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      skills: jobPost.skills,
      category: jobPost.category,
      client: {
        name: user.name,
        rating: user.ratings?.average
      },
      createdAt: jobPost.createdAt,
      status: jobPost.status
    };

    // Broadcast to all freelancers
    socketManager.broadcastNewJob(jobData);

    logger.info('Job broadcasted to freelancers', {
      jobId: jobPost._id,
      title: jobPost.title,
      clientId: user._id
    });
  } catch (error: any) {
    // Don't fail the request if socket broadcast fails
    logger.warn('Failed to broadcast job to freelancers', {
      jobId: jobPost._id,
      error: error.message
    });
  }

  res.status(201).json({
    status: 'success',
    data: {
      jobPost
    }
  });
});

// Get all job posts (public endpoint for freelancers)
export const getJobPosts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Use validated query from middleware to avoid IncomingMessage property issues
  const validatedQuery = (req as any).validatedQuery || req.query;
  const {
    page = 1,
    limit = 10,
    search,
    category,
    skills,
    budgetMin,
    budgetMax,
    budgetType,
    experienceLevel,
    locationType,
    urgency,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = validatedQuery;

  // Build query for active, public jobs
  const query: any = { 
    status: { $in: ['active', 'draft'] }, // Include both active and draft jobs for now
    visibility: { $in: ['public', 'private'] } // Include all visibility for debugging
  };

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Skills filter
  if (skills && skills.length > 0) {
    query.skills = { $in: skills };
  }

  // Budget filters
  if (budgetMin !== undefined || budgetMax !== undefined || budgetType) {
    const budgetQuery: any = {};
    
    if (budgetMin !== undefined) {
      budgetQuery['budget.amount'] = { $gte: budgetMin };
    }
    
    if (budgetMax !== undefined) {
      budgetQuery['budget.amount'] = { 
        ...budgetQuery['budget.amount'],
        $lte: budgetMax 
      };
    }
    
    if (budgetType) {
      budgetQuery['budget.type'] = budgetType;
    }
    
    Object.assign(query, budgetQuery);
  }

  // Experience level filter
  if (experienceLevel) {
    query['requirements.experienceLevel'] = experienceLevel;
  }

  // Location type filter
  if (locationType) {
    query['location.type'] = locationType;
  }

  // Urgency filter
  if (urgency) {
    query.urgency = urgency;
  }

  // Build sort object
  const sort: any = {};
  
  // Handle text search score sorting
  if (search) {
    sort.score = { $meta: 'textScore' };
  }
  
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const jobPosts = await JobPost.find(query)
    .populate('clientId', 'name profile.avatar ratings.average isVerified createdAt')
    .sort(sort)
    .limit(limit)
    .skip((page - 1) * limit)
    .select('-__v');

  const total = await JobPost.countDocuments(query);

  // Increment view count for each job (in background)
  if (jobPosts.length > 0) {
    const jobIds = jobPosts.map(job => job._id);
    JobPost.updateMany(
      { _id: { $in: jobIds } },
      { $inc: { views: 1 } }
    ).exec(); // Don't await this
  }

  logger.info('Jobs fetched successfully', {
    total,
    returned: jobPosts.length,
    page,
    limit,
    query: JSON.stringify(query)
  });

  res.status(200).json({
    status: 'success',
    results: jobPosts.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      jobPosts
    }
  });
});

// Get single job post by ID
export const getJobPost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { jobId } = req.params;

  const jobPost = await JobPost.findById(jobId)
    .populate('clientId', 'name profile.avatar profile.location ratings.average isVerified createdAt')
    .populate('proposals.received', 'freelancerId proposedAmount status createdAt');

  if (!jobPost) {
    return next(new AppError('Job post not found', 404));
  }

  // Check if job is accessible
  const user = req.user as IUser;
  if (jobPost.visibility === 'private' && jobPost.clientId._id.toString() !== (user?._id as any)?.toString()) {
    return next(new AppError('This job post is private', 403));
  }

  // Increment view count
  jobPost.views += 1;
  await jobPost.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      jobPost
    }
  });
});

// Get client's own job posts
export const getMyJobPosts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { page = 1, limit = 10 } = req.query;
  const { status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  // Ensure user is a client
  if (req.user!.role !== 'client') {
    return next(new AppError('Only clients can access this endpoint', 403));
  }

  // Build query
  const query: any = { clientId: req.user!._id };
  
  if (status) {
    query.status = status;
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const jobPosts = await JobPost.find(query)
    .sort(sort)
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .select('-__v');

  const total = await JobPost.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: jobPosts.length,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    },
    data: {
      jobPosts
    }
  });
});

// Update job post
export const updateJobPost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { jobId } = req.params;
  
  // Validate input
  const validatedData = jobPostUpdateSchema.parse(req.body);

  // Find job post
  const jobPost = await JobPost.findById(jobId);
  
  if (!jobPost) {
    return next(new AppError('Job post not found', 404));
  }

  // Check ownership
  if (jobPost.clientId.toString() !== req.user!._id.toString()) {
    return next(new AppError('You can only update your own job posts', 403));
  }

  // Check if job can be updated
  if (jobPost.status === 'completed' || jobPost.status === 'cancelled') {
    return next(new AppError('Cannot update completed or cancelled job posts', 400));
  }

  // Update job post
  const updatedJobPost = await JobPost.findByIdAndUpdate(
    jobId,
    validatedData,
    {
      new: true,
      runValidators: true
    }
  ).populate('clientId', 'name profile.avatar ratings.average isVerified');

  // Broadcast job update to freelancers
  try {
    const socketManager = getSocketManager();
    socketManager.broadcastJobUpdate(updatedJobPost, 'updated');
  } catch (error: any) {
    logger.warn('Failed to broadcast job update', {
      jobId: updatedJobPost!._id,
      error: error.message
    });
  }

  logger.info(`Job post updated: ${updatedJobPost!.title} by ${(req.user as any).email}`);

  res.status(200).json({
    status: 'success',
    data: {
      jobPost: updatedJobPost
    }
  });
});

// Delete job post
export const deleteJobPost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { jobId } = req.params;

  // Find job post
  const jobPost = await JobPost.findById(jobId);
  
  if (!jobPost) {
    return next(new AppError('Job post not found', 404));
  }

  // Check ownership
  if (jobPost.clientId.toString() !== req.user!._id.toString()) {
    return next(new AppError('You can only delete your own job posts', 403));
  }

  // Check if job can be deleted
  if (jobPost.status === 'active' && jobPost.proposals.count > 0) {
    return next(new AppError('Cannot delete job posts with active proposals. Cancel the job instead.', 400));
  }

  // Delete job post
  await JobPost.findByIdAndDelete(jobId);

  // Broadcast job deletion to freelancers
  try {
    const socketManager = getSocketManager();
    socketManager.broadcastJobUpdate(jobPost, 'deleted');
  } catch (error: any) {
    logger.warn('Failed to broadcast job deletion', {
      jobId: jobPost._id,
      error: error.message
    });
  }

  logger.info(`Job post deleted: ${jobPost.title} by ${(req.user as any).email}`);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Update job status
export const updateJobStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { jobId } = req.params;
  const { status } = req.body;

  if (!status || !['draft', 'active', 'paused', 'completed', 'cancelled'].includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  // Find job post
  const jobPost = await JobPost.findById(jobId);
  
  if (!jobPost) {
    return next(new AppError('Job post not found', 404));
  }

  // Check ownership
  if (jobPost.clientId.toString() !== req.user!._id.toString()) {
    return next(new AppError('You can only update your own job posts', 403));
  }

  // Validate status transition
  const currentStatus = jobPost.status;
  const validTransitions: { [key: string]: string[] } = {
    'draft': ['active', 'cancelled'],
    'active': ['paused', 'completed', 'cancelled'],
    'paused': ['active', 'cancelled'],
    'completed': [], // Cannot change from completed
    'cancelled': [] // Cannot change from cancelled
  };

  if (!validTransitions[currentStatus].includes(status)) {
    return next(new AppError(`Cannot change status from ${currentStatus} to ${status}`, 400));
  }

  // Update status
  jobPost.status = status;
  await jobPost.save({ validateBeforeSave: false });

  // Broadcast status change to freelancers
  try {
    const socketManager = getSocketManager();
    socketManager.broadcastJobUpdate(jobPost, 'status_changed');
  } catch (error: any) {
    logger.warn('Failed to broadcast job status update', {
      jobId: jobPost._id,
      error: error.message
    });
  }

  logger.info(`Job post status updated: ${jobPost.title} from ${currentStatus} to ${status} by ${(req.user as any).email}`);

  res.status(200).json({
    status: 'success',
    data: {
      jobPost
    }
  });
});

// Get job post statistics
export const getJobStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { jobId } = req.params;

  // Find job post
  const jobPost = await JobPost.findById(jobId);
  
  if (!jobPost) {
    return next(new AppError('Job post not found', 404));
  }

  // Check ownership
  if (jobPost.clientId.toString() !== req.user!._id.toString()) {
    return next(new AppError('You can only view stats for your own job posts', 403));
  }

  // Calculate stats
  const stats = {
    views: jobPost.views,
    applications: jobPost.applications,
    proposals: jobPost.proposals.count,
    daysActive: Math.ceil((Date.now() - jobPost.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
    averageProposalAmount: 0, // Would be calculated from proposals collection
    responseRate: 0 // Would be calculated based on client responses
  };

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

// Get featured job posts
export const getFeaturedJobs = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { limit = 6 } = req.query;

  const featuredJobs = await JobPost.find({
    status: 'active',
    visibility: 'public',
    featured: true
  })
    .populate('clientId', 'name profile.avatar ratings.average isVerified')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .select('-__v');

  res.status(200).json({
    status: 'success',
    results: featuredJobs.length,
    data: {
      jobPosts: featuredJobs
    }
  });
});

// Get job categories with counts
export const getJobCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const categories = await JobPost.aggregate([
    {
      $match: {
        status: 'active',
        visibility: 'public'
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgBudget: { $avg: '$budget.amount' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      categories
    }
  });
});

// Get popular skills
export const getPopularSkills = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { limit = 20 } = req.query;

  const skills = await JobPost.aggregate([
    {
      $match: {
        status: 'active',
        visibility: 'public'
      }
    },
    {
      $unwind: '$skills'
    },
    {
      $group: {
        _id: '$skills',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: Number(limit)
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      skills
    }
  });
});
