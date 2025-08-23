import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useTransactionStatus } from '@/hooks/useApi';
import { cn } from '@/lib/utils';

interface TransactionSenderProps {
  className?: string;
  defaultAmount?: string;
  defaultRecipient?: string;
  onTransactionSent?: (hash: string) => void;
}

export const TransactionSender = ({ 
  className, 
  defaultAmount = '0.001',
  defaultRecipient = '',
  onTransactionSent 
}: TransactionSenderProps) => {
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [amount, setAmount] = useState(defaultAmount);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { 
    isConnected, 
    isCorrectNetwork, 
    sendTransaction, 
    isLoading: walletLoading,
    balance 
  } = useWallet();

  const { data: txStatus, isLoading: statusLoading } = useTransactionStatus(txHash);

  const isLoading = walletLoading || statusLoading;

  const handleSendTransaction = async () => {
    if (!isConnected || !isCorrectNetwork) {
      setError('Please connect your wallet and switch to the correct network');
      return;
    }

    if (!recipient || !amount) {
      setError('Please enter recipient address and amount');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (balance && parseFloat(amount) > parseFloat(balance)) {
      setError('Insufficient balance');
      return;
    }

    setError(null);
    setTxHash(null);

    try {
      const hash = await sendTransaction(recipient, amount);
      setTxHash(hash);
      onTransactionSent?.(hash);
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
    }
  };

  const getStatusIcon = () => {
    if (!txStatus) return null;
    
    switch (txStatus.status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = () => {
    if (!txStatus) return 'secondary';
    
    switch (txStatus.status) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getExplorerUrl = () => {
    const baseUrl = import.meta.env.VITE_SNOWTRACE_URL || 'https://testnet.snowtrace.io';
    return `${baseUrl}/tx/${txHash}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Test Transaction
        </CardTitle>
        <CardDescription>
          Send a small amount of AVAX to test the transaction functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (AVAX)</Label>
          <Input
            id="amount"
            type="number"
            step="0.001"
            min="0"
            placeholder="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading}
          />
          {balance && (
            <p className="text-xs text-muted-foreground">
              Available: {parseFloat(balance).toFixed(4)} AVAX
            </p>
          )}
        </div>

        <Button
          onClick={handleSendTransaction}
          disabled={!isConnected || !isCorrectNetwork || isLoading || !!txHash}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {txHash ? 'Confirming...' : 'Sending...'}
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Transaction
            </>
          )}
        </Button>

        {txHash && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Transaction Hash</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(getExplorerUrl(), '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
            
            <code className="text-xs bg-background p-2 rounded block break-all">
              {txHash}
            </code>

            {txStatus && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <Badge variant={getStatusBadgeVariant()}>
                    {txStatus.status.charAt(0).toUpperCase() + txStatus.status.slice(1)}
                  </Badge>
                </div>
              </div>
            )}

            {txStatus?.confirmations !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Confirmations</span>
                <span className="text-sm">{txStatus.confirmations}</span>
              </div>
            )}

            {txStatus?.blockNumber && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Block Number</span>
                <span className="text-sm">{txStatus.blockNumber}</span>
              </div>
            )}
          </div>
        )}

        {!isConnected && (
          <Alert>
            <AlertDescription>
              Please connect your wallet to send transactions.
            </AlertDescription>
          </Alert>
        )}

        {isConnected && !isCorrectNetwork && (
          <Alert>
            <AlertDescription>
              Please switch to the correct network to send transactions.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
