import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

/**
 * Enhanced request logging middleware
 * Logs HTTP requests with detailed metadata for debugging and monitoring
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Log incoming request
  logger.http('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    timestamp: new Date().toISOString()
  });

  // Override res.end to log response details
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - startTime;
    
    logger.http('Request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
      ip: req.ip
    });
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Error request logger - logs failed requests with additional context
 */
export const errorRequestLogger = (error: any, req: Request, res: Response, next: NextFunction): void => {
  logger.error('Request failed', {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    error: error.message,
    stack: error.stack,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method !== 'GET' ? req.body : undefined
  });
  
  next(error);
};
