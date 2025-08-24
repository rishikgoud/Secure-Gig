import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AppError } from '../utils/errors';
import { logger } from '../config/logger';
import { env } from '../config/env';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        id: string;
        email: string;
        role: 'client' | 'freelancer';
        name: string;
        isVerified: boolean;
      };
    }
  }
}

export interface JWTPayload {
  id: string;
  email: string;
  role: 'client' | 'freelancer';
  iat?: number;
  exp?: number;
}

/**
 * JWT Authentication Middleware
 * Extracts and validates JWT token from Authorization header
 * Attaches user data to req.user for downstream middleware
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed - No token provided', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path
      });
      throw new AppError('Authentication required. Please provide a valid token.', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    } catch (jwtError: any) {
      logger.warn('JWT verification failed', {
        error: jwtError.message,
        ip: req.ip,
        path: req.path
      });
      
      if (jwtError.name === 'TokenExpiredError') {
        throw new AppError('Token has expired. Please log in again.', 401);
      } else if (jwtError.name === 'JsonWebTokenError') {
        throw new AppError('Invalid token. Please log in again.', 401);
      } else {
        throw new AppError('Token verification failed.', 401);
      }
    }

    // Fetch user from database to ensure they still exist and are active
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      logger.warn('Authentication failed - User not found', {
        userId: decoded.id,
        email: decoded.email,
        ip: req.ip
      });
      throw new AppError('User account not found. Please log in again.', 401);
    }

    if (!user.isActive) {
      logger.warn('Authentication failed - User account deactivated', {
        userId: user._id,
        email: user.email,
        ip: req.ip
      });
      throw new AppError('Account has been deactivated. Please contact support.', 401);
    }

    // Attach user data to request object
    req.user = {
      _id: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      isVerified: user.isVerified || false
    };

    logger.debug('User authenticated successfully', {
      userId: user._id,
      email: user.email,
      role: user.role,
      path: req.path
    });

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    
    logger.error('Unexpected authentication error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      ip: req.ip,
      path: req.path
    });
    
    next(new AppError('Authentication failed. Please try again.', 401));
  }
};

/**
 * Role-based authorization middleware
 * Ensures user has required role(s) to access the resource
 */
export const authorize = (...roles: Array<'client' | 'freelancer'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      logger.error('Authorization check failed - No user in request', {
        path: req.path,
        ip: req.ip
      });
      return next(new AppError('Authentication required before authorization.', 401));
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization failed - Insufficient permissions', {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path
      });
      return next(new AppError(`Access denied. Required role: ${roles.join(' or ')}.`, 403));
    }

    logger.debug('User authorized successfully', {
      userId: req.user._id,
      role: req.user.role,
      path: req.path
    });

    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches user data if token is present, but doesn't fail if missing
 * Useful for endpoints that work with or without authentication
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    
    const user = await User.findById(decoded.id).select('-password');
    if (user && user.isActive) {
      req.user = {
        _id: user._id.toString(),
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
        isVerified: user.isVerified || false
      };
    }
    
    next();
  } catch (error) {
    // Silently continue without authentication on any error
    next();
  }
};

/**
 * Generate JWT token for user
 */
export const generateToken = (user: { _id: string; email: string; role: 'client' | 'freelancer' }): string => {
  const payload: JWTPayload = {
    id: user._id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '7d',
    issuer: 'secure-gig-api',
    audience: 'secure-gig-app'
  });
};

/**
 * Verify user ownership of resource
 * Ensures user can only access their own resources
 */
export const verifyOwnership = (resourceUserIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (resourceUserId && resourceUserId !== req.user._id) {
      logger.warn('Ownership verification failed', {
        userId: req.user._id,
        resourceUserId,
        path: req.path
      });
      return next(new AppError('Access denied. You can only access your own resources.', 403));
    }

    next();
  };
};
