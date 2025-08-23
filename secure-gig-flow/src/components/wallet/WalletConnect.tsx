import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wallet, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { cn } from '@/lib/utils';

interface WalletConnectProps {
  className?: string;
  showBalance?: boolean;
  compact?: boolean;
}

export const WalletConnect = ({ className, showBalance = true, compact = false }: WalletConnectProps) => {
  const {
    isConnected,
    address,
    balance,
    chainId,
    isCorrectNetwork,
    isLoading,
    error,
    connect,
    disconnect,
    switchNetwork,
    targetNetwork,
  } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (bal: string) => {
    return parseFloat(bal).toFixed(4);
  };

  const getNetworkBadgeVariant = () => {
    if (!isConnected) return 'secondary';
    return isCorrectNetwork ? 'default' : 'destructive';
  };

  const getNetworkName = () => {
    if (!chainId) return 'Unknown';
    if (chainId === 43114) return 'Avalanche Mainnet';
    if (chainId === 43113) return 'Avalanche Fuji';
    return `Chain ${chainId}`;
  };

  if (compact && isConnected) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Badge variant={getNetworkBadgeVariant()}>
          {getNetworkName()}
        </Badge>
        <span className="text-sm font-medium">{formatAddress(address!)}</span>
        {showBalance && balance && (
          <span className="text-sm text-muted-foreground">
            {formatBalance(balance)} AVAX
          </span>
        )}
        <Button variant="outline" size="sm" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Connection
        </CardTitle>
        <CardDescription>
          Connect your Avalanche wallet to interact with the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isConnected ? (
          <Button 
            onClick={connect} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Address</span>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {formatAddress(address!)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const explorerUrl = isCorrectNetwork 
                      ? `${targetNetwork.blockExplorerUrls[0]}address/${address}`
                      : `https://snowtrace.io/address/${address}`;
                    window.open(explorerUrl, '_blank');
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {showBalance && balance && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Balance</span>
                <span className="text-sm font-mono">
                  {formatBalance(balance)} AVAX
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Network</span>
              <div className="flex items-center gap-2">
                <Badge variant={getNetworkBadgeVariant()}>
                  {getNetworkName()}
                </Badge>
                {!isCorrectNetwork && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={switchNetwork}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      'Switch'
                    )}
                  </Button>
                )}
              </div>
            </div>

            {!isCorrectNetwork && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please switch to {targetNetwork.chainName} to use all features.
                </AlertDescription>
              </Alert>
            )}

            <Button 
              variant="outline" 
              onClick={disconnect}
              className="w-full"
            >
              Disconnect Wallet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
