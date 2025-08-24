import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { escrowService, EscrowStatus, type EscrowData } from '@/lib/escrow';
import { useToast } from '@/hooks/use-toast';
import { Shield, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

interface EscrowButtonProps {
  gigId: number;
  gigTitle: string;
  freelancerAddress: string;
  proposalAmount: string;
  userRole: 'client' | 'freelancer';
  onEscrowUpdate?: (escrowData: EscrowData | null) => void;
}

export function EscrowButton({ 
  gigId, 
  gigTitle, 
  freelancerAddress, 
  proposalAmount, 
  userRole,
  onEscrowUpdate 
}: EscrowButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [escrowData, setEscrowData] = useState<EscrowData | null>(null);
  const [amount, setAmount] = useState(proposalAmount.replace(' AVAX', ''));
  const { toast } = useToast();

  const loadEscrowData = async () => {
    try {
      const data = await escrowService.getEscrow(gigId);
      setEscrowData(data);
      onEscrowUpdate?.(data);
    } catch (error) {
      console.error('Error loading escrow data:', error);
    }
  };

  const handleCreateEscrow = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount in AVAX",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await escrowService.createEscrow(gigId, freelancerAddress, gigTitle, amount);
      await loadEscrowData();
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating escrow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReleaseEscrow = async () => {
    setIsLoading(true);
    try {
      await escrowService.releaseEscrow(gigId);
      await loadEscrowData();
    } catch (error) {
      console.error('Error releasing escrow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefundEscrow = async () => {
    setIsLoading(true);
    try {
      await escrowService.refundEscrow(gigId);
      await loadEscrowData();
    } catch (error) {
      console.error('Error refunding escrow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWork = async () => {
    setIsLoading(true);
    try {
      await escrowService.startWork(gigId);
      await loadEscrowData();
    } catch (error) {
      console.error('Error starting work:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load escrow data when component mounts or dialog opens
  React.useEffect(() => {
    if (isOpen) {
      loadEscrowData();
    }
  }, [isOpen, gigId]);

  const getStatusIcon = (status: EscrowStatus) => {
    switch (status) {
      case EscrowStatus.Pending:
        return <Clock className="h-4 w-4" />;
      case EscrowStatus.Active:
        return <Shield className="h-4 w-4" />;
      case EscrowStatus.Completed:
        return <CheckCircle className="h-4 w-4" />;
      case EscrowStatus.Cancelled:
        return <XCircle className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const renderEscrowActions = () => {
    if (!escrowData) {
      // No escrow exists - show create button for clients
      if (userRole === 'client') {
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (AVAX)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount in AVAX"
              />
            </div>
            <Button 
              onClick={handleCreateEscrow} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating Escrow...' : 'Create Escrow & Hire'}
            </Button>
          </div>
        );
      } else {
        return (
          <p className="text-muted-foreground text-center">
            Waiting for client to create escrow and secure funds...
          </p>
        );
      }
    }

    // Escrow exists - show status and actions
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Escrow Status</CardTitle>
              <Badge 
                variant={escrowData.status === EscrowStatus.Completed ? 'default' : 'secondary'}
                className={escrowService.getStatusColor(escrowData.status)}
              >
                <div className="flex items-center gap-1">
                  {getStatusIcon(escrowData.status)}
                  {escrowService.getStatusText(escrowData.status)}
                </div>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold">{escrowData.amount} AVAX</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client:</span>
              <span className="font-mono text-sm">{escrowData.client.slice(0, 6)}...{escrowData.client.slice(-4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Freelancer:</span>
              <span className="font-mono text-sm">{escrowData.freelancer.slice(0, 6)}...{escrowData.freelancer.slice(-4)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons based on status and user role */}
        <div className="space-y-2">
          {escrowData.status === EscrowStatus.Pending && userRole === 'freelancer' && (
            <Button onClick={handleStartWork} disabled={isLoading} className="w-full">
              {isLoading ? 'Starting Work...' : 'Start Work'}
            </Button>
          )}

          {(escrowData.status === EscrowStatus.Pending || escrowData.status === EscrowStatus.Active) && userRole === 'client' && (
            <>
              <Button onClick={handleReleaseEscrow} disabled={isLoading} className="w-full">
                {isLoading ? 'Releasing Funds...' : 'Release Funds to Freelancer'}
              </Button>
              <Button 
                onClick={handleRefundEscrow} 
                disabled={isLoading} 
                variant="outline" 
                className="w-full"
              >
                {isLoading ? 'Processing Refund...' : 'Cancel & Refund'}
              </Button>
            </>
          )}

          {escrowData.status === EscrowStatus.Completed && (
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-semibold">
                {userRole === 'client' ? 'Funds released to freelancer' : 'Funds received successfully'}
              </p>
            </div>
          )}

          {escrowData.status === EscrowStatus.Cancelled && (
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-red-800 font-semibold">
                Escrow cancelled - funds refunded to client
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={escrowData ? "outline" : "default"} 
          size="sm"
          className="flex items-center gap-2"
        >
          <Shield className="h-4 w-4" />
          {escrowData ? `Escrow: ${escrowService.getStatusText(escrowData.status)}` : 'Hire with Escrow'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Secure Escrow
          </DialogTitle>
          <DialogDescription>
            {gigTitle}
          </DialogDescription>
        </DialogHeader>
        
        {renderEscrowActions()}
      </DialogContent>
    </Dialog>
  );
}
