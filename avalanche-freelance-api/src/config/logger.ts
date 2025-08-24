import pino from 'pino';
import { env } from './env';

/**
 * Production-ready logger configuration using Pino
 * 
 * Features:
 * - High performance structured logging
 * - Environment-based log levels (debug in dev, info in prod)
 * - Pretty printing in development with colors and timestamps
 * - JSON structured logs in production for better parsing
 * - Support for metadata objects alongside messages
 * - Global exception and rejection handling
 */

// Create the base Pino logger instance
const pinoLogger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  
  // Base configuration for all environments
  base: {
    pid: false, // Remove process ID for cleaner logs
    hostname: false // Remove hostname for cleaner logs
  },
  
  // Timestamp configuration
  timestamp: pino.stdTimeFunctions.isoTime,
  
  // Pretty printing for development only
  transport: env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
      messageFormat: '{levelLabel} - {msg}',
      levelFirst: true
    }
  } : undefined,
  
  // Production formatting for structured logging
  formatters: env.NODE_ENV === 'production' ? {
    level: (label) => ({ level: label }),
    bindings: () => ({})
  } : undefined
});

/**
 * Enhanced logger interface with TypeScript support
 * Provides consistent logging methods with optional metadata
 */
export const logger = {
  /**
   * Log informational messages
   * @param message - The log message
   * @param meta - Optional metadata object
   */
  info: (message: string, meta?: Record<string, any>): void => {
    if (meta) {
      pinoLogger.info(meta, message);
    } else {
      pinoLogger.info(message);
    }
  },

  /**
   * Log error messages
   * @param message - The error message
   * @param meta - Optional metadata object (can include error objects)
   */
  error: (message: string, meta?: Record<string, any>): void => {
    if (meta) {
      pinoLogger.error(meta, message);
    } else {
      pinoLogger.error(message);
    }
  },

  /**
   * Log warning messages
   * @param message - The warning message
   * @param meta - Optional metadata object
   */
  warn: (message: string, meta?: Record<string, any>): void => {
    if (meta) {
      pinoLogger.warn(meta, message);
    } else {
      pinoLogger.warn(message);
    }
  },

  /**
   * Log debug messages (only shown in development)
   * @param message - The debug message
   * @param meta - Optional metadata object
   */
  debug: (message: string, meta?: Record<string, any>): void => {
    if (meta) {
      pinoLogger.debug(meta, message);
    } else {
      pinoLogger.debug(message);
    }
  },

  /**
   * Log HTTP requests (useful for middleware)
   * @param message - The request message
   * @param meta - Request metadata (method, url, status, etc.)
   */
  http: (message: string, meta?: Record<string, any>): void => {
    if (meta) {
      pinoLogger.info(meta, `[HTTP] ${message}`);
    } else {
      pinoLogger.info(`[HTTP] ${message}`);
    }
  },

  /**
   * Log database operations
   * @param message - The database operation message
   * @param meta - Database metadata (query, duration, etc.)
   */
  db: (message: string, meta?: Record<string, any>): void => {
    if (meta) {
      pinoLogger.debug(meta, `[DB] ${message}`);
    } else {
      pinoLogger.debug(`[DB] ${message}`);
    }
  },

  /**
   * Log authentication events
   * @param message - The auth message
   * @param meta - Auth metadata (userId, action, etc.)
   */
  auth: (message: string, meta?: Record<string, any>): void => {
    if (meta) {
      pinoLogger.info(meta, `[AUTH] ${message}`);
    } else {
      pinoLogger.info(`[AUTH] ${message}`);
    }
  }
};

/**
 * Global exception handlers for unhandled errors
 * These help catch errors that might otherwise crash the application
 */
export const setupGlobalErrorHandling = (): void => {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception - Application will exit', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Give time for logs to flush before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Promise Rejection', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString()
    });
    
    // In production, you might want to exit the process
    if (env.NODE_ENV === 'production') {
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  });

  // Handle SIGTERM gracefully
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received - Starting graceful shutdown');
  });

  // Handle SIGINT gracefully (Ctrl+C)
  process.on('SIGINT', () => {
    logger.info('SIGINT received - Starting graceful shutdown');
    process.exit(0);
  });
};

// Export the raw pino logger for advanced use cases
export { pinoLogger };

/**
 * Usage Examples:
 * 
 * Basic logging:
 * logger.info('Server started successfully');
 * logger.error('Database connection failed');
 * 
 * With metadata:
 * logger.info('User logged in', { userId: '123', email: 'user@example.com' });
 * logger.error('API request failed', { 
 *   url: '/api/users', 
 *   method: 'POST', 
 *   statusCode: 500,
 *   error: error.message 
 * });
 * 
 * Specialized logging:
 * logger.http('GET /api/users', { method: 'GET', url: '/api/users', statusCode: 200 });
 * logger.auth('User authentication successful', { userId: '123', method: 'jwt' });
 * logger.db('User query executed', { query: 'SELECT * FROM users', duration: '45ms' });
 */
