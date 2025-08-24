import React, { createContext, useContext, useEffect, useState } from 'react';
import { EscrowService, EscrowData } from '../../lib/escrow';
import { useEscrowEvents } from '../../hooks/useEscrowEvents';

const escrowService = new EscrowService();

interface EscrowContextType {
  isInitialized: boolean;
  isConnected: boolean;
  userAddress: string | null;
  initializeEscrow: () => Promise<void>;
  refreshEscrows: () => void;
}

const EscrowContext = createContext<EscrowContextType | undefined>(undefined);

interface EscrowProviderProps {
  children: React.ReactNode;
  userRole?: 'client' | 'freelancer';
}

export function EscrowProvider({ children, userRole }: EscrowProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const initializeEscrow = async () => {
    try {
      await escrowService.initialize();
      setIsInitialized(true);
      setIsConnected(true);
      
      // Get user address from wallet
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setUserAddress(accounts[0]);
        }
      }
    } catch (error) {
      console.error('Failed to initialize escrow service:', error);
      setIsInitialized(false);
      setIsConnected(false);
    }
  };

  const refreshEscrows = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Set up real-time event listeners
  useEscrowEvents({
    userAddress: userAddress || undefined,
    userRole,
    onEscrowUpdate: refreshEscrows
  });

  useEffect(() => {
    // Auto-initialize if wallet is already connected
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            initializeEscrow();
          }
        })
        .catch(console.error);
    }

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setUserAddress(accounts[0]);
          if (!isInitialized) {
            initializeEscrow();
          }
        } else {
          setUserAddress(null);
          setIsConnected(false);
          setIsInitialized(false);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [isInitialized]);

  const value: EscrowContextType = {
    isInitialized,
    isConnected,
    userAddress,
    initializeEscrow,
    refreshEscrows
  };

  return (
    <EscrowContext.Provider value={value}>
      {children}
    </EscrowContext.Provider>
  );
}

export function useEscrow() {
  const context = useContext(EscrowContext);
  if (context === undefined) {
    throw new Error('useEscrow must be used within an EscrowProvider');
  }
  return context;
}
