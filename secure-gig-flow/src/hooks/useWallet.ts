import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletState, NetworkConfig, AVALANCHE_NETWORKS } from '@/api/types';

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    isCorrectNetwork: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetNetwork = import.meta.env.VITE_AVALANCHE_NETWORK || 'fuji';
  const expectedChainId = AVALANCHE_NETWORKS[targetNetwork].chainId;

  // Check if wallet is connected on mount
  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const checkConnection = async () => {
    try {
      if (!window.ethereum) return;
      
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (accounts.length > 0) {
        const address = accounts[0];
        const balance = await getBalance(address);
        const numericChainId = parseInt(chainId, 16);
        
        setWalletState({
          isConnected: true,
          address,
          balance,
          chainId: numericChainId,
          isCorrectNetwork: numericChainId === expectedChainId,
        });
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      checkConnection();
    }
  };

  const handleChainChanged = () => {
    checkConnection();
  };

  const getBalance = async (address: string): Promise<string> => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (err) {
      console.error('Error getting balance:', err);
      return '0';
    }
  };

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!window.ethereum) {
        throw new Error('No wallet found. Please install Core Wallet or MetaMask.');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      const address = accounts[0];
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const numericChainId = parseInt(chainId, 16);
      const balance = await getBalance(address);

      setWalletState({
        isConnected: true,
        address,
        balance,
        chainId: numericChainId,
        isCorrectNetwork: numericChainId === expectedChainId,
      });

      // Auto-switch to correct network if needed
      if (numericChainId !== expectedChainId) {
        await switchNetwork();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [expectedChainId]);

  const disconnect = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
      chainId: null,
      isCorrectNetwork: false,
    });
    setError(null);
  }, []);

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const network = AVALANCHE_NETWORKS[targetNetwork];
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${network.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          const network = AVALANCHE_NETWORKS[targetNetwork];
          
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${network.chainId.toString(16)}`,
                chainName: network.chainName,
                nativeCurrency: network.nativeCurrency,
                rpcUrls: network.rpcUrls,
                blockExplorerUrls: network.blockExplorerUrls,
              },
            ],
          });
        } catch (addError: any) {
          setError(`Failed to add network: ${addError.message}`);
        }
      } else {
        setError(`Failed to switch network: ${switchError.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [targetNetwork]);

  const sendTransaction = useCallback(async (to: string, value: string) => {
    if (!walletState.isConnected || !window.ethereum) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const tx = await signer.sendTransaction({
        to,
        value: ethers.parseEther(value),
      });

      return tx.hash;
    } catch (err: any) {
      throw new Error(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  }, [walletState.isConnected]);

  const refreshBalance = useCallback(async () => {
    if (walletState.address) {
      const balance = await getBalance(walletState.address);
      setWalletState(prev => ({ ...prev, balance }));
    }
  }, [walletState.address]);

  return {
    ...walletState,
    isLoading,
    error,
    connect,
    disconnect,
    switchNetwork,
    sendTransaction,
    refreshBalance,
    targetNetwork: AVALANCHE_NETWORKS[targetNetwork],
  };
};
