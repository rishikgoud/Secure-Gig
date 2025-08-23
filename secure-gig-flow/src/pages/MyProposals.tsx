import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { getUserData } from '../lib/user-utils';
import { 
  LayoutDashboard, 
  Search,
  FileText, 
  MessageSquare, 
  Shield, 
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

interface Proposal {
  id: number;
  gigId: number;
  gigTitle: string;
  clientName: string;
  proposalMessage: string;
  proposedTimeline: string;
  additionalNotes: string;
  status: 'Pending' | 'Rejected' | 'Waiting for Approval';
  appliedAt: string;
  proposedAmount: string;
}

const MyProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  
  const userData = getUserData();
  const userName = userData?.name || 'Freelancer';
  const userAvatar = userData?.avatar || '👨‍💻';

  const navLinks = [
    { href: '/freelancer-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/find-gigs', label: 'Find Gigs', icon: Search },
    { href: '/my-proposals', label: 'My Proposals', icon: FileText },
    { href: '/my-contracts', label: 'My Contracts', icon: Shield },
    { href: '/chat', label: 'Messages', icon: MessageSquare },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    // Load proposals from localStorage
    const savedProposals = localStorage.getItem('freelancerProposals');
    if (savedProposals) {
      setProposals(JSON.parse(savedProposals));
    }
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Waiting for Approval':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Waiting for Approval':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout navLinks={navLinks} userName={userName} userRole="Freelancer" userAvatar={userAvatar}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Proposals</h1>
          <div className="text-sm text-muted-foreground">
            {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} submitted
          </div>
        </div>

        {proposals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No proposals yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                You haven't submitted any proposals yet. Start by browsing available gigs and applying to ones that match your skills.
              </p>
              <Button onClick={() => window.location.href = '/find-gigs'}>
                Find Gigs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{proposal.gigTitle}</CardTitle>
                      <CardDescription className="mt-1">
                        Client: {proposal.clientName} • Applied {formatDate(proposal.appliedAt)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`flex items-center gap-1 ${getStatusColor(proposal.status)}`}
                      >
                        {getStatusIcon(proposal.status)}
                        {proposal.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Proposal Message</h4>
                      <p className="text-sm text-muted-foreground">
                        {proposal.proposalMessage.length > 200 
                          ? `${proposal.proposalMessage.substring(0, 200)}...` 
                          : proposal.proposalMessage
                        }
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Proposed Timeline:</span>
                        <p className="text-muted-foreground">{proposal.proposedTimeline}</p>
                      </div>
                      <div>
                        <span className="font-medium">Budget:</span>
                        <p className="text-green-600 font-semibold">{proposal.proposedAmount}</p>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <p className={`font-medium ${
                          proposal.status === 'Pending' ? 'text-yellow-600' :
                          proposal.status === 'Waiting for Approval' ? 'text-blue-600' :
                          'text-red-600'
                        }`}>
                          {proposal.status}
                        </p>
                      </div>
                    </div>

                    {proposal.additionalNotes && (
                      <div>
                        <h4 className="font-medium mb-2">Additional Notes</h4>
                        <p className="text-sm text-muted-foreground">{proposal.additionalNotes}</p>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Proposal
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyProposals;
