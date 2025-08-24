# Logger Usage Examples and Best Practices

## Overview
This document provides comprehensive examples and best practices for using the robust Pino-based logger in your Node.js + Express backend.

## Basic Usage

### Import the Logger
```typescript
import { logger } from '../config/logger';
```

### Basic Logging Methods
```typescript
// Informational messages
logger.info('Server started successfully');
logger.info('User profile updated', { userId: '123', fields: ['name', 'email'] });

// Error logging
logger.error('Database connection failed');
logger.error('Payment processing failed', { 
  orderId: '456', 
  error: error.message,
  stack: error.stack 
});

// Warning messages
logger.warn('API rate limit approaching', { userId: '789', requestCount: 95 });

// Debug messages (only shown in development)
logger.debug('Cache miss for user data', { userId: '123', cacheKey: 'user:profile' });
```

## Specialized Logging Methods

### HTTP Request Logging
```typescript
// In route handlers
app.get('/api/users/:id', async (req, res) => {
  logger.http('User profile request', {
    method: req.method,
    url: req.originalUrl,
    userId: req.params.id,
    ip: req.ip
  });
  
  // ... route logic
  
  logger.http('User profile response', {
    statusCode: 200,
    userId: req.params.id,
    responseTime: '45ms'
  });
});
```

### Authentication Logging
```typescript
// Successful login
logger.auth('User login successful', {
  userId: user._id,
  email: user.email,
  role: user.role,
  ip: req.ip,
  userAgent: req.get('User-Agent')
});

// Failed login attempt
logger.auth('Failed login attempt', {
  email: loginData.email,
  ip: req.ip,
  reason: 'invalid_password'
});

// Account lockout
logger.auth('Account locked due to failed attempts', {
  userId: user._id,
  email: user.email,
  attemptCount: 5
});
```

### Database Operation Logging
```typescript
// Query execution
logger.db('User query executed', {
  operation: 'findOne',
  collection: 'users',
  query: { email: 'user@example.com' },
  duration: '23ms'
});

// Database errors
logger.db('Database operation failed', {
  operation: 'create',
  collection: 'orders',
  error: error.message,
  data: sanitizedData
});

// Connection events
logger.db('Database connection established', {
  host: 'mongodb.example.com',
  database: 'freelance_app',
  connectionCount: 5
});
```

## Error Handling Examples

### API Route Error Handling
```typescript
export const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData = userSchema.parse(req.body);
    
    logger.info('Creating new user', { 
      email: userData.email, 
      role: userData.role 
    });
    
    const user = await User.create(userData);
    
    logger.auth('User registration successful', {
      userId: user._id,
      email: user.email,
      role: user.role,
      ip: req.ip
    });
    
    res.status(201).json({ success: true, data: user });
    
  } catch (error) {
    logger.error('User creation failed', {
      error: error.message,
      stack: error.stack,
      requestBody: sanitizeRequestBody(req.body),
      ip: req.ip
    });
    
    return next(new AppError('Failed to create user', 500));
  }
});
```

### Global Error Handler Integration
```typescript
export const globalErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  // Log the error with context
  logger.error('Global error handler triggered', {
    message: error.message,
    statusCode: error.statusCode || 500,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id
  });
  
  // Send appropriate response
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};
```

## Middleware Integration

### Request Logging Middleware
```typescript
import { requestLogger } from '../middleware/requestLogger';

// Use in your Express app
app.use(requestLogger);
```

### Error Logging Middleware
```typescript
import { errorLogger } from '../middleware/errorLogger';

// Use before your global error handler
app.use(errorLogger);
app.use(globalErrorHandler);
```

## Best Practices

### 1. Structured Logging
Always include relevant metadata with your log messages:

```typescript
// Good ✅
logger.info('Payment processed successfully', {
  orderId: order.id,
  amount: order.total,
  currency: 'USD',
  paymentMethod: 'stripe',
  userId: user.id,
  processingTime: '1.2s'
});

// Avoid ❌
logger.info('Payment processed');
```

### 2. Sensitive Data Handling
Never log sensitive information:

```typescript
// Good ✅
logger.auth('User login attempt', {
  email: user.email,
  ip: req.ip,
  success: true
});

// Avoid ❌
logger.auth('User login', {
  email: user.email,
  password: user.password, // Never log passwords!
  creditCard: user.paymentInfo // Never log sensitive data!
});
```

### 3. Error Context
Always provide context when logging errors:

```typescript
// Good ✅
logger.error('Database query failed', {
  operation: 'findUser',
  query: { email: userEmail },
  error: error.message,
  stack: error.stack,
  duration: queryDuration
});

// Avoid ❌
logger.error('Query failed');
```

### 4. Performance Considerations
Use appropriate log levels to avoid performance impact:

```typescript
// Use debug for detailed information only needed during development
logger.debug('Cache lookup', { key: cacheKey, hit: cacheHit });

// Use info for important business events
logger.info('Order completed', { orderId, userId, total });

// Use warn for concerning but non-critical issues
logger.warn('API response time exceeded threshold', { 
  endpoint: '/api/users',
  responseTime: '2.5s',
  threshold: '2s'
});
```

### 5. Correlation IDs
Use correlation IDs to track requests across services:

```typescript
// Add correlation ID middleware
app.use((req, res, next) => {
  req.correlationId = req.get('X-Correlation-ID') || generateUUID();
  res.set('X-Correlation-ID', req.correlationId);
  next();
});

// Include in all logs
logger.info('Processing user request', {
  correlationId: req.correlationId,
  userId: req.user.id,
  action: 'updateProfile'
});
```

## Production Considerations

### Log Rotation
In production, ensure log rotation is configured:

```typescript
// Example with winston (if switching from Pino)
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});
```

### Monitoring Integration
Integrate with monitoring services:

```typescript
// Example: Send critical errors to monitoring service
if (error.statusCode >= 500) {
  logger.error('Critical error occurred', errorDetails);
  
  // Send to monitoring service
  monitoringService.reportError(error, {
    correlationId: req.correlationId,
    userId: req.user?.id
  });
}
```

### Environment-Specific Configuration
Configure logging based on environment:

```typescript
const logLevel = {
  development: 'debug',
  staging: 'info',
  production: 'warn'
}[process.env.NODE_ENV] || 'info';

const logger = pino({
  level: logLevel,
  // ... other config
});
```

## Common Patterns

### Database Transaction Logging
```typescript
const session = await mongoose.startSession();
session.startTransaction();

try {
  logger.db('Transaction started', { transactionId: session.id });
  
  // ... transaction operations
  
  await session.commitTransaction();
  logger.db('Transaction committed successfully', { 
    transactionId: session.id,
    duration: Date.now() - startTime 
  });
  
} catch (error) {
  await session.abortTransaction();
  logger.error('Transaction failed and rolled back', {
    transactionId: session.id,
    error: error.message,
    duration: Date.now() - startTime
  });
  throw error;
} finally {
  session.endSession();
}
```

### API Rate Limiting Logging
```typescript
export const rateLimitLogger = (req: Request, res: Response, next: NextFunction) => {
  const remaining = res.get('X-RateLimit-Remaining');
  const limit = res.get('X-RateLimit-Limit');
  
  if (remaining && parseInt(remaining) < 10) {
    logger.warn('API rate limit approaching', {
      ip: req.ip,
      endpoint: req.path,
      remaining: parseInt(remaining),
      limit: parseInt(limit),
      userId: req.user?.id
    });
  }
  
  next();
};
```

This logger setup provides comprehensive logging capabilities for debugging, monitoring, and maintaining your Node.js application in production.
