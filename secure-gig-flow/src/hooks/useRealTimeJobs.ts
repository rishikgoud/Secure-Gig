import { useState, useEffect, useCallback, useRef } from 'react';
import { socketService, JobData } from '@/services/socketService';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/api/client';

/**
 * Real-time job subscription hook for freelancers
 * Manages job list state with live updates from Socket.IO
 */

export interface UseRealTimeJobsReturn {
  jobs: JobData[];
  loading: boolean;
  error: string | null;
  connectionStatus: {
    connected: boolean;
    reconnectAttempts: number;
    socketId?: string;
  };
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useRealTimeJobs = (): UseRealTimeJobsReturn => {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState(socketService.getStatus());
  const { user, isAuthenticated } = useAuthStore();
  const isSubscribed = useRef(false);

  /**
   * Fetch initial job list from API
   */
  const fetchInitialJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getJobs({
        page: 1,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (response.data?.jobPosts) {
        // Transform JobPost to JobData format
        const transformedJobs = response.data.jobPosts.map((job: any) => ({
          _id: job._id || job.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: job.title,
          description: job.description,
          budget: job.budget,
          deadline: job.timeline?.endDate || job.createdAt,
          skills: job.skills,
          category: job.category,
          client: {
            name: job.clientId?.name || 'Anonymous Client',
            rating: job.clientId?.ratings?.average
          },
          createdAt: job.createdAt,
          status: job.status
        }));
        
        console.log('Transformed jobs with IDs:', transformedJobs.map(j => ({ title: j.title, _id: j._id })));
        setJobs(transformedJobs);
        console.log('Jobs loaded successfully:', transformedJobs.length);
      } else {
        console.warn('No job posts found in response:', response);
      }
    } catch (err: any) {
      console.error('Failed to fetch initial jobs:', err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to load jobs. Please check your connection and try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle new job posted event
   */
  const handleNewJob = useCallback((data: { job: JobData; timestamp: string; message: string }) => {
    console.log('New job received:', data);
    
    setJobs(prevJobs => {
      // Check if job already exists to prevent duplicates
      const existingJobIndex = prevJobs.findIndex(job => job._id === data.job._id);
      
      if (existingJobIndex === -1) {
        // Add new job to the beginning of the list
        return [data.job, ...prevJobs];
      }
      
      return prevJobs;
    });

    // Show notification (optional)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Job Available!', {
        body: `${data.job.title} - ${data.job.budget.type === 'fixed' ? '$' + data.job.budget.amount : '$' + data.job.budget.amount + '/hr'}`,
        icon: '/favicon.ico',
        tag: `job-${data.job._id}`
      });
    }
  }, []);

  /**
   * Handle job update event
   */
  const handleJobUpdate = useCallback((data: { job: Partial<JobData>; updateType: string; timestamp: string }) => {
    console.log('Job update received:', data);
    
    setJobs(prevJobs => {
      return prevJobs.map(job => {
        if (job._id === data.job._id) {
          if (data.updateType === 'deleted' || data.job.status === 'closed') {
            // Remove deleted or closed jobs
            return null;
          }
          // Update existing job
          return { ...job, ...data.job };
        }
        return job;
      }).filter(Boolean) as JobData[];
    });
  }, []);

  /**
   * Handle socket connection events
   */
  const handleConnectionConfirmed = useCallback((data: { message: string; userId: string; role: string }) => {
    console.log('Socket connection confirmed:', data);
    setConnectionStatus(socketService.getStatus());
    setError(null);
  }, []);

  /**
   * Handle freelancer room join
   */
  const handleFreelancerRoomJoined = useCallback((data: { message: string; freelancersOnline: number }) => {
    console.log('Joined freelancer room:', data);
    setConnectionStatus(socketService.getStatus());
  }, []);

  /**
   * Handle socket errors
   */
  const handleSocketError = useCallback((data: { message: string }) => {
    console.error('Socket error:', data);
    setError(`Connection error: ${data.message}`);
    setConnectionStatus(socketService.getStatus());
  }, []);

  /**
   * Subscribe to socket events
   */
  const subscribeToEvents = useCallback(() => {
    if (isSubscribed.current) return;

    socketService.on('new_job_posted', handleNewJob);
    socketService.on('job_updated', handleJobUpdate);
    socketService.on('connection_confirmed', handleConnectionConfirmed);
    socketService.on('joined_freelancer_room', handleFreelancerRoomJoined);
    socketService.on('error', handleSocketError);

    isSubscribed.current = true;
  }, [handleNewJob, handleJobUpdate, handleConnectionConfirmed, handleFreelancerRoomJoined, handleSocketError]);

  /**
   * Unsubscribe from socket events
   */
  const unsubscribeFromEvents = useCallback(() => {
    if (!isSubscribed.current) return;

    socketService.off('new_job_posted', handleNewJob);
    socketService.off('job_updated', handleJobUpdate);
    socketService.off('connection_confirmed', handleConnectionConfirmed);
    socketService.off('joined_freelancer_room', handleFreelancerRoomJoined);
    socketService.off('error', handleSocketError);

    isSubscribed.current = false;
  }, [handleNewJob, handleJobUpdate, handleConnectionConfirmed, handleFreelancerRoomJoined, handleSocketError]);

  /**
   * Initialize real-time connection
   */
  const initializeRealTime = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'freelancer') {
      return;
    }

    try {
      // Subscribe to events first
      subscribeToEvents();

      // Connect to socket if not already connected
      if (!socketService.isConnected()) {
        await socketService.connect();
      }

      // Update connection status
      setConnectionStatus(socketService.getStatus());

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

    } catch (err: any) {
      console.error('Failed to initialize real-time connection:', err);
      setError(`Failed to connect to real-time updates: ${err.message}`);
    }
  }, [isAuthenticated, user?.role, subscribeToEvents]);

  /**
   * Refetch jobs manually
   */
  const refetch = useCallback(async () => {
    await fetchInitialJobs();
  }, [fetchInitialJobs]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated && user?.role === 'freelancer') {
      fetchInitialJobs();
      initializeRealTime();
    } else {
      // Clear jobs if not a freelancer or not authenticated
      setJobs([]);
      setLoading(false);
      unsubscribeFromEvents();
    }

    return () => {
      unsubscribeFromEvents();
    };
  }, [isAuthenticated, user?.role, fetchInitialJobs, initializeRealTime, unsubscribeFromEvents]);

  // Update connection status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(socketService.getStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    jobs,
    loading,
    error,
    connectionStatus,
    refetch,
    clearError
  };
};

/**
 * Hook for clients to manage real-time notifications
 */
export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user, isAuthenticated } = useAuthStore();
  const isSubscribed = useRef(false);

  const handleNotification = useCallback((data: any) => {
    setNotifications(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 notifications
  }, []);

  const subscribeToNotifications = useCallback(() => {
    if (isSubscribed.current) return;

    socketService.on('notification', handleNotification);
    isSubscribed.current = true;
  }, [handleNotification]);

  const unsubscribeFromNotifications = useCallback(() => {
    if (!isSubscribed.current) return;

    socketService.off('notification', handleNotification);
    isSubscribed.current = false;
  }, [handleNotification]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'client') {
      subscribeToNotifications();
      
      // Connect and join client room
      socketService.connect().then(() => {
        socketService.joinClientRoom();
      }).catch(console.error);
    } else {
      unsubscribeFromNotifications();
    }

    return () => {
      unsubscribeFromNotifications();
    };
  }, [isAuthenticated, user?.role, subscribeToNotifications, unsubscribeFromNotifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    clearNotifications
  };
};
