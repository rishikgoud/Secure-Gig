import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EscrowService, EscrowStatusEnum } from '../../lib/escrow';
import { EscrowState, PopulatedProposal } from '../../api/types';
import { apiClient } from '../../api/client';
import { Shield, Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

const escrowService = new EscrowService();

interface EscrowStatusProps {
  userRole: 'client' | 'freelancer';
  userAddress: string;
  userId?: string; // Add userId to fetch user's proposals
}

export function EscrowStatus({ userRole, userAddress, userId }: EscrowStatusProps) {
  const [escrows, setEscrows] = useState<EscrowState[]>([]);
  const [proposals, setProposals] = useState<PopulatedProposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProposalsAndEscrows();
    
    // Set up event listeners for real-time updates
    escrowService.onEscrowCreated((jobId, client, freelancer, amount) => {
      console.log('Escrow created:', { jobId, client, freelancer, amount });
      loadProposalsAndEscrows();
    });

    escrowService.onEscrowReleased((jobId, amount) => {
      console.log('Escrow released:', { jobId, amount });
      loadProposalsAndEscrows();
    });

    escrowService.onEscrowRefunded((jobId, amount) => {
      console.log('Escrow refunded:', { jobId, amount });
      loadProposalsAndEscrows();
    });

    return () => {
      escrowService.removeAllListeners();
    };
  }, [userRole, userId]);

  const loadProposalsAndEscrows = async () => {
    setLoading(true);
    try {
      // Load proposals based on user role
      let proposalsResponse;
      if (userRole === 'client' && userId) {
        // For clients, get proposals for their jobs
        proposalsResponse = await apiClient.getProposals({
          // We need to filter by jobs owned by this client
          // This might require a backend endpoint modification
          status: 'accepted' // Only show accepted proposals that might have escrows
        });
      } else if (userRole === 'freelancer' && userId) {
        // For freelancers, get their own proposals
        proposalsResponse = await apiClient.getFreelancerProposals(userId, {
          status: 'accepted'
        });
      }

      if (proposalsResponse) {
        setProposals(proposalsResponse.proposals);
        
        // Load escrow data for each accepted proposal
        const escrowPromises = proposalsResponse.proposals.map(async (proposal) => {
          const escrowData = await escrowService.getEscrow(proposal._id);
          return escrowData;
        });
        
        const escrowResults = await Promise.all(escrowPromises);
        const validEscrows = escrowResults.filter((escrow): escrow is EscrowState => escrow !== null);
        setEscrows(validEscrows);
      }
    } catch (error) {
      console.error('Error loading proposals and escrows:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: EscrowState['status']) => {
    switch (status) {
      case 'created':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'funded':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'released':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getStatusBadgeVariant = (status: EscrowState['status']) => {
    switch (status) {
      case 'released':
        return 'default';
      case 'created':
      case 'funded':
        return 'secondary';
      case 'cancelled':
      case 'disputed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: EscrowState['status']) => {
    switch (status) {
      case 'created':
        return 'Created';
      case 'funded':
        return 'Funded';
      case 'released':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'disputed':
        return 'Disputed';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Escrow Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading escrow data...</p>
        </CardContent>
      </Card>
    );
  }

  if (escrows.length === 0 && !loading) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Escrows</h3>
        <p className="text-gray-600">
          {userRole === 'client' 
            ? 'No escrows have been created for your accepted proposals yet.'
            : 'You don\'t have any active escrows at the moment.'
          }
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Escrow Status ({escrows.length})
        </CardTitle>
        <CardDescription>
          Track your escrow-secured payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {escrows.map((escrow) => {
            // Find the corresponding proposal for this escrow
            const relatedProposal = proposals.find(p => p._id === escrow.jobId);
            
            return (
              <Card key={escrow.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield className="h-5 w-5 text-blue-600" />
                      {relatedProposal?.jobId.title || escrow.jobId}
                    </CardTitle>
                    <Badge variant={getStatusBadgeVariant(escrow.status)}>
                      {getStatusIcon(escrow.status)}
                      <span className="ml-1">{getStatusText(escrow.status)}</span>
                    </Badge>
                  </div>
                  <CardDescription>
                    Amount: {escrow.amount} {escrow.token}
                    {relatedProposal && (
                      <span className="ml-2 text-sm">
                        • Proposed: {relatedProposal.proposedRate.amount} {relatedProposal.proposedRate.currency}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-600">
                        {userRole === 'client' ? 'Freelancer' : 'Client'}
                      </p>
                      <p className="font-mono text-xs">
                        {userRole === 'client' 
                          ? relatedProposal?.freelancerId.name || escrow.freelancer
                          : relatedProposal?.jobId.clientId.name || escrow.client
                        }
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Proposal Status</p>
                      <p className="text-sm">
                        {relatedProposal?.status || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-600">Created</p>
                      <p>{new Date(escrow.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Deadline</p>
                      <p>{new Date(escrow.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {relatedProposal && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Proposal Details</p>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {relatedProposal.coverLetter}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                        <span>Timeline: {relatedProposal.timeline.duration} {relatedProposal.timeline.unit}</span>
                        <span>Submitted: {new Date(relatedProposal.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}

                  {escrow.status === 'created' && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        {userRole === 'client' 
                          ? 'Waiting for freelancer to start work'
                          : 'Funds secured! You can start working on this project'
                        }
                      </p>
                    </div>
                  )}

                  {escrow.status === 'funded' && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        {userRole === 'client' 
                          ? 'Freelancer is working. Release funds when work is completed'
                          : 'Work in progress. Funds will be released when client approves'
                        }
                      </p>
                    </div>
                  )}

                  {escrow.status === 'released' && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✅ {userRole === 'client' 
                          ? 'Funds successfully released to freelancer'
                          : 'Payment received! Project completed successfully'
                        }
                      </p>
                    </div>
                  )}

                  {escrow.status === 'cancelled' && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-800">
                        ❌ Escrow cancelled - funds refunded to client
                      </p>
                    </div>
                  )}

                  {relatedProposal && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/proposals/${relatedProposal._id}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Proposal
                      </Button>
                      {relatedProposal.jobId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/jobs/${relatedProposal.jobId._id}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Job
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
