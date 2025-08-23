import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign, 
  Users, 
  Gavel, 
  Search, 
  Filter,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus
} from 'lucide-react';
import { useEscrow } from '@/hooks/useEscrow';
import { EscrowStatus } from '@/types/escrow';
import { useDAO } from '@/hooks/useDAO';
import { useWallet } from '@/hooks/useWallet';
import { EscrowCard } from '@/components/escrow/EscrowCard';
import { VoteCard } from '@/components/escrow/VoteCard';
import { CreateEscrowModal } from '@/components/escrow/CreateEscrowModal';
import { toast } from 'sonner';

export const EscrowPage = () => {
  const { address, isConnected } = useWallet();
  const {
    escrows,
    totalEscrows,
    contractBalance,
    isLoading: escrowLoading,
    createEscrow,
    approveWork,
    raiseDispute,
    getEscrowsByRole,
    getEscrowsByStatus
  } = useEscrow();
  
  const {
    tokenInfo,
    canUserVote,
    userVotingPower,
    activeVotesCount,
    isLoading: daoLoading,
    openVote,
    castVote,
    finalizeVote,
    getVote,
    hasUserVoted,
    getUserVoteChoice,
    isVotingActive,
    disputeExists,
    getVoteProgress,
    getTimeRemaining,
    getWinningChoice
  } = useDAO();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [disputedEscrows, setDisputedEscrows] = useState<any[]>([]);
  const [activeVotes, setActiveVotes] = useState<any[]>([]);

  // Fetch disputed escrows and their vote data
  useEffect(() => {
    const fetchDisputeData = async () => {
      if (!escrows.length) return;

      const disputed = escrows.filter(escrow => escrow.disputeRaisedAt);
      const votesData = [];

      for (const escrow of disputed) {
        try {
          const voteData = await getVote(parseInt(escrow.id));
          if (voteData) {
            const [hasVoted, voteChoice, isActive] = await Promise.all([
              hasUserVoted(parseInt(escrow.id)),
              getUserVoteChoice(parseInt(escrow.id)),
              isVotingActive(parseInt(escrow.id))
            ]);

            votesData.push({
              ...voteData,
              hasUserVoted: hasVoted,
              userVoteChoice: voteChoice,
              isVotingActive: isActive,
              voteProgress: getVoteProgress(voteData),
              timeRemaining: getTimeRemaining(voteData.endTime),
              winningChoice: getWinningChoice(voteData)
            });
          }
        } catch (error) {
          console.error(`Failed to fetch vote data for escrow ${escrow.id}:`, error);
        }
      }

      setDisputedEscrows(disputed);
      setActiveVotes(votesData);
    };

    fetchDisputeData();
  }, [escrows, getVote, hasUserVoted, getUserVoteChoice, isVotingActive, getVoteProgress, getTimeRemaining, getWinningChoice]);

  // Filter escrows based on search and status
  const filteredEscrows = escrows.filter(escrow => {
    const matchesSearch = searchTerm === '' || 
      escrow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escrow.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escrow.freelancer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      escrow.status.toString() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get escrows by role
  const clientEscrows = getEscrowsByRole('client');
  const freelancerEscrows = getEscrowsByRole('freelancer');

  // Handle escrow actions
  const handleCreateEscrow = async (freelancer: string, amount: string, deadline: number, description: string) => {
    return await createEscrow({ 
      title: 'New Project',
      freelancer, 
      amount, 
      currency: 'AVAX',
      deadline, 
      description,
      milestones: []
    });
  };

  const handleApproveWork = async (escrowId: number) => {
    const success = await approveWork(escrowId);
    if (success) {
      // Escrows will be refreshed automatically via event listeners
    }
  };

  const handleRaiseDispute = async (escrowId: number) => {
    const success = await raiseDispute(escrowId);
    if (success) {
      // Escrows will be refreshed automatically via event listeners
      // Open vote automatically
      await openVote(escrowId);
    }
  };

  const handleVote = async (escrowId: number, supportFreelancer: boolean) => {
    const success = await castVote(escrowId, supportFreelancer);
    if (success) {
      // Refresh vote data
      const voteData = await getVote(escrowId);
      if (voteData) {
        setActiveVotes(prev => prev.map(vote => 
          vote.escrowId === escrowId 
            ? {
                ...voteData,
                hasUserVoted: true,
                userVoteChoice: supportFreelancer,
                isVotingActive: false, // Will be updated by next fetch
                voteProgress: getVoteProgress(voteData),
                timeRemaining: getTimeRemaining(voteData.endTime),
                winningChoice: getWinningChoice(voteData)
              }
            : vote
        ));
      }
    }
  };

  const handleFinalizeVote = async (escrowId: number) => {
    const success = await finalizeVote(escrowId);
    if (success) {
      // Escrows will be refreshed automatically via event listeners
      // Refresh vote data
      const voteData = await getVote(escrowId);
      if (voteData) {
        setActiveVotes(prev => prev.map(vote => 
          vote.escrowId === escrowId 
            ? {
                ...voteData,
                hasUserVoted: vote.hasUserVoted,
                userVoteChoice: vote.userVoteChoice,
                isVotingActive: false,
                voteProgress: getVoteProgress(voteData),
                timeRemaining: 'Ended',
                winningChoice: getWinningChoice(voteData)
              }
            : vote
        ));
      }
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to access the escrow system.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Escrow System</h1>
          <p className="text-muted-foreground">
            Secure payments with DAO-based dispute resolution
          </p>
        </div>
        <CreateEscrowModal 
          onCreateEscrow={handleCreateEscrow}
          isLoading={escrowLoading}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Escrows</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {escrowLoading ? <Skeleton className="h-6 w-8" /> : totalEscrows}
            </div>
            <p className="text-xs text-muted-foreground">
              {contractBalance} AVAX locked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Escrows</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {escrowLoading ? <Skeleton className="h-6 w-8" /> : escrows.filter(e => e.status === EscrowStatus.Active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DAO Votes</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {daoLoading ? <Skeleton className="h-6 w-8" /> : activeVotesCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Active disputes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voting Power</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {daoLoading ? <Skeleton className="h-6 w-8" /> : parseFloat(userVotingPower).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {tokenInfo?.symbol || 'DAO'} tokens
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="client">As Client</TabsTrigger>
          <TabsTrigger value="freelancer">As Freelancer</TabsTrigger>
          <TabsTrigger value="dao">DAO Voting</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Escrows</CardTitle>
              <CardDescription>View and manage all your escrow contracts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search escrows..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="0">Active</SelectItem>
                    <SelectItem value="1">Completed</SelectItem>
                    <SelectItem value="2">Disputed</SelectItem>
                    <SelectItem value="3">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Escrow List */}
          <div className="grid gap-4">
            {escrowLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : filteredEscrows.length > 0 ? (
              filteredEscrows.map((escrow) => (
                <EscrowCard
                  key={escrow.id}
                  escrow={escrow}
                  userAddress={address!}
                  onApproveWork={handleApproveWork}
                  onRaiseDispute={handleRaiseDispute}
                  isLoading={escrowLoading}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No escrows found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Client Tab */}
        <TabsContent value="client" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Client Escrows</CardTitle>
              <CardDescription>Escrows where you are the client</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-4">
            {clientEscrows.map((escrow) => (
              <EscrowCard
                key={escrow.id}
                escrow={escrow}
                userAddress={address!}
                onApproveWork={handleApproveWork}
                onRaiseDispute={handleRaiseDispute}
                isLoading={escrowLoading}
              />
            ))}
            {clientEscrows.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No client escrows found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Freelancer Tab */}
        <TabsContent value="freelancer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Freelancer Escrows</CardTitle>
              <CardDescription>Escrows where you are the freelancer</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-4">
            {freelancerEscrows.map((escrow) => (
              <EscrowCard
                key={escrow.id}
                escrow={escrow}
                userAddress={address!}
                onApproveWork={handleApproveWork}
                onRaiseDispute={handleRaiseDispute}
                isLoading={escrowLoading}
              />
            ))}
            {freelancerEscrows.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No freelancer escrows found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* DAO Voting Tab */}
        <TabsContent value="dao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gavel className="h-5 w-5" />
                DAO Dispute Resolution
              </CardTitle>
              <CardDescription>
                Vote on disputed escrows using your DAO tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!canUserVote && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You need at least 100 DAO tokens to participate in voting.
                    Current balance: {parseFloat(userVotingPower).toFixed(2)} tokens
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {activeVotes.length > 0 ? (
              activeVotes.map((vote) => (
                <VoteCard
                  key={vote.escrowId}
                  voteData={vote}
                  userAddress={address!}
                  hasUserVoted={vote.hasUserVoted}
                  userVoteChoice={vote.userVoteChoice}
                  canUserVote={canUserVote}
                  userVotingPower={userVotingPower}
                  timeRemaining={vote.timeRemaining}
                  voteProgress={vote.voteProgress}
                  winningChoice={vote.winningChoice}
                  onVote={handleVote}
                  onFinalize={handleFinalizeVote}
                  isLoading={daoLoading}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No active disputes to vote on</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
