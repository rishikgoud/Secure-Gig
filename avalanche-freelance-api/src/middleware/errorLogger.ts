import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { AppError } from '../utils/errors';

/**
 * Enhanced error logging middleware
 * Logs all application errors with detailed context for debugging
 */
export const errorLogger = (error: any, req: Request, res: Response, next: NextFunction): void => {
  // Determine error type and log level
  const isOperationalError = error instanceof AppError;
  const statusCode = error.statusCode || 500;
  
  // Prepare error metadata
  const errorMeta = {
    message: error.message,
    statusCode,
    stack: error.stack,
    name: error.name,
    isOperational: isOperationalError,
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id,
      body: req.method !== 'GET' ? sanitizeRequestBody(req.body) : undefined
    },
    timestamp: new Date().toISOString()
  };

  // Log based on error severity
  if (statusCode >= 500) {
    logger.error('Server error occurred', errorMeta);
  } else if (statusCode >= 400) {
    logger.warn('Client error occurred', errorMeta);
  } else {
    logger.info('Request completed with error', errorMeta);
  }

  // Log additional context for specific error types
  if (error.code === 11000) {
    logger.warn('Database duplicate key error', {
      duplicateFields: Object.keys(error.keyPattern || {}),
      collection: error.collection
    });
  }

  if (error.name === 'ValidationError') {
    logger.warn('Validation error details', {
      validationErrors: Object.keys(error.errors || {}).map(field => ({
        field,
        message: error.errors[field]?.message
      }))
    });
  }

  if (error.name === 'CastError') {
    logger.warn('Database cast error', {
      path: error.path,
      value: error.value,
      kind: error.kind
    });
  }

  next(error);
};

/**
 * Sanitize request body to remove sensitive information from logs
 */
const sanitizeRequestBody = (body: any): any => {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = ['password', 'confirmPassword', 'token', 'secret', 'key'];
  const sanitized = { ...body };

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
};

/**
 * Database operation logger
 * Logs database queries and operations for debugging
 */
export const dbOperationLogger = {
  logQuery: (operation: string, model: string, query?: any, duration?: number) => {
    logger.db(`Database ${operation}`, {
      model,
      operation,
      query: query ? sanitizeQuery(query) : undefined,
      duration: duration ? `${duration}ms` : undefined
    });
  },

  logError: (operation: string, model: string, error: any) => {
    logger.error(`Database ${operation} failed`, {
      model,
      operation,
      error: error.message,
      code: error.code
    });
  }
};

/**
 * Sanitize database query to remove sensitive information
 */
const sanitizeQuery = (query: any): any => {
  if (!query || typeof query !== 'object') {
    return query;
  }

  const sanitized = { ...query };
  if (sanitized.password) {
    sanitized.password = '[REDACTED]';
  }
  
  return sanitized;
};
