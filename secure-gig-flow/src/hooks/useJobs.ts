import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';
import { JobPost, JobSearchFilters } from '../api/types';
import { useToast } from './use-toast';

interface CreateJobPostRequest {
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: {
    type: 'fixed' | 'hourly';
    amount: number;
    currency: string;
  };
  timeline: {
    duration: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
    startDate?: string;
    endDate?: string;
  };
  requirements?: {
    experienceLevel: 'entry' | 'intermediate' | 'expert';
    minimumRating?: number;
    portfolioRequired: boolean;
    testRequired: boolean;
  };
  location?: {
    type: 'remote' | 'onsite' | 'hybrid';
    city?: string;
    country?: string;
    timezone?: string;
  };
  urgency?: 'low' | 'medium' | 'high';
  visibility?: 'public' | 'private';
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  escrow?: {
    isEnabled: boolean;
    contractAddress?: string;
    amount?: number;
  };
  tags?: string[];
  featured?: boolean;
}

interface JobsState {
  jobs: JobPost[];
  myJobs: JobPost[];
  featuredJobs: JobPost[];
  categories: string[];
  popularSkills: string[];
  isLoading: boolean;
  error: string | null;
}

export const useJobs = () => {
  const [jobsState, setJobsState] = useState<JobsState>({
    jobs: [],
    myJobs: [],
    featuredJobs: [],
    categories: [],
    popularSkills: [],
    isLoading: false,
    error: null,
  });

  const { toast } = useToast();

  const fetchJobs = useCallback(async (filters?: JobSearchFilters) => {
    try {
      setJobsState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Integrates with: GET /api/jobs
      const response = await apiClient.getJobs(filters);
      
      setJobsState(prev => ({
        ...prev,
        jobs: response.data.jobPosts,
        isLoading: false,
        error: null,
      }));

      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch jobs';
      
      setJobsState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast({
        title: "Failed to fetch jobs",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  }, [toast]);

  const fetchMyJobs = useCallback(async () => {
    try {
      setJobsState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Integrates with: GET /api/jobs/my/posts
      const response = await apiClient.getMyJobs();
      
      setJobsState(prev => ({
        ...prev,
        myJobs: response.data.jobPosts,
        isLoading: false,
        error: null,
      }));

      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch your jobs';
      
      setJobsState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast({
        title: "Failed to fetch your jobs",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  }, [toast]);

  const fetchFeaturedJobs = useCallback(async () => {
    try {
      setJobsState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Integrates with: GET /api/jobs/featured
      const response = await apiClient.getFeaturedJobs();
      
      setJobsState(prev => ({
        ...prev,
        requirements: {
          experienceLevel: 'intermediate',
          portfolioRequired: false,
          testRequired: false
        },
        featuredJobs: response.data.jobPosts,
        isLoading: false,
        error: null,
      }));

      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch featured jobs';
      
      setJobsState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      throw error;
    }
  }, [toast]);

  const fetchJobCategories = useCallback(async () => {
    try {
      // Integrates with: GET /api/jobs/categories
      const response = await apiClient.getJobCategories();
      
      setJobsState(prev => ({
        ...prev,
        categories: response.data.categories,
      }));

      return response;
    } catch (error: any) {
      console.error('Failed to fetch job categories:', error);
      throw error;
    }
  }, []);

  const fetchPopularSkills = useCallback(async () => {
    try {
      // Integrates with: GET /api/jobs/skills/popular
      const response = await apiClient.getPopularSkills();
      
      setJobsState(prev => ({
        ...prev,
        popularSkills: response.data.skills,
      }));

      return response;
    } catch (error: any) {
      console.error('Failed to fetch popular skills:', error);
      throw error;
    }
  }, []);

  const createJob = useCallback(async (jobData: CreateJobPostRequest) => {
    try {
      setJobsState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Integrates with: POST /api/jobs
      const jobPayload = {
        ...jobData,
        category: jobData.category as any, // Cast to JobCategory type
        requirements: jobData.requirements || {
          experienceLevel: 'intermediate' as const,
          portfolioRequired: false,
          testRequired: false
        },
        visibility: jobData.visibility || 'public',
        status: jobData.status || 'active',
        escrow: jobData.escrow || { isEnabled: false },
        urgency: jobData.urgency || 'medium',
        location: jobData.location || { type: 'remote' },
        tags: jobData.tags || [],
        featured: jobData.featured || false
      };
      const response = await apiClient.createJob(jobPayload);
      
      // Add the new job to myJobs list
      setJobsState(prev => ({
        ...prev,
        myJobs: [response.data.jobPost, ...prev.myJobs],
        isLoading: false,
        error: null,
      }));

      toast({
        title: "Job posted successfully!",
        description: `Your job "${response.data.jobPost.title}" has been posted.`,
      });

      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create job post';
      
      setJobsState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast({
        title: "Failed to post job",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  }, [toast]);

  const updateJob = useCallback(async (jobId: string, jobData: Partial<JobPost>) => {
    try {
      setJobsState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Integrates with: PATCH /api/jobs/:jobId
      const response = await apiClient.updateJob(jobId, jobData);
      
      // Update the job in myJobs list
      setJobsState(prev => ({
        ...prev,
        myJobs: prev.myJobs.map(job => 
          job._id === jobId ? response.data.jobPost : job
        ),
        jobs: prev.jobs.map(job => 
          job._id === jobId ? response.data.jobPost : job
        ),
        isLoading: false,
        error: null,
      }));

      toast({
        title: "Job updated successfully!",
        description: `Your job "${response.data.jobPost.title}" has been updated.`,
      });

      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update job';
      
      setJobsState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast({
        title: "Failed to update job",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  }, [toast]);

  const deleteJob = useCallback(async (jobId: string) => {
    try {
      setJobsState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Integrates with: DELETE /api/jobs/:jobId
      await apiClient.deleteJob(jobId);
      
      // Remove the job from lists
      setJobsState(prev => ({
        ...prev,
        myJobs: prev.myJobs.filter(job => job._id !== jobId),
        jobs: prev.jobs.filter(job => job._id !== jobId),
        isLoading: false,
        error: null,
      }));

      toast({
        title: "Job deleted successfully!",
        description: "Your job post has been removed.",
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete job';
      
      setJobsState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast({
        title: "Failed to delete job",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  }, [toast]);

  const updateJobStatus = useCallback(async (jobId: string, status: string) => {
    try {
      setJobsState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Integrates with: PATCH /api/jobs/:jobId/status
      const response = await apiClient.updateJobStatus(jobId, status);
      
      // Update the job status in lists
      setJobsState(prev => ({
        ...prev,
        myJobs: prev.myJobs.map(job => 
          job._id === jobId ? { ...job, status: status as any } : job
        ),
        jobs: prev.jobs.map(job => 
          job._id === jobId ? { ...job, status: status as any } : job
        ),
        isLoading: false,
        error: null,
      }));

      toast({
        title: "Job status updated!",
        description: `Job status changed to ${status}.`,
      });

      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update job status';
      
      setJobsState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast({
        title: "Failed to update job status",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  }, [toast]);

  const getJobById = useCallback(async (jobId: string) => {
    try {
      // Integrates with: GET /api/jobs/:jobId
      const response = await apiClient.getJob(jobId);
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch job details';
      
      toast({
        title: "Failed to fetch job details",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  }, [toast]);

  return {
    ...jobsState,
    fetchJobs,
    fetchMyJobs,
    fetchFeaturedJobs,
    fetchJobCategories,
    fetchPopularSkills,
    createJob,
    updateJob,
    deleteJob,
    updateJobStatus,
    getJobById,
  };
};
