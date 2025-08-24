import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/use-toast';

/**
 * Wallet Connection Page - Post-authentication wallet integration
 * Users reach this page after successful login/signup with role already selected
 */
export const WalletConnectionPage: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();

  // Check if user already has wallet connected
  useEffect(() => {
    if (user?.walletAddress) {
      setWalletAddress(user.walletAddress);
      setConnectionStatus('connected');
    }
  }, [user]);

  const connectWallet = async () => {
    setIsConnecting(true);
    setConnectionStatus('connecting');

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask and try again.');
      }

      const address = accounts[0];
      setWalletAddress(address);
      setConnectionStatus('connected');

      // Update user profile with wallet address
      if (user) {
        await updateUser({ walletAddress: address });
      }

      toast({
        title: "Wallet Connected Successfully",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });

      // Redirect to appropriate dashboard based on user role
      setTimeout(() => {
        if (user?.role === 'client') {
          navigate('/client-dashboard', { replace: true });
        } else if (user?.role === 'freelancer') {
          navigate('/freelancer-dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 1500);

    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setConnectionStatus('error');
      
      toast({
        title: "Wallet Connection Failed",
        description: error.message || 'Failed to connect wallet. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const skipWalletConnection = () => {
    toast({
      title: "Wallet Connection Skipped",
      description: "You can connect your wallet later from your profile settings.",
    });

    // Redirect to dashboard without wallet
    if (user?.role === 'client') {
      navigate('/client-dashboard', { replace: true });
    } else if (user?.role === 'freelancer') {
      navigate('/freelancer-dashboard', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connecting':
        return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
      case 'connected':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      default:
        return <Wallet className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Connecting to wallet...';
      case 'connected':
        return `Connected: ${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}`;
      case 'error':
        return 'Connection failed';
      default:
        return 'Not connected';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-transparent border-gray-700 shadow-2xl backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Connect Your Wallet
          </CardTitle>
          <CardDescription className="text-center text-gray-300">
            Connect your Web3 wallet to start using SecureGig's decentralized features
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-300">
              Welcome, <span className="font-semibold text-white">{user?.name}</span>
            </p>
            <Badge variant="outline" className="capitalize border-gray-600 text-white">
              {user?.role}
            </Badge>
          </div>

          {/* Connection Status */}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Wallet Status:</span>
              <span className="text-sm text-gray-300">{getStatusText()}</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-white">With wallet connection you can:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Make secure escrow payments
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Receive payments instantly
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Access smart contract features
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {connectionStatus !== 'connected' ? (
              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Connect MetaMask
                  </div>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (user?.role === 'client') {
                    navigate('/client-dashboard', { replace: true });
                  } else if (user?.role === 'freelancer') {
                    navigate('/freelancer-dashboard', { replace: true });
                  } else {
                    navigate('/dashboard', { replace: true });
                  }
                }}
                className="w-full"
              >
                Continue to Dashboard
              </Button>
            )}

            <Button
              variant="outline"
              onClick={skipWalletConnection}
              className="w-full border-gray-600 text-white hover:bg-gray-700"
              disabled={isConnecting}
            >
              Skip for now
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            You can connect your wallet later from your profile settings
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
