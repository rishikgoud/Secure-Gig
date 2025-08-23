import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Shield, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface WalletConnectProps {
  onConnect: (address: string) => void;
}

export const WalletConnect = ({ onConnect }: WalletConnectProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const walletOptions = [
    {
      id: 'metamask',
      name: 'MetaMask',
      description: 'Connect using MetaMask wallet',
      icon: '🦊',
      popular: true
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      description: 'Connect with WalletConnect protocol',
      icon: '🔗',
      popular: false
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      description: 'Connect using Coinbase Wallet',
      icon: '💙',
      popular: false
    }
  ];

  const handleConnect = async (walletId: string) => {
    setIsConnecting(true);
    setError('');

    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock wallet address generation
      const mockAddress = `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`;
      
      // In a real implementation, you would:
      // 1. Check if wallet is installed
      // 2. Request account access
      // 3. Get the actual wallet address
      // 4. Handle network switching if needed
      
      onConnect(mockAddress);
    } catch (err) {
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="card-web3 w-full max-w-md">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center mb-4">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-heading">Connect Wallet</CardTitle>
        <CardDescription>
          Choose your preferred wallet to connect to SecureGig
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        <div className="space-y-3">
          {walletOptions.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleConnect(wallet.id)}
              disabled={isConnecting}
              className="w-full p-4 border border-border/50 rounded-xl hover:border-primary/50 hover:bg-accent/5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{wallet.icon}</div>
                  <div className="text-left">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-foreground">{wallet.name}</h3>
                      {wallet.popular && (
                        <Badge variant="secondary" className="text-xs">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{wallet.description}</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </button>
          ))}
        </div>

        {isConnecting && (
          <div className="flex items-center justify-center space-x-2 py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-muted-foreground">Connecting wallet...</span>
          </div>
        )}

        <div className="pt-4 border-t border-border/50">
          <div className="flex items-start space-x-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 mt-0.5 text-primary" />
            <div>
              <p className="font-medium text-foreground mb-1">Secure & Trustless</p>
              <p>Your funds are protected by smart contracts. We never have access to your private keys.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>End-to-end encrypted transactions</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>Non-custodial wallet integration</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>Smart contract escrow protection</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};