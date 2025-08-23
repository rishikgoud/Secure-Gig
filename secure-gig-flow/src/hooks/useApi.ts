import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ChainInfo, GasSuggestion, WalletBalance, Transaction, TransactionStatus } from '@/api/types';

// Query keys for caching
export const queryKeys = {
  health: ['health'],
  chainInfo: ['chain', 'info'],
  gasSuggestion: ['chain', 'gas'],
  walletBalance: (address: string) => ['wallet', address, 'balance'],
  walletActivity: (address: string, limit: number) => ['wallet', address, 'activity', limit],
  transaction: (hash: string) => ['transaction', hash],
  transactionStatus: (hash: string) => ['transaction', hash, 'status'],
  jobState: (jobId: number) => ['escrow', 'job', jobId],
} as const;

// Health check hook
export const useHealthCheck = () => {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiClient.healthCheck(),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
  });
};

// Chain information hook
export const useChainInfo = () => {
  return useQuery({
    queryKey: queryKeys.chainInfo,
    queryFn: () => apiClient.getChainInfo(),
    staleTime: 60000, // 1 minute
    refetchInterval: 60000,
  });
};

// Gas suggestion hook
export const useGasSuggestion = () => {
  return useQuery({
    queryKey: queryKeys.gasSuggestion,
    queryFn: () => apiClient.getGasSuggestion(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000,
  });
};

// Wallet balance hook
export const useWalletBalance = (address: string | null) => {
  return useQuery({
    queryKey: queryKeys.walletBalance(address || ''),
    queryFn: () => apiClient.getWalletBalance(address!),
    enabled: !!address,
    staleTime: 30000,
    refetchInterval: 30000,
  });
};

// Wallet activity hook
export const useWalletActivity = (address: string | null, limit: number = 20) => {
  return useQuery({
    queryKey: queryKeys.walletActivity(address || '', limit),
    queryFn: () => apiClient.getWalletActivity(address!, limit),
    enabled: !!address,
    staleTime: 60000,
  });
};

// Transaction details hook
export const useTransaction = (hash: string | null) => {
  return useQuery({
    queryKey: queryKeys.transaction(hash || ''),
    queryFn: () => apiClient.getTransaction(hash!),
    enabled: !!hash,
    staleTime: 300000, // 5 minutes
  });
};

// Transaction status hook with polling
export const useTransactionStatus = (hash: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.transactionStatus(hash || ''),
    queryFn: () => apiClient.getTransactionStatus(hash!),
    enabled: !!hash && enabled,
    refetchInterval: (query) => {
      // Stop polling if transaction is confirmed or failed
      if (query.state.data && (query.state.data.status === 'confirmed' || query.state.data.status === 'failed')) {
        return false;
      }
      return 5000; // Poll every 5 seconds for pending transactions
    },
    staleTime: 0, // Always fetch fresh data
  });
};

// Job state hook
export const useJobState = (jobId: number | null) => {
  return useQuery({
    queryKey: queryKeys.jobState(jobId || 0),
    queryFn: () => apiClient.getJobState(jobId!),
    enabled: !!jobId,
    staleTime: 60000,
  });
};

// Mutation hooks for actions
export const useWaitForTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ hash, confirmations }: { hash: string; confirmations?: number }) =>
      apiClient.waitForTransaction(hash, confirmations),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.transaction(variables.hash) });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionStatus(variables.hash) });
    },
  });
};

export const useEscrowQuote = () => {
  return useMutation({
    mutationFn: ({ type, data }: { type: 'deposit' | 'release' | 'dispute'; data: any }) =>
      apiClient.getEscrowQuote(type, data),
  });
};

// Custom hook for managing API state
export const useApiState = () => {
  const healthCheck = useHealthCheck();
  const chainInfo = useChainInfo();
  const gasSuggestion = useGasSuggestion();

  const isLoading = healthCheck.isLoading || chainInfo.isLoading || gasSuggestion.isLoading;
  const isError = healthCheck.isError || chainInfo.isError || gasSuggestion.isError;
  const error = healthCheck.error || chainInfo.error || gasSuggestion.error;

  const isBackendConnected = healthCheck.isSuccess && !healthCheck.isError;

  return {
    isLoading,
    isError,
    error,
    isBackendConnected,
    healthData: healthCheck.data,
    chainData: chainInfo.data,
    gasData: gasSuggestion.data,
    refetch: () => {
      healthCheck.refetch();
      chainInfo.refetch();
      gasSuggestion.refetch();
    },
  };
};
