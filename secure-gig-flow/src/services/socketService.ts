import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

/**
 * Real-time Socket.IO client service for job updates
 * Handles WebSocket connection, authentication, and event management
 */

export interface JobData {
  _id: string;
  title: string;
  description: string;
  budget: {
    type: 'fixed' | 'hourly';
    amount: number;
    currency: string;
  };
  deadline: string;
  skills: string[];
  category: string;
  client: {
    name: string;
    rating?: number;
  };
  createdAt: string;
  status: string;
}

export interface SocketEvents {
  // Connection events
  connection_confirmed: (data: { message: string; userId: string; role: string }) => void;
  joined_freelancer_room: (data: { message: string; freelancersOnline: number }) => void;
  joined_client_room: (data: { message: string; clientsOnline: number }) => void;
  
  // Job events
  new_job_posted: (data: { job: JobData; timestamp: string; message: string }) => void;
  job_updated: (data: { job: Partial<JobData>; updateType: string; timestamp: string }) => void;
  
  // Error events
  error: (data: { message: string }) => void;
  
  // Notification events
  notification: (data: any) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private eventListeners: Map<string, Function[]> = new Map();

  /**
   * Initialize socket connection with authentication
   */
  public async connect(): Promise<void> {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const authStore = useAuthStore.getState();
      const token = this.getAuthToken();

      if (!token) {
        throw new Error('No authentication token available');
      }

      // Create socket connection
      this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
      });

      this.setupEventHandlers();
      
      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket!.on('connect', () => {
          clearTimeout(timeout);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          console.log('✅ Socket.IO connected successfully');
          resolve();
        });

        this.socket!.on('connect_error', (error) => {
          clearTimeout(timeout);
          this.isConnecting = false;
          console.error('❌ Socket.IO connection failed:', error.message);
          reject(error);
        });
      });

      // Join appropriate room based on user role
      if (authStore.user?.role === 'freelancer') {
        this.joinFreelancerRoom();
      } else if (authStore.user?.role === 'client') {
        this.joinClientRoom();
      }

    } catch (error) {
      this.isConnecting = false;
      console.error('Socket connection failed:', error);
      throw error;
    }
  }

  /**
   * Setup socket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.handleReconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.handleReconnection();
    });

    // Authentication events
    this.socket.on('connection_confirmed', (data) => {
      console.log('Connection confirmed:', data);
      this.emitToListeners('connection_confirmed', data);
    });

    // Room join confirmations
    this.socket.on('joined_freelancer_room', (data) => {
      console.log('Joined freelancer room:', data);
      this.emitToListeners('joined_freelancer_room', data);
    });

    this.socket.on('joined_client_room', (data) => {
      console.log('Joined client room:', data);
      this.emitToListeners('joined_client_room', data);
    });

    // Job events
    this.socket.on('new_job_posted', (data) => {
      console.log('New job posted:', data);
      this.emitToListeners('new_job_posted', data);
    });

    this.socket.on('job_updated', (data) => {
      console.log('Job updated:', data);
      this.emitToListeners('job_updated', data);
    });

    // Error handling
    this.socket.on('error', (data) => {
      console.error('Socket error:', data);
      this.emitToListeners('error', data);
    });

    // Notifications
    this.socket.on('notification', (data) => {
      console.log('Notification received:', data);
      this.emitToListeners('notification', data);
    });
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.socket?.connected) {
        this.connect().catch(console.error);
      }
    }, delay);
  }

  /**
   * Join freelancer room for job updates
   */
  public joinFreelancerRoom(): void {
    if (this.socket?.connected) {
      this.socket.emit('join_freelancer_room');
    }
  }

  /**
   * Join client room for notifications
   */
  public joinClientRoom(): void {
    if (this.socket?.connected) {
      this.socket.emit('join_client_room');
    }
  }

  /**
   * Subscribe to socket events
   */
  public on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Unsubscribe from socket events
   */
  public off<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to registered listeners
   */
  private emitToListeners(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    // Try to get token from auth store first
    const authStore = useAuthStore.getState();
    if (authStore.token) {
      return authStore.token;
    }

    // Fallback to localStorage/cookies
    const token = localStorage.getItem('authToken') || 
                  document.cookie.split('; ')
                    .find(row => row.startsWith('jwt='))
                    ?.split('=')[1];

    return token || null;
  }

  /**
   * Disconnect socket
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  /**
   * Check if socket is connected
   */
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get connection status
   */
  public getStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    socketId?: string;
  } {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id
    };
  }
}

// Create singleton instance
export const socketService = new SocketService();

// Auto-connect when user is authenticated
const authStore = useAuthStore.getState();
if (authStore.isAuthenticated && authStore.user) {
  socketService.connect().catch(console.error);
}

// Listen for auth state changes
useAuthStore.subscribe((state) => {
  if (state.isAuthenticated && state.user) {
    // User logged in, connect socket
    socketService.connect().catch(console.error);
  } else {
    // User logged out, disconnect socket
    socketService.disconnect();
  }
});
