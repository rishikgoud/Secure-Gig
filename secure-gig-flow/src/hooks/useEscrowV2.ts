import { useState, useEffect, useCallback } from 'react';
import { escrowService, EscrowData, TransactionResult, EscrowResult, CreateEscrowParams } from '../lib/escrow-service';

export interface UseEscrowState {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  signerAddress: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
}

export interface UseEscrowActions {
  initialize: () => Promise<void>;
  createEscrow: (params: CreateEscrowParams) => Promise<TransactionResult>;
  getEscrow: (gigId: string) => Promise<EscrowResult>;
  releaseEscrow: (gigId: string) => Promise<TransactionResult>;
  refundEscrow: (gigId: string) => Promise<TransactionResult>;
  switchNetwork: () => Promise<boolean>;
  checkConnection: () => Promise<void>;
  isValidAddress: (address: string) => boolean;
  normalizeAddress: (address: string) => string;
}

/**
 * React hook for escrow functionality with comprehensive state management
 */
export const useEscrow = (): [UseEscrowState, UseEscrowActions] => {
  const [state, setState] = useState<UseEscrowState>({
    isLoading: false,
    isInitialized: false,
    error: null,
    signerAddress: null,
    isConnected: false,
    isCorrectNetwork: false
  });

  const updateState = useCallback((updates: Partial<UseEscrowState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const initialize = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });
      
      await escrowService.initialize();
      
      const signerAddress = await escrowService.getSignerAddress();
      const isCorrectNetwork = await escrowService.isConnectedAndOnCorrectNetwork();
      
      updateState({
        isInitialized: true,
        isConnected: !!signerAddress,
        isCorrectNetwork,
        signerAddress,
        isLoading: false
      });
    } catch (error: any) {
      updateState({
        error: error.message || 'Failed to initialize escrow service',
        isLoading: false,
        isInitialized: false
      });
    }
  }, [updateState]);

  const createEscrow = useCallback(async (params: CreateEscrowParams): Promise<TransactionResult> => {
    try {
      updateState({ isLoading: true, error: null });
      
      const result = await escrowService.createEscrow(params);
      
      updateState({ isLoading: false });
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create escrow';
      updateState({ error: errorMessage, isLoading: false });
      return {
        success: false,
        error: errorMessage,
        errorCode: 'HOOK_ERROR'
      };
    }
  }, [updateState]);

  const getEscrow = useCallback(async (gigId: string): Promise<EscrowResult> => {
    try {
      updateState({ isLoading: true, error: null });
      
      const result = await escrowService.getEscrow(gigId);
      
      updateState({ isLoading: false });
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get escrow';
      updateState({ error: errorMessage, isLoading: false });
      return {
        success: false,
        error: errorMessage,
        errorCode: 'HOOK_ERROR'
      };
    }
  }, [updateState]);

  const releaseEscrow = useCallback(async (gigId: string): Promise<TransactionResult> => {
    try {
      updateState({ isLoading: true, error: null });
      
      const result = await escrowService.releaseEscrow(gigId);
      
      updateState({ isLoading: false });
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to release escrow';
      updateState({ error: errorMessage, isLoading: false });
      return {
        success: false,
        error: errorMessage,
        errorCode: 'HOOK_ERROR'
      };
    }
  }, [updateState]);

  const refundEscrow = useCallback(async (gigId: string): Promise<TransactionResult> => {
    try {
      updateState({ isLoading: true, error: null });
      
      const result = await escrowService.refundEscrow(gigId);
      
      updateState({ isLoading: false });
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to refund escrow';
      updateState({ error: errorMessage, isLoading: false });
      return {
        success: false,
        error: errorMessage,
        errorCode: 'HOOK_ERROR'
      };
    }
  }, [updateState]);

  const switchNetwork = useCallback(async (): Promise<boolean> => {
    try {
      updateState({ isLoading: true, error: null });
      
      const result = await escrowService.switchToCorrectNetwork();
      
      if (result) {
        // Re-check connection after network switch
        await checkConnection();
      }
      
      updateState({ isLoading: false });
      return result;
    } catch (error: any) {
      updateState({ 
        error: error.message || 'Failed to switch network', 
        isLoading: false 
      });
      return false;
    }
  }, [updateState]);

  const checkConnection = useCallback(async () => {
    try {
      const signerAddress = await escrowService.getSignerAddress();
      const isCorrectNetwork = await escrowService.isConnectedAndOnCorrectNetwork();
      
      updateState({
        isConnected: !!signerAddress,
        isCorrectNetwork,
        signerAddress
      });
    } catch (error: any) {
      updateState({
        isConnected: false,
        isCorrectNetwork: false,
        signerAddress: null,
        error: error.message || 'Failed to check connection'
      });
    }
  }, [updateState]);

  const isValidAddress = useCallback((address: string): boolean => {
    return escrowService.isValidAddress(address);
  }, []);

  const normalizeAddress = useCallback((address: string): string => {
    return escrowService.normalizeAddress(address);
  }, []);

  // Auto-check connection when wallet events occur
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = () => {
        checkConnection();
      };

      const handleChainChanged = () => {
        checkConnection();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkConnection]);

  const actions: UseEscrowActions = {
    initialize,
    createEscrow,
    getEscrow,
    releaseEscrow,
    refundEscrow,
    switchNetwork,
    checkConnection,
    isValidAddress,
    normalizeAddress
  };

  return [state, actions];
};
