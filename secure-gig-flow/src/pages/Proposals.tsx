import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MessageSquare,
  Calendar,
  User,
  Star,
  Award,
  TrendingUp,
  FileText,
  Send,
  LayoutDashboard,
  Briefcase,
  Shield,
  Settings
} from 'lucide-react';
import { DashboardLayout } from '@/components/ui/DashboardLayout';

const Proposals = () => {
  const [activeTab, setActiveTab] = useState('sent');

  const navLinks = [
    { href: '/client-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/find-gigs', label: 'Find Gigs', icon: Briefcase },
    { href: '/my-proposals', label: 'Proposals', icon: FileText },
    { href: '/my-contracts', label: 'Contracts', icon: Shield },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const sentProposals = [
    {
      id: 1,
      gigTitle: 'Build a DeFi Trading Platform',
      client: 'CryptoVentures LLC',
      proposedBudget: '$8,000',
      proposedDuration: '10 weeks',
      status: 'pending',
      submittedDate: '2024-01-15',
      coverLetter: 'I have extensive experience in DeFi development with over 5 years in blockchain...',
      clientRating: 4.9,
      totalProposals: 12,
      myRank: 3
    },
    {
      id: 2,
      gigTitle: 'NFT Marketplace Frontend Development',
      client: 'ArtBlock Studios',
      proposedBudget: '$4,500',
      proposedDuration: '6 weeks',
      status: 'accepted',
      submittedDate: '2024-01-10',
      coverLetter: 'Your NFT marketplace project aligns perfectly with my frontend expertise...',
      clientRating: 4.7,
      totalProposals: 8,
      myRank: 1
    }
  ];

  const receivedProposals = [
    {
      id: 1,
      freelancer: 'Alex Chen',
      freelancerRating: 4.9,
      freelancerSkills: ['React', 'TypeScript', 'Web3', 'Solidity'],
      gigTitle: 'DAO Governance Platform Development',
      proposedBudget: '$6,500',
      proposedDuration: '8 weeks',
      submittedDate: '2024-01-16',
      coverLetter: 'I have built several DAO governance platforms and understand the complexities...',
      hourlyRate: '$85/hr',
      totalEarnings: '$125,000+',
      completedProjects: 47
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500 text-white">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout navLinks={navLinks}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-gradient-primary mb-4">
            Proposals
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your sent and received proposals
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="sent">
              Sent Proposals ({sentProposals.length})
            </TabsTrigger>
            <TabsTrigger value="received">
              Received Proposals ({receivedProposals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sent" className="space-y-6">
            {sentProposals.map((proposal) => (
              <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{proposal.gigTitle}</CardTitle>
                      <CardDescription className="mt-2">
                        Client: {proposal.client}
                      </CardDescription>
                    </div>
                    {getStatusBadge(proposal.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>{proposal.proposedBudget}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{proposal.proposedDuration}</span>
                      </div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm">{proposal.coverLetter}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View Gig</Button>
                      {proposal.status === 'accepted' && (
                        <Button className="bg-gradient-primary text-white">Start Project</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="received" className="space-y-6">
            {receivedProposals.map((proposal) => (
              <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{proposal.gigTitle}</CardTitle>
                  <CardDescription>Proposal from {proposal.freelancer}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {proposal.freelancer.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{proposal.freelancer}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{proposal.freelancerRating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {proposal.freelancerSkills.map((skill) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">View Profile</Button>
                      <Button className="bg-green-500 text-white">Accept</Button>
                      <Button variant="destructive">Decline</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Proposals;
