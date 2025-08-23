import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Shield, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { checkEnvironmentVariables } from '../utils/envChecker';

const Auth = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const navigate = useNavigate();

  // Debug environment variables on component load
  useEffect(() => {
    // checkEnvironmentVariables();
  }, []);

  const fujiTestnet = {
    chainId: '0xa869',
    chainName: 'Avalanche Fuji Testnet',
    rpcUrls: ['https://rpc.ankr.com/avalanche_fuji'],
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    blockExplorerUrls: ['https://testnet.snowtrace.io']
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    if (!window.ethereum) {
      alert('MetaMask is not installed. Please install it to continue.');
      setIsConnecting(false);
      return;
    }

    try {
      // First, request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      
      // Then check the network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      if (chainId !== fujiTestnet.chainId) {
        try {
          // Try to switch to Avalanche Fuji
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: fujiTestnet.chainId }],
          });
        } catch (switchError: any) {
          console.error('Network switch error:', switchError);
          
          // Network doesn't exist, try to add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [fujiTestnet],
              });
            } catch (addError: any) {
              console.error('Failed to add the Fuji network:', addError);
              alert(`Failed to add Avalanche Fuji network. Please add it manually in MetaMask:
              
Network Name: ${fujiTestnet.chainName}
RPC URL: ${fujiTestnet.rpcUrls[0]}
Chain ID: ${parseInt(fujiTestnet.chainId, 16)}
Currency Symbol: ${fujiTestnet.nativeCurrency.symbol}
Block Explorer: ${fujiTestnet.blockExplorerUrls[0]}`);
              setIsConnecting(false);
              return;
            }
          } 
          // User rejected the request or other error
          else if (switchError.code === 4001 || switchError.code === 4100) {
            alert(`Please manually switch to Avalanche Fuji network in MetaMask:

1. Open MetaMask
2. Click the network dropdown at the top
3. Select "Add Network" or "Custom RPC"
4. Enter the following details:
   - Network Name: ${fujiTestnet.chainName}
   - RPC URL: ${fujiTestnet.rpcUrls[0]}
   - Chain ID: ${parseInt(fujiTestnet.chainId, 16)}
   - Currency Symbol: ${fujiTestnet.nativeCurrency.symbol}

Then click "Connect to Avalanche Fuji" again.`);
            setIsConnecting(false);
            return;
          } else {
            console.error('Unexpected switch error:', switchError);
            alert('Failed to switch networks. Please manually switch to Avalanche Fuji in MetaMask.');
            setIsConnecting(false);
            return;
          }
        }
      }

      // If we reach here, we're on the correct network
      setWalletAddress(account);
      setWalletConnected(true);
      localStorage.setItem('walletAddress', account);
      
      // Navigate to role selection page after successful connection
      navigate('/role-selection');

    } catch (error: any) {
      console.error('Error connecting to MetaMask:', error);
      if (error.code === 4001) {
        alert('Connection rejected. Please approve the connection in MetaMask.');
      } else {
        alert('Failed to connect to MetaMask. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleContinue = () => {
    navigate('/role-selection');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-primary p-4 rounded-2xl glow-primary">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-heading font-bold text-gradient-primary">
            Connect Your Wallet
          </h1>
          <p className="text-muted-foreground">
            Secure authentication powered by blockchain technology
          </p>
        </div>

        {/* Wallet Connection Card */}
        <Card className="card-web3 border-2 border-border hover:border-primary/30 transition-all duration-300">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold">Choose Your Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!walletConnected ? (
              <>
                {/* Wallet Options */}
                <div className="space-y-3">
                  <Button
                    className="w-full btn-primary text-lg py-6 group"
                    onClick={connectWallet}
                    disabled={isConnecting}
                  >
                    <Wallet className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                    {isConnecting ? 'Connecting...' : 'Connect to Avalanche Fuji'}
                    <ArrowRight className="h-5 w-5 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                {/* Security Features */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>End-to-end encryption</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>No personal data stored</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Blockchain-verified identity</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Connected State */}
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Badge className="bg-green-500/10 text-green-400 border border-green-400/30 px-4 py-2">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Wallet Connected
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Connected Address:</p>
                    <p className="font-mono text-sm bg-muted px-3 py-2 rounded-lg break-all">
                      {walletAddress}
                    </p>
                  </div>
                  <Button
                    className="w-full btn-hero text-lg py-6 group"
                    onClick={handleContinue}
                  >
                    Continue to Platform
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Shield className="h-6 w-6 text-primary mx-auto" />
            </div>
            <p className="text-xs text-muted-foreground">Secure</p>
          </div>
          <div className="space-y-2">
            <div className="bg-secondary/10 p-3 rounded-lg">
              <Zap className="h-6 w-6 text-secondary mx-auto" />
            </div>
            <p className="text-xs text-muted-foreground">Fast</p>
          </div>
          <div className="space-y-2">
            <div className="bg-accent/10 p-3 rounded-lg">
              <Wallet className="h-6 w-6 text-accent mx-auto" />
            </div>
            <p className="text-xs text-muted-foreground">Decentralized</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
