import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  DollarSign, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Calendar,
  FileText,
  Gavel
} from 'lucide-react';
import { EscrowData, EscrowStatus } from '@/types/escrow';
import { formatDistanceToNow } from 'date-fns';

interface EscrowCardProps {
  escrow: EscrowData;
  userAddress: string;
  onApproveWork?: (escrowId: number) => void;
  onSubmitWork?: (escrowId: number) => void;
  onRaiseDispute?: (escrowId: number) => void;
  onViewDetails?: (escrowId: number) => void;
  isLoading?: boolean;
}

const getStatusConfig = (status: EscrowStatus) => {
  switch (status) {
    case EscrowStatus.Active:
      return {
        label: 'Active',
        variant: 'default' as const,
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      };
    case EscrowStatus.Completed:
      return {
        label: 'Completed',
        variant: 'default' as const,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      };
    case EscrowStatus.Disputed:
      return {
        label: 'Disputed',
        variant: 'destructive' as const,
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      };
    case EscrowStatus.Resolved:
      return {
        label: 'Resolved',
        variant: 'secondary' as const,
        icon: Gavel,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50'
      };
    default:
      return {
        label: 'Unknown',
        variant: 'secondary' as const,
        icon: XCircle,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50'
      };
  }
};

export const EscrowCard = ({ 
  escrow, 
  userAddress, 
  onApproveWork, 
  onSubmitWork,
  onRaiseDispute, 
  onViewDetails,
  isLoading = false 
}: EscrowCardProps) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const isClient = escrow.client.toLowerCase() === userAddress.toLowerCase();
  const isFreelancer = escrow.freelancer.toLowerCase() === userAddress.toLowerCase();
  const statusConfig = getStatusConfig(escrow.status);
  const StatusIcon = statusConfig.icon;
  
  // Calculate progress based on deadline
  const now = Date.now() / 1000;
  const totalTime = escrow.deadline - escrow.createdAt;
  const elapsedTime = now - escrow.createdAt;
  const progress = Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);
  const isOverdue = now > escrow.deadline && escrow.status === EscrowStatus.Active;
  
  // Format addresses for display
  const formatAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;
  
  // Truncate description
  const maxDescriptionLength = 120;
  const shouldTruncate = escrow.description.length > maxDescriptionLength;
  const displayDescription = shouldTruncate && !showFullDescription 
    ? `${escrow.description.slice(0, maxDescriptionLength)}...`
    : escrow.description;

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${statusConfig.bgColor} border-l-4 ${
      escrow.status === EscrowStatus.Active ? 'border-l-blue-500' :
      escrow.status === EscrowStatus.Completed ? 'border-l-green-500' :
      escrow.status === EscrowStatus.Disputed ? 'border-l-red-500' :
      'border-l-gray-500'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
              Escrow #{escrow.id}
            </CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {escrow.amount} AVAX
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Created {formatDistanceToNow(new Date(escrow.createdAt * 1000), { addSuffix: true })}
              </span>
            </CardDescription>
          </div>
          <Badge variant={statusConfig.variant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Participants */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Client</div>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {escrow.client.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-mono">
                {formatAddress(escrow.client)}
              </span>
              {isClient && (
                <Badge variant="outline" className="text-xs px-1 py-0">You</Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Freelancer</div>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {escrow.freelancer.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-mono">
                {formatAddress(escrow.freelancer)}
              </span>
              {isFreelancer && (
                <Badge variant="outline" className="text-xs px-1 py-0">You</Badge>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Description</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {displayDescription}
          </p>
          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </Button>
          )}
        </div>

        {/* Timeline Progress */}
        {escrow.status === EscrowStatus.Active && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                {isOverdue ? 'Overdue' : `${Math.round(progress)}%`}
              </span>
            </div>
            <Progress 
              value={progress} 
              className={`h-2 ${isOverdue ? '[&>div]:bg-red-500' : ''}`}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Started</span>
              <span>
                Deadline: {new Date(escrow.deadline * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Dispute Information */}
        {escrow.disputeRaisedAt && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Dispute Raised</span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              Raised by {formatAddress(escrow.disputeRaisedBy)} on{' '}
              {new Date(escrow.disputeRaisedAt * 1000).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          {/* Client Actions */}
          {!isClient && escrow.status === EscrowStatus.Active && !escrow.disputeRaisedAt && (
            <>
              <Button
                onClick={() => onApproveWork?.(parseInt(escrow.id))}
                disabled={isLoading}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Work
              </Button>
              <Button
                variant="outline"
                onClick={() => onRaiseDispute?.(parseInt(escrow.id))}
                disabled={isLoading}
                className="flex-1"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Raise Dispute
              </Button>
            </>
          )}

          {/* Freelancer Actions */}
          {isFreelancer && escrow.status === EscrowStatus.Active && !escrow.disputeRaisedAt && (
            <>
              <Button
                onClick={() => onSubmitWork?.(parseInt(escrow.id))}
                disabled={isLoading}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Work
              </Button>
              <Button
                variant="outline"
                onClick={() => onRaiseDispute?.(parseInt(escrow.id))}
                disabled={isLoading}
                className="flex-1"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Raise Dispute
              </Button>
            </>
          )}

          {/* View Details Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails?.(parseInt(escrow.id))}
            className="ml-auto"
          >
            <User className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>

        {/* Status Messages */}
        {escrow.status === EscrowStatus.Completed && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Work approved and funds released to freelancer
              </span>
            </div>
          </div>
        )}

        {escrow.status === EscrowStatus.Resolved && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 text-gray-800">
              <Gavel className="h-4 w-4" />
              <span className="text-sm font-medium">
                Dispute resolved by DAO voting
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
