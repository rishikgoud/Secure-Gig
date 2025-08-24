import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const connectDB = async (): Promise<void> => {
  try {
    // Validate MongoDB URI exists
    if (!env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined. Please check your .env file.');
    }

    // Log connection attempt (without exposing credentials)
    const sanitizedUri = env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@');
    logger.db('Attempting MongoDB connection', { uri: sanitizedUri });

    const conn = await mongoose.connect(env.MONGODB_URI, {
      // Modern connection options
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    logger.db('MongoDB connection successful', {
      host: conn.connection.host,
      database: conn.connection.name,
      readyState: conn.connection.readyState
    });
    
  } catch (error: any) {
    logger.error('MongoDB connection failed', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    
    // Provide helpful error messages
    if (error.message.includes('authentication failed')) {
      logger.error('Check your MongoDB username and password in the connection string');
    } else if (error.message.includes('ENOTFOUND')) {
      logger.error('Check your MongoDB cluster URL and network connectivity');
    } else if (error.message.includes('uri parameter')) {
      logger.error('Check that MONGODB_URI is properly set in your .env file');
    }
    
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.db('MongoDB connection closed gracefully');
  process.exit(0);
});
