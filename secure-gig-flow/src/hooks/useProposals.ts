import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/api/client';
import { PopulatedProposal, ProposalSearchFilters } from '@/api/types';
import { useToast } from '@/hooks/use-toast';
import { socketService } from '@/services/socketService';

export interface UseProposalsReturn {
  proposals: PopulatedProposal[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  refetch: () => Promise<void>;
  updateFilters: (filters: Partial<ProposalSearchFilters>) => void;
  clearError: () => void;
}

export const useProposals = (
  freelancerId?: string,
  initialFilters: ProposalSearchFilters = {}
): UseProposalsReturn => {
  const [proposals, setProposals] = useState<PopulatedProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ProposalSearchFilters>(initialFilters);
  const { toast } = useToast();

  const fetchProposals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 useProposals: Fetching proposals with freelancerId:', freelancerId, 'filters:', filters);

      let response;
      if (freelancerId) {
        // Get proposals for a specific freelancer (using user ID route)
        response = await apiClient.getUserProposals(freelancerId, filters);
      } else {
        // Get current user's proposals (uses authentication from token)
        response = await apiClient.getMyProposals(filters);
      }

      console.log('🔍 useProposals: API response:', response);

      if (response) {
        // Handle both nested and direct response structures
        const proposalsData = response.proposals || response.data?.proposals || [];
        const paginationData = response.pagination || response.data?.pagination || {};
        
        console.log('🔍 useProposals: Extracted proposals:', proposalsData);
        console.log('🔍 useProposals: Extracted pagination:', paginationData);
        
        setProposals(proposalsData);
        setTotalCount(paginationData.totalCount || 0);
        setTotalPages(paginationData.totalPages || 0);
        setCurrentPage(paginationData.page || 1);
      } else {
        console.log('❌ useProposals: No response data received');
        setProposals([]);
        setTotalCount(0);
        setTotalPages(0);
        setCurrentPage(1);
      }
    } catch (err: any) {
      console.error('❌ useProposals: Error fetching proposals:', err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to load proposals. Please try again.';
      setError(errorMessage);
      
      // Set empty state on error instead of localStorage fallback
      setProposals([]);
      setTotalCount(0);
      setTotalPages(0);
      setCurrentPage(1);
      console.log('💾 useProposals: Set empty state due to API error');
    } finally {
      setLoading(false);
    }
  }, [freelancerId, filters]);

  const updateFilters = useCallback((newFilters: Partial<ProposalSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refetch = useCallback(async () => {
    await fetchProposals();
  }, [fetchProposals]);

  // Handle real-time proposal status updates
  useEffect(() => {
    const handleProposalStatusUpdate = (data: any) => {
      setProposals(prev => 
        prev.map(proposal => 
          proposal._id === data.proposalId 
            ? { ...proposal, status: data.status, clientResponse: data.clientResponse }
            : proposal
        )
      );

      // Show notification for status changes
      if (data.status === 'accepted') {
        toast({
          title: "Proposal Accepted! 🎉",
          description: `Your proposal for "${data.jobTitle}" has been accepted!`,
        });
      } else if (data.status === 'rejected') {
        toast({
          title: "Proposal Update",
          description: `Your proposal for "${data.jobTitle}" has been updated.`,
          variant: "destructive"
        });
      }
    };

    if (socketService.isConnected()) {
      socketService.on('proposalStatusUpdate' as any, handleProposalStatusUpdate);
    }

    return () => {
      socketService.off('proposalStatusUpdate' as any, handleProposalStatusUpdate);
    };
  }, [toast]);

  // Fetch proposals on mount and when filters change
  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  return {
    proposals,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    refetch,
    updateFilters,
    clearError
  };
};

export default useProposals;
