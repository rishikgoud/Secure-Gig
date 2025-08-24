import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

/**
 * Production-level MongoDB ObjectId validation middleware
 * Validates that provided IDs are valid MongoDB ObjectIds
 */
export const validateObjectId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    
    if (!id) {
      logger.warn(`Missing ${paramName} parameter in request`, {
        url: req.url,
        method: req.method,
        params: req.params
      });
      return next(new AppError(`${paramName} parameter is required`, 400));
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.warn(`Invalid ObjectId format for ${paramName}`, {
        id,
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent')
      });
      return next(new AppError(`Invalid ${paramName} format`, 400));
    }

    // Convert string to ObjectId for downstream use
    req.params[paramName] = new mongoose.Types.ObjectId(id).toString();
    
    logger.debug(`ObjectId validation passed for ${paramName}`, { id });
    next();
  };
};

/**
 * Validates multiple ObjectIds in request body
 */
export const validateObjectIds = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    fields.forEach(field => {
      const value = req.body[field];
      
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        errors.push(`Invalid ObjectId format for field: ${field}`);
        logger.warn(`Invalid ObjectId in request body`, {
          field,
          value,
          url: req.url,
          method: req.method
        });
      }
    });

    if (errors.length > 0) {
      return next(new AppError(`Validation failed: ${errors.join(', ')}`, 400));
    }

    next();
  };
};

/**
 * Ensures job exists before allowing operations
 */
export const validateJobExists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = req.body.jobId || req.params.jobId;
    
    if (!jobId) {
      return next(new AppError('Job ID is required', 400));
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return next(new AppError('Invalid job ID format', 400));
    }

    // Import JobPost model dynamically to avoid circular dependencies
    const { default: JobPost } = await import('../models/JobPost');
    
    const job = await JobPost.findById(jobId).select('_id title status');
    
    if (!job) {
      logger.warn('Job not found for proposal submission', {
        jobId,
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent')
      });
      return next(new AppError('Job not found', 404));
    }

    // Allow proposals for both active and draft jobs
    if (job.status !== 'active' && job.status !== 'draft') {
      logger.warn('Attempt to submit proposal to inactive job', {
        jobId,
        status: job.status,
        url: req.url,
        method: req.method
      });
      return next(new AppError('Cannot submit proposal to inactive job', 400));
    }

    // Attach job to request for downstream use
    req.job = {
      _id: (job._id as any).toString(),
      title: job.title,
      status: job.status
    };
    
    logger.debug('Job validation passed', {
      jobId: job._id,
      title: job.title,
      status: job.status
    });
    
    next();
  } catch (error) {
    logger.error('Error validating job existence', {
      error: error instanceof Error ? error.message : 'Unknown error',
      jobId: req.body.jobId || req.params.jobId,
      stack: error instanceof Error ? error.stack : undefined
    });
    next(new AppError('Error validating job', 500));
  }
};

/**
 * Prevents duplicate proposals from same freelancer to same job
 */
export const validateUniqueProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.body;
    const userId = req.user?.id || '507f1f77bcf86cd799439011'; // Mock user ID for testing

    // Skip unique validation during development when no auth is present
    if (!req.user?.id) {
      console.log('Skipping unique proposal validation - no authentication present');
      return next();
    }

    // Import Proposal model dynamically
    const { Proposal } = await import('../models/Proposal');
    
    const existingProposal = await Proposal.findOne({
      jobId,
      freelancerId: userId,
      isActive: true
    }).select('_id status submittedAt');

    if (existingProposal) {
      logger.warn('Duplicate proposal attempt detected', {
        jobId,
        freelancerId: userId,
        existingProposalId: existingProposal._id,
        existingStatus: existingProposal.status,
        submittedAt: existingProposal.submittedAt
      });
      return next(new AppError('You have already submitted a proposal for this job', 409));
    }

    logger.debug('Unique proposal validation passed', { jobId, freelancerId: userId });
    next();
  } catch (error) {
    logger.error('Error validating proposal uniqueness', {
      error: error instanceof Error ? error.message : 'Unknown error',
      jobId: req.body.jobId,
      userId: req.user?.id,
      stack: error instanceof Error ? error.stack : undefined
    });
    next(new AppError('Error validating proposal uniqueness', 500));
  }
};

/**
 * Comprehensive request logging for debugging
 */
export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  logger.info('API Request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
    body: req.method !== 'GET' ? req.body : undefined,
    params: Object.keys(req.params).length > 0 ? req.params : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined
  });
  next();
};

// Extend Express Request interface to include custom properties
declare global {
  namespace Express {
    interface Request {
      job?: {
        _id: string;
        title: string;
        status: string;
      };
    }
  }
}
