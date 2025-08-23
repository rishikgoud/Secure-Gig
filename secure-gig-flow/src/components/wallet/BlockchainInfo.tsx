import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Activity, Zap, AlertCircle } from 'lucide-react';
import { useApiState, useChainInfo, useGasSuggestion } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BlockchainInfoProps {
  className?: string;
  showGasPrice?: boolean;
  compact?: boolean;
}

// Utility: format any gas value to Gwei
const formatGasPrice = (value?: string | number): string => {
  if (!value || isNaN(Number(value))) return 'N/A';
  const numeric = Number(value);
  const gwei = numeric > 1e6 ? numeric / 1e9 : numeric; // auto-detect Wei vs Gwei
  return `${gwei.toFixed(2)} Gwei`;
};

// Utility: safe access to gas fields
const safeGasField = (gasData: any, field: string, fallback?: string): string => {
  return formatGasPrice(gasData?.[field] ?? fallback);
};

export const BlockchainInfo = ({ className, showGasPrice = true, compact = false }: BlockchainInfoProps) => {
  const { isBackendConnected, isLoading, isError, error, refetch } = useApiState();
  const { data: chainData, isLoading: chainLoading } = useChainInfo();
  const { data: gasData, isLoading: gasLoading } = useGasSuggestion();

  const networkStatus = (() => {
    if (isLoading) return { label: 'Connecting...', variant: 'secondary' as const };
    if (isError || !isBackendConnected) return { label: 'Offline', variant: 'destructive' as const };
    return { label: 'Online', variant: 'default' as const };
  })();

  // --- Compact Mode (top bar / mini widget) ---
  if (compact) {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <Badge variant={networkStatus.variant}>{networkStatus.label}</Badge>
        </div>

        {chainData && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Block:</span>
            <span className="font-mono">{chainData.blockNumber?.toLocaleString?.() ?? 'N/A'}</span>
          </div>
        )}

        {showGasPrice && gasData && (
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-3 w-3" />
            <span className="text-muted-foreground">Gas:</span>
            <span className="font-mono">
              {safeGasField(gasData, 'maxFeePerGas', gasData?.standard?.gasPrice)}
            </span>
          </div>
        )}
      </div>
    );
  }

  // --- Full Dashboard Card ---
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Blockchain Status
          </div>
          <Button variant="ghost" size="sm" onClick={refetch} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </CardTitle>
        <CardDescription>Real-time information from the Avalanche network</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error?.message || 'Failed to connect to backend API'}</AlertDescription>
          </Alert>
        )}

        {/* API and Network Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-sm font-medium">API Status</span>
            <Badge variant={networkStatus.variant}>{networkStatus.label}</Badge>
          </div>

          {chainData ? (
            <div className="space-y-2">
              <span className="text-sm font-medium">Network</span>
              <div className="text-sm">
                {chainData.name || 'Unknown'} (ID: {chainData.chainId ?? 'N/A'})
              </div>
            </div>
          ) : chainLoading ? (
            <div className="space-y-2">
              <span className="text-sm font-medium">Network</span>
              <Skeleton className="h-4 w-24" />
            </div>
          ) : null}
        </div>

        {/* Block Number */}
        {chainData ? (
          <div className="space-y-2">
            <span className="text-sm font-medium">Latest Block</span>
            <div className="font-mono text-lg">{chainData.blockNumber?.toLocaleString?.() ?? 'N/A'}</div>
          </div>
        ) : chainLoading ? (
          <div className="space-y-2">
            <span className="text-sm font-medium">Latest Block</span>
            <Skeleton className="h-6 w-32" />
          </div>
        ) : null}

        {/* Gas Prices */}
        {showGasPrice && (
          <>
            {gasData ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">Gas Prices</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">Slow</div>
                    <div className="font-mono">
                      {safeGasField(gasData, 'baseFeePerGas', gasData?.slow?.gasPrice)}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">Standard</div>
                    <div className="font-mono">
                      {safeGasField(gasData, 'maxPriorityFeePerGas', gasData?.standard?.gasPrice)}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">Fast</div>
                    <div className="font-mono">
                      {safeGasField(gasData, 'maxFeePerGas', gasData?.fast?.gasPrice)}
                    </div>
                  </div>
                </div>
              </div>
            ) : gasLoading ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">Gas Prices</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
};
