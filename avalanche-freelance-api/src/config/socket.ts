import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { logger } from './logger';
import { env } from './env';

/**
 * Real-time Socket.IO server configuration for job broadcasting
 * Handles WebSocket connections, authentication, and event management
 */

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: 'client' | 'freelancer';
  userEmail?: string;
}

export class SocketManager {
  private io: SocketIOServer;
  private connectedFreelancers: Map<string, AuthenticatedSocket> = new Map();
  private connectedClients: Map<string, AuthenticatedSocket> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: ['http://localhost:3000', 'http://localhost:8081'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    logger.info('Socket.IO server initialized');
  }

  /**
   * Authentication middleware for Socket.IO connections
   * Verifies JWT token and attaches user info to socket
   */
  private setupMiddleware(): void {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        // Extract token from handshake auth or query
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        
        if (!token) {
          logger.warn('Socket connection rejected - no token provided', {
            socketId: socket.id,
            ip: socket.handshake.address
          });
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token as string, env.JWT_SECRET) as { id: string };
        
        // Fetch user from database
        const user = await User.findById(decoded.id).select('-password');
        if (!user || !user.isActive) {
          logger.warn('Socket connection rejected - invalid user', {
            socketId: socket.id,
            userId: decoded.id
          });
          return next(new Error('Invalid user or account deactivated'));
        }

        // Attach user info to socket for authorization
        socket.userId = String((user as any)._id);
        socket.userRole = (user as any).role;
        socket.userEmail = (user as any).email;

        logger.auth('Socket connection authenticated', {
          socketId: socket.id,
          userId: user._id,
          email: user.email,
          role: user.role,
          ip: socket.handshake.address
        });

        next();
      } catch (error: any) {
        logger.warn('Socket authentication failed', {
          socketId: socket.id,
          error: error.message,
          ip: socket.handshake.address
        });
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
      
      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });

      socket.on('join_freelancer_room', () => {
        this.handleFreelancerJoin(socket);
      });

      socket.on('join_client_room', () => {
        this.handleClientJoin(socket);
      });

      socket.on('error', (error) => {
        logger.error('Socket error occurred', {
          socketId: socket.id,
          userId: socket.userId,
          error: error.message
        });
      });
    });
  }

  /**
   * Handle new socket connection
   */
  private handleConnection(socket: AuthenticatedSocket): void {
    logger.info('Socket client connected', {
      socketId: socket.id,
      userId: socket.userId,
      role: socket.userRole,
      totalConnections: this.io.engine.clientsCount
    });

    // Send connection confirmation
    socket.emit('connection_confirmed', {
      message: 'Connected to real-time job updates',
      userId: socket.userId,
      role: socket.userRole
    });
  }

  /**
   * Handle socket disconnection
   */
  private handleDisconnection(socket: AuthenticatedSocket): void {
    // Remove from tracking maps
    if (socket.userRole === 'freelancer') {
      this.connectedFreelancers.delete(socket.userId!);
    } else if (socket.userRole === 'client') {
      this.connectedClients.delete(socket.userId!);
    }

    logger.info('Socket client disconnected', {
      socketId: socket.id,
      userId: socket.userId,
      role: socket.userRole,
      totalConnections: this.io.engine.clientsCount
    });
  }

  /**
   * Handle freelancer joining job updates room
   */
  private handleFreelancerJoin(socket: AuthenticatedSocket): void {
    if (socket.userRole !== 'freelancer') {
      socket.emit('error', { message: 'Only freelancers can join job updates' });
      return;
    }

    socket.join('freelancers');
    this.connectedFreelancers.set(socket.userId!, socket);

    logger.info('Freelancer joined job updates room', {
      socketId: socket.id,
      userId: socket.userId,
      email: socket.userEmail,
      freelancersCount: this.connectedFreelancers.size
    });

    socket.emit('joined_freelancer_room', {
      message: 'Successfully subscribed to job updates',
      freelancersOnline: this.connectedFreelancers.size
    });
  }

  /**
   * Handle client joining notifications room
   */
  private handleClientJoin(socket: AuthenticatedSocket): void {
    if (socket.userRole !== 'client') {
      socket.emit('error', { message: 'Only clients can join client notifications' });
      return;
    }

    socket.join('clients');
    this.connectedClients.set(socket.userId!, socket);

    logger.info('Client joined notifications room', {
      socketId: socket.id,
      userId: socket.userId,
      email: socket.userEmail,
      clientsCount: this.connectedClients.size
    });

    socket.emit('joined_client_room', {
      message: 'Successfully subscribed to client notifications',
      clientsOnline: this.connectedClients.size
    });
  }

  /**
   * Broadcast new job post to all connected freelancers
   */
  public broadcastNewJob(jobData: any): void {
    logger.info('Broadcasting new job to freelancers', { 
      jobId: jobData._id, 
      freelancerCount: this.connectedFreelancers.size,
      message: 'New job opportunity available!'
    });

    this.connectedFreelancers.forEach((socket) => {
      socket.emit('newJob', {
        id: jobData._id,
        title: jobData.title,
        description: jobData.description,
        budget: jobData.budget,
        category: jobData.category,
        skills: jobData.skills,
        client: jobData.client,
        createdAt: jobData.createdAt,
        urgency: jobData.urgency,
        experienceLevel: jobData.experienceLevel
      });
    });

    logger.info('Job broadcasted to freelancers', {
      jobId: jobData._id,
      jobTitle: jobData.title,
      freelancersNotified: this.connectedFreelancers.size,
      clientId: jobData.client?._id
    });
  }

  /**
   * Broadcast new proposal to job owner (client)
   */
  public broadcastNewProposal(proposalData: any): void {
    logger.info('Broadcasting new proposal to client', { 
      proposalId: proposalData.proposalId,
      jobId: proposalData.jobId,
      clientCount: this.connectedClients.size 
    });

    this.connectedClients.forEach((socket) => {
      socket.emit('newProposal', {
        proposalId: proposalData.proposalId,
        jobId: proposalData.jobId,
        jobTitle: proposalData.jobTitle,
        freelancerName: proposalData.freelancerName,
        freelancerId: proposalData.freelancerId,
        proposedRate: proposalData.proposedRate,
        submittedAt: proposalData.submittedAt
      });
    });
  }

  /**
   * Broadcast proposal status update to freelancer
   */
  public broadcastProposalStatusUpdate(statusData: any): void {
    logger.info('Broadcasting proposal status update to freelancer', { 
      proposalId: statusData.proposalId,
      freelancerId: statusData.freelancerId,
      status: statusData.status
    });

    this.connectedFreelancers.forEach((socket) => {
      if (socket.userId === statusData.freelancerId.toString()) {
        socket.emit('proposalStatusUpdate', {
          proposalId: statusData.proposalId,
          jobId: statusData.jobId,
          jobTitle: statusData.jobTitle,
          status: statusData.status,
          clientResponse: statusData.clientResponse
        });
      }
    });
  }

  /**
   * Broadcast job update to relevant users
   */
  public broadcastJobUpdate(jobData: any, updateType: 'updated' | 'deleted' | 'status_changed'): void {
    const sanitizedJobData = {
      _id: jobData._id,
      title: jobData.title,
      status: jobData.status,
      updatedAt: jobData.updatedAt
    };

    // Notify freelancers about job updates
    this.io.to('freelancers').emit('job_updated', {
      job: sanitizedJobData,
      updateType,
      timestamp: new Date().toISOString()
    });

    logger.info('Job update broadcasted', {
      jobId: jobData._id,
      updateType,
      freelancersNotified: this.connectedFreelancers.size
    });
  }

  /**
   * Send notification to specific client
   */
  public notifyClient(clientId: string, notification: any): void {
    const clientSocket = this.connectedClients.get(clientId);
    
    if (clientSocket) {
      clientSocket.emit('notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });

      logger.info('Client notification sent', {
        clientId,
        notificationType: notification.type,
        socketId: clientSocket.id
      });
    } else {
      logger.debug('Client not online for notification', { clientId });
    }
  }

  /**
   * Get connection statistics
   */
  public getStats(): any {
    return {
      totalConnections: this.io.engine.clientsCount,
      freelancersOnline: this.connectedFreelancers.size,
      clientsOnline: this.connectedClients.size,
      rooms: Array.from(this.io.sockets.adapter.rooms.keys())
    };
  }

  /**
   * Get Socket.IO server instance
   */
  public getIO(): SocketIOServer {
    return this.io;
  }
}

// Global socket manager instance
let socketManager: SocketManager;

/**
 * Initialize Socket.IO server
 */
export const initializeSocket = (httpServer: HTTPServer): SocketManager => {
  socketManager = new SocketManager(httpServer);
  return socketManager;
};

/**
 * Get the global socket manager instance
 */
export const getSocketManager = (): SocketManager => {
  if (!socketManager) {
    throw new Error('Socket manager not initialized. Call initializeSocket first.');
  }
  return socketManager;
};
