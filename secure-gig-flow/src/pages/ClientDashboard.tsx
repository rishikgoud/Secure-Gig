import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { BlockchainInfo } from '@/components/wallet/BlockchainInfo';
import { TransactionSender } from '@/components/wallet/TransactionSender';
import { NearbyMapContainer } from '@/map';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Shield, 
  Settings,
  MapPin,
  DollarSign,
  Users,
  Plus
} from 'lucide-react';

const ClientDashboard = () => {
  const [showPostGigModal, setShowPostGigModal] = useState(false);
  const navigate = useNavigate();

  const handleManageGig = (gigId: number) => {
    console.log(`Managing gig ${gigId}`);
    navigate(`/gigs/manage/${gigId}`);
  };

  const handleViewProposals = (gigId: number) => {
    console.log(`Viewing proposals for gig ${gigId}`);
    navigate(`/gigs/${gigId}/proposals`);
  };

  const navLinks = [
    { href: '/client-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/my-gigs', label: 'My Gigs', icon: Briefcase },
    { href: '/proposals', label: 'Proposals', icon: FileText },
    { href: '/contracts', label: 'Contracts', icon: Shield },
    { href: '/escrow', label: 'Escrow', icon: DollarSign },
    { href: '/chat', label: 'Messages', icon: MessageSquare },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const mockGigs = [
    {
      id: 1,
      title: "Build a DeFi Dashboard",
      proposals: 12,
      status: "Open",
    },
    {
      id: 2,
      title: "NFT Marketplace Smart Contract",
      proposals: 8,
      status: "In Progress",
    },
  ];

  return (
    <DashboardLayout navLinks={navLinks} userName="CryptoKing.eth" userRole="Client" userAvatar="🤴">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <Button onClick={() => setShowPostGigModal(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Post a New Gig
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$25,000</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Gigs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">35</div>
            </CardContent>
          </Card>
        </div>

        {/* Blockchain Integration Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <WalletConnect />
          <BlockchainInfo showGasPrice />
        </div>
        
        <TransactionSender />
        
        <NearbyMapContainer />

        <Card>
          <CardHeader>
            <CardTitle>My Gigs</CardTitle>
            <CardDescription>Manage your posted gigs and view proposals.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockGigs.map(gig => (
                <Card key={gig.id} className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h3 className="font-semibold">{gig.title}</h3>
                      <p className="text-sm text-muted-foreground">{gig.proposals} proposals</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-center">
                      <Badge variant={gig.status === 'Open' ? 'default' : 'secondary'}>{gig.status}</Badge>
                      <Button variant="outline" size="sm" onClick={() => handleViewProposals(gig.id)}>Proposals</Button>
                      <Button size="sm" onClick={() => handleManageGig(gig.id)}>Manage</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {showPostGigModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <Card className="w-11/12 md:w-2/3 lg:w-1/2 max-w-2xl">
              <CardHeader>
                <CardTitle>Post a New Gig</CardTitle>
                <CardDescription>Fill out the details below to find the perfect freelancer.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* In a real app, this would be a form with inputs */}
                <p>Gig creation form with fields for title, description, budget, skills, etc. would go here.</p>
                <div className="flex justify-end gap-2 mt-4">
                  <Button onClick={() => setShowPostGigModal(false)} variant="outline">Cancel</Button>
                  <Button onClick={() => {
                    console.log('Publishing new gig...');
                    setShowPostGigModal(false);
                  }}>Publish Gig</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;