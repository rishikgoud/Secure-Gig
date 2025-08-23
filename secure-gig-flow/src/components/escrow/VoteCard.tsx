import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Gavel, 
  Clock, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Vote
} from 'lucide-react';
import { VoteData } from '@/hooks/useDAO';

interface VoteCardProps {
  voteData: VoteData;
  userAddress: string;
  hasUserVoted: boolean;
  userVoteChoice: boolean | null;
  canUserVote: boolean;
  userVotingPower: string;
  timeRemaining: string;
  voteProgress: number;
  winningChoice: 'freelancer' | 'client' | 'tie';
  onVote?: (escrowId: number, supportFreelancer: boolean) => void;
  onFinalize?: (escrowId: number) => void;
  isLoading?: boolean;
}

export const VoteCard = ({
  voteData,
  userAddress,
  hasUserVoted,
  userVoteChoice,
  canUserVote,
  userVotingPower,
  timeRemaining,
  voteProgress,
  winningChoice,
  onVote,
  onFinalize,
  isLoading = false
}: VoteCardProps) => {
  const [selectedChoice, setSelectedChoice] = useState<boolean | null>(null);
  
  const isVotingActive = timeRemaining !== 'Ended' && !voteData.finalized;
  const freelancerVotes = parseFloat(voteData.votesForFreelancer);
  const clientVotes = parseFloat(voteData.votesForClient);
  const totalVotes = parseFloat(voteData.totalVotes);
  
  const freelancerPercentage = totalVotes > 0 ? (freelancerVotes / totalVotes) * 100 : 0;
  const clientPercentage = totalVotes > 0 ? (clientVotes / totalVotes) * 100 : 0;
  
  const formatAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const getStatusBadge = () => {
    if (voteData.finalized) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Finalized
        </Badge>
      );
    }
    
    if (isVotingActive) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Active
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Ended
      </Badge>
    );
  };

  const getWinnerDisplay = () => {
    if (!voteData.finalized) return null;
    
    if (voteData.winner === '0x0000000000000000000000000000000000000000') {
      return (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 text-gray-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Quorum not met - Defaulted to Client</span>
          </div>
        </div>
      );
    }
    
    const isFreelancerWinner = winningChoice === 'freelancer';
    return (
      <div className={`p-3 border rounded-lg ${
        isFreelancerWinner 
          ? 'bg-green-50 border-green-200' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className={`flex items-center gap-2 ${
          isFreelancerWinner ? 'text-green-800' : 'text-blue-800'
        }`}>
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            {isFreelancerWinner ? 'Freelancer' : 'Client'} Won
          </span>
        </div>
        <p className="text-xs mt-1 opacity-75">
          Funds released to {formatAddress(voteData.winner)}
        </p>
      </div>
    );
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gavel className="h-5 w-5 text-purple-600" />
              Dispute Vote #{voteData.escrowId}
            </CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {totalVotes.toFixed(2)} votes cast
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {timeRemaining}
              </span>
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Vote Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Quorum Progress</span>
            <span className="font-medium">{Math.round(voteProgress)}%</span>
          </div>
          <Progress value={voteProgress} className="h-2" />
        </div>

        <Separator />

        {/* Vote Results */}
        <div className="space-y-3">
          <div className="text-sm font-medium">Vote Distribution</div>
          
          {/* Freelancer Votes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>For Freelancer</span>
              </div>
              <span className="font-medium">
                {freelancerVotes.toFixed(2)} ({freelancerPercentage.toFixed(1)}%)
              </span>
            </div>
            <Progress value={freelancerPercentage} className="h-2 [&>div]:bg-green-500" />
          </div>

          {/* Client Votes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>For Client</span>
              </div>
              <span className="font-medium">
                {clientVotes.toFixed(2)} ({clientPercentage.toFixed(1)}%)
              </span>
            </div>
            <Progress value={clientPercentage} className="h-2 [&>div]:bg-blue-500" />
          </div>
        </div>

        {/* User Voting Status */}
        {canUserVote && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-800">Your Voting Power</div>
                <div className="text-xs text-blue-600">
                  {parseFloat(userVotingPower).toFixed(2)} tokens
                </div>
              </div>
              {hasUserVoted && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Voted for {userVoteChoice ? 'Freelancer' : 'Client'}
                  </Badge>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Voting Actions */}
        {isVotingActive && canUserVote && !hasUserVoted && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Cast Your Vote</div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={selectedChoice === true ? "default" : "outline"}
                onClick={() => setSelectedChoice(true)}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                For Freelancer
              </Button>
              <Button
                variant={selectedChoice === false ? "default" : "outline"}
                onClick={() => setSelectedChoice(false)}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                For Client
              </Button>
            </div>
            
            {selectedChoice !== null && (
              <Button
                onClick={() => onVote?.(voteData.escrowId, selectedChoice)}
                disabled={isLoading}
                className="w-full"
              >
                <Vote className="h-4 w-4 mr-2" />
                Submit Vote
              </Button>
            )}
          </div>
        )}

        {/* Finalization */}
        {!isVotingActive && !voteData.finalized && (
          <Button
            onClick={() => onFinalize?.(voteData.escrowId)}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            <Gavel className="h-4 w-4 mr-2" />
            Finalize Vote
          </Button>
        )}

        {/* Winner Display */}
        {getWinnerDisplay()}

        {/* Voting Restrictions */}
        {!canUserVote && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Insufficient tokens to vote
              </span>
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              You need at least 100 DAO tokens to participate in voting
            </p>
          </div>
        )}

        {/* Vote Timeline */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Started: {new Date(voteData.startTime * 1000).toLocaleString()}</div>
          <div>Ends: {new Date(voteData.endTime * 1000).toLocaleString()}</div>
        </div>
      </CardContent>
    </Card>
  );
};
