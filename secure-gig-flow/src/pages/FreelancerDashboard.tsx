import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { NearbyMapContainer } from '@/map';
import { getUserData } from '../lib/user-utils';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Shield, 
  Settings,
  DollarSign,
  BarChart,
  Search,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';

const FreelancerDashboard = () => {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedGig, setSelectedGig] = useState<any>(null);
  const [proposalMessage, setProposalMessage] = useState('');
  const [proposedTimeline, setProposedTimeline] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  
  const userData = getUserData();
  const userName = userData?.name || 'Freelancer';
  const userAvatar = userData?.avatar || '👨‍💻';

  const handleApplyClick = (gig: any) => {
    setSelectedGig(gig);
    setShowApplyModal(true);
    setProposalMessage('');
    setProposedTimeline('');
    setAdditionalNotes('');
  };

  const handleViewDetailsClick = (job: any) => {
    setSelectedGig(job);
    setShowDetailsModal(true);
  };

  const handleSubmitProposal = () => {
    if (!proposalMessage.trim() || !proposedTimeline.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in proposal message and timeline.",
        variant: "destructive"
      });
      return;
    }

    // Save proposal to localStorage
    const existingProposals = JSON.parse(localStorage.getItem('freelancerProposals') || '[]');
    const newProposal = {
      id: Date.now(),
      gigId: selectedGig.id,
      gigTitle: selectedGig.title,
      clientName: selectedGig.client,
      proposalMessage,
      proposedTimeline,
      additionalNotes,
      status: 'Pending',
      appliedAt: new Date().toISOString(),
      proposedAmount: selectedGig.budget
    };
    
    existingProposals.push(newProposal);
    localStorage.setItem('freelancerProposals', JSON.stringify(existingProposals));
    
    setShowApplyModal(false);
    toast({
      title: "Successfully applied for gig!",
      description: `Your proposal for "${selectedGig.title}" has been submitted.`
    });
  };

  const navLinks = [
    { href: '/freelancer-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/find-gigs', label: 'Find Gigs', icon: Search },
    { href: '/my-proposals', label: 'My Proposals', icon: FileText },
    { href: '/my-contracts', label: 'My Contracts', icon: Shield },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const mockGigs = [
    {
      id: 1,
      title: "Build a DeFi Dashboard",
      client: "CryptoClient.eth",
      clientWallet: "0x742d35Cc6634C0532925a3b8D2",
      budget: "2.5 AVAX",
      description: "Create a comprehensive DeFi dashboard with real-time data visualization and portfolio tracking capabilities.",
      deadline: "4 weeks",
      skills: ["React", "Web3.js", "Chart.js"],
      location: "Remote",
      aboutClient: "Experienced DeFi project founder looking for skilled developers to build next-generation financial tools."
    },
    {
      id: 2,
      title: "NFT Marketplace Smart Contract",
      client: "NFTCreator.eth",
      clientWallet: "0x8ba1f109551bD432803012645Hac136c",
      budget: "3.0 AVAX",
      description: "Develop and deploy smart contracts for an NFT marketplace with minting, trading, and royalty features.",
      deadline: "6 weeks",
      skills: ["Solidity", "Hardhat", "OpenZeppelin"],
      location: "Remote",
      aboutClient: "Digital artist and NFT enthusiast building a community-focused marketplace platform."
    },
    {
      id: 3,
      title: "Mobile Crypto Wallet App",
      client: "WalletTech.eth",
      clientWallet: "0x1234567890abcdef1234567890abcdef12345678",
      budget: "4.2 AVAX",
      description: "Design and develop a secure mobile cryptocurrency wallet with multi-chain support and DeFi integration.",
      deadline: "8 weeks",
      skills: ["React Native", "TypeScript", "Blockchain"],
      location: "Remote",
      aboutClient: "Fintech startup focused on making cryptocurrency accessible to mainstream users."
    }
  ];

  return (
    <DashboardLayout navLinks={navLinks}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Freelancer Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.5 AVAX</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proposals Sent</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reputation</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest proposals and contract updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Proposal accepted for "Build a DeFi Dashboard"</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">New message from CryptoClient.eth</p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Payment received: 2.5 AVAX</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <Button variant="outline" className="h-16 md:h-20 flex-col text-xs md:text-sm" onClick={() => navigate('/find-gigs')}>
                <Search className="h-4 w-4 md:h-6 md:w-6 mb-1 md:mb-2" />
                Find New Gigs
              </Button>
              <Button variant="outline" className="h-16 md:h-20 flex-col text-xs md:text-sm" onClick={() => navigate('/my-proposals')}>
                <FileText className="h-4 w-4 md:h-6 md:w-6 mb-1 md:mb-2" />
                View Proposals
              </Button>
              <Button variant="outline" className="h-16 md:h-20 flex-col text-xs md:text-sm" onClick={() => navigate('/my-contracts')}>
                <Shield className="h-4 w-4 md:h-6 md:w-6 mb-1 md:mb-2" />
                Active Contracts
              </Button>
              <Button variant="outline" className="h-16 md:h-20 flex-col text-xs md:text-sm" onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4 md:h-6 md:w-6 mb-1 md:mb-2" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Nearby Map Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Nearby Clients & Opportunities
            </CardTitle>
            <CardDescription>Discover local clients and projects in your area.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <NearbyMapContainer />
          </CardContent>
        </Card>

        {/* Apply Modal */}
        <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl">Apply for {selectedGig?.title}</DialogTitle>
              <DialogDescription>Submit your proposal for this gig</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proposal">Proposal Message *</Label>
                <Textarea
                  id="proposal"
                  placeholder="Describe your approach, experience, and why you're the best fit for this project..."
                  value={proposalMessage}
                  onChange={(e) => setProposalMessage(e.target.value)}
                  rows={4}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Proposed Timeline *</Label>
                <Input
                  id="timeline"
                  placeholder="e.g., 3 weeks, 1 month"
                  value={proposedTimeline}
                  onChange={(e) => setProposedTimeline(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Skills/Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information, skills, or questions..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={3}
                  className="min-h-[80px]"
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowApplyModal(false)} className="w-full sm:w-auto">Cancel</Button>
                <Button onClick={handleSubmitProposal} className="w-full sm:w-auto">Submit Proposal</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl">{selectedGig?.title}</DialogTitle>
              <DialogDescription>Complete job details</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedGig?.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Budget</h4>
                  <p className="text-lg font-bold text-green-600">
                    {selectedGig?.budget?.type === 'fixed' 
                      ? `$${selectedGig?.budget?.amount} ${selectedGig?.budget?.currency}` 
                      : `$${selectedGig?.budget?.amount}/${selectedGig?.budget?.type} ${selectedGig?.budget?.currency}`
                    }
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Deadline</h4>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{selectedGig?.deadline ? new Date(selectedGig.deadline).toLocaleDateString() : 'Not specified'}</span>
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Category</h4>
                  <Badge variant="outline">{selectedGig?.category}</Badge>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Client</h4>
                  <div className="flex items-center gap-2">
                    <span className="truncate">👤 {selectedGig?.client?.name}</span>
                    {selectedGig?.client?.rating && (
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {selectedGig.client.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedGig?.skills?.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Posted</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedGig?.createdAt ? new Date(selectedGig.createdAt).toLocaleString() : 'Unknown'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button onClick={() => {
                  setShowDetailsModal(false);
                  handleApplyClick(selectedGig);
                }} className="w-full sm:w-auto">
                  Apply for this Job
                </Button>
                <Button variant="outline" onClick={() => setShowDetailsModal(false)} className="w-full sm:w-auto">
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default FreelancerDashboard;