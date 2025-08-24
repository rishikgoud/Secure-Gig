import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ProposalData, JobPost } from '@/api/types';
import { apiClient } from '@/api/client';
import { 
  User, 
  DollarSign, 
  Clock, 
  Star, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Calendar,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileText,
  Award
} from 'lucide-react';

interface ProposalManagementProps {
  job: JobPost;
  onProposalUpdate?: (proposalId: string, newStatus: string) => void;
}

const ProposalManagement: React.FC<ProposalManagementProps> = ({ job, onProposalUpdate }) => {
  const { toast } = useToast();
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<ProposalData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadProposals();
  }, [job._id]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getJobProposals(job._id, {
        sortBy: 'submittedAt',
        sortOrder: 'desc'
      });
      setProposals(response.data);
    } catch (error) {
      toast({
        title: "Error Loading Proposals",
        description: error instanceof Error ? error.message : "Failed to load proposals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (proposalId: string, newStatus: 'accepted' | 'rejected' | 'shortlisted', message?: string) => {
    try {
      setUpdatingStatus(proposalId);
      
      await apiClient.updateProposalStatus(proposalId, {
        status: newStatus,
        clientResponse: message ? { message } : undefined
      });

      // Update local state
      setProposals(prev => prev.map(p => 
        p.id === proposalId 
          ? { 
              ...p, 
              status: newStatus,
              clientResponse: message ? { message, respondedAt: new Date().toISOString() } : p.clientResponse
            }
          : p
      ));

      onProposalUpdate?.(proposalId, newStatus);
      
      toast({
        title: "Proposal Updated",
        description: `Proposal ${newStatus} successfully`,
        variant: "default"
      });

      setShowResponseModal(false);
      setResponseMessage('');
      
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update proposal",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openResponseModal = (proposal: ProposalData, status: 'accepted' | 'rejected') => {
    setSelectedProposal(proposal);
    setResponseMessage('');
    setShowResponseModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'shortlisted': return 'bg-blue-100 text-blue-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'shortlisted': return <Star className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    if (activeTab === 'all') return true;
    return proposal.status === activeTab;
  });

  const proposalCounts = {
    all: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    shortlisted: proposals.filter(p => p.status === 'shortlisted').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    rejected: proposals.filter(p => p.status === 'rejected').length
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading proposals...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Proposals for "{job.title}"
          </CardTitle>
          <CardDescription>
            {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} received
          </CardDescription>
        </CardHeader>

        <CardContent>
          {proposals.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Proposals Yet</h3>
              <p className="text-gray-600">
                Freelancers haven't submitted any proposals for this job yet. 
                Check back later or consider promoting your job post.
              </p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All ({proposalCounts.all})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({proposalCounts.pending})</TabsTrigger>
                <TabsTrigger value="shortlisted">Shortlisted ({proposalCounts.shortlisted})</TabsTrigger>
                <TabsTrigger value="accepted">Accepted ({proposalCounts.accepted})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({proposalCounts.rejected})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <div className="space-y-4">
                  {filteredProposals.map((proposal) => (
                    <Card key={proposal.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={proposal.freelancer?.profile?.avatar} />
                              <AvatarFallback>
                                {proposal.freelancer?.name?.charAt(0) || 'F'}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold text-lg flex items-center gap-2">
                                    {proposal.freelancer?.name}
                                    {proposal.freelancer?.isVerified && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Award className="h-3 w-3 mr-1" />
                                        Verified
                                      </Badge>
                                    )}
                                  </h4>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    {proposal.freelancer?.ratings && (
                                      <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span>{proposal.freelancer.ratings.average?.toFixed(1)}</span>
                                        <span>({proposal.freelancer.ratings.count} reviews)</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>Applied {new Date(proposal.submittedAt).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>

                                <Badge className={getStatusColor(proposal.status)}>
                                  {getStatusIcon(proposal.status)}
                                  <span className="ml-1 capitalize">{proposal.status}</span>
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-green-600" />
                                  <span className="font-semibold">
                                    {proposal.proposedRate.currency} {proposal.proposedRate.amount}
                                    {proposal.proposedRate.type === 'hourly' && '/hr'}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {proposal.proposedRate.type}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-blue-600" />
                                  <span>
                                    {proposal.timeline.duration} {proposal.timeline.unit}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-gray-700 line-clamp-3">
                                  {proposal.coverLetter}
                                </p>
                                
                                {proposal.portfolioLinks && proposal.portfolioLinks.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {proposal.portfolioLinks.slice(0, 3).map((link, index) => (
                                      <a
                                        key={index}
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        Portfolio {index + 1}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {proposal.clientResponse && (
                                <Alert>
                                  <MessageSquare className="h-4 w-4" />
                                  <AlertDescription>
                                    <strong>Your Response:</strong> {proposal.clientResponse.message}
                                    <br />
                                    <small className="text-gray-500">
                                      {new Date(proposal.clientResponse.respondedAt).toLocaleString()}
                                    </small>
                                  </AlertDescription>
                                </Alert>
                              )}

                              <div className="flex gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedProposal(proposal);
                                    setShowDetailsModal(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>

                                {proposal.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleStatusUpdate(proposal.id, 'shortlisted')}
                                      disabled={updatingStatus === proposal.id}
                                    >
                                      <Star className="h-4 w-4 mr-1" />
                                      Shortlist
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => openResponseModal(proposal, 'accepted')}
                                      disabled={updatingStatus === proposal.id}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Accept
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => openResponseModal(proposal, 'rejected')}
                                      disabled={updatingStatus === proposal.id}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}

                                {proposal.status === 'shortlisted' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => openResponseModal(proposal, 'accepted')}
                                      disabled={updatingStatus === proposal.id}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Accept
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => openResponseModal(proposal, 'rejected')}
                                      disabled={updatingStatus === proposal.id}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Proposal Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proposal Details</DialogTitle>
            <DialogDescription>
              Full proposal from {selectedProposal?.freelancer?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProposal && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedProposal.freelancer?.profile?.avatar} />
                  <AvatarFallback>
                    {selectedProposal.freelancer?.name?.charAt(0) || 'F'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedProposal.freelancer?.name}</h3>
                  <p className="text-gray-600">{selectedProposal.freelancer?.profile?.bio}</p>
                  {selectedProposal.freelancer?.ratings && (
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{selectedProposal.freelancer.ratings.average?.toFixed(1)}</span>
                      <span className="text-gray-500">({selectedProposal.freelancer.ratings.count} reviews)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Proposed Rate</h4>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-xl font-bold">
                      {selectedProposal.proposedRate.currency} {selectedProposal.proposedRate.amount}
                    </span>
                    <Badge variant="outline">{selectedProposal.proposedRate.type}</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Timeline</h4>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-lg">
                      {selectedProposal.timeline.duration} {selectedProposal.timeline.unit}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Cover Letter</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedProposal.coverLetter}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Relevant Experience</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedProposal.experience}</p>
                </div>
              </div>

              {selectedProposal.portfolioLinks && selectedProposal.portfolioLinks.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Portfolio Links</h4>
                  <div className="space-y-2">
                    {selectedProposal.portfolioLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedProposal.freelancer?.profile?.skills && (
                <div>
                  <h4 className="font-semibold mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProposal.freelancer.profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Response Modal */}
      <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedProposal?.status === 'accepted' ? 'Accept' : 'Reject'} Proposal
            </DialogTitle>
            <DialogDescription>
              Send a message to {selectedProposal?.freelancer?.name} about your decision
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="response">Message (Optional)</Label>
              <Textarea
                id="response"
                placeholder="Add a personal message to the freelancer..."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (selectedProposal) {
                    const status = selectedProposal.status === 'accepted' ? 'accepted' : 'rejected';
                    handleStatusUpdate(selectedProposal.id, status as any, responseMessage);
                  }
                }}
                disabled={updatingStatus === selectedProposal?.id}
              >
                {updatingStatus === selectedProposal?.id ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Confirm
              </Button>
              <Button variant="outline" onClick={() => setShowResponseModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProposalManagement;
