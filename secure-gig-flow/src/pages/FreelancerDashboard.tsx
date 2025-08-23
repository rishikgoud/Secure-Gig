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
  MapPin,
  Clock,
  X
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

  const handleViewDetailsClick = (gig: any) => {
    setSelectedGig(gig);
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
    { href: '/chat', label: 'Messages', icon: MessageSquare },
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
    <DashboardLayout navLinks={navLinks} userName={userName} userRole="Freelancer" userAvatar={userAvatar}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Freelancer Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
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
            <CardTitle>Recommended Gigs</CardTitle>
            <CardDescription>Gigs matching your skills and experience.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockGigs.map(gig => (
                <Card key={gig.id} className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div className="flex-grow">
                      <h3 className="font-semibold">{gig.title}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{gig.description.substring(0, 100)}...</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-semibold text-green-600">{gig.budget}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{gig.deadline}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{gig.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {gig.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                      </div>
                    </div>
                    <div className="flex gap-2 self-end sm:self-center flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetailsClick(gig.id)}>Details</Button>
                      <Button size="sm" onClick={() => handleApplyClick(gig)}>Apply</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Apply Modal */}
        <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Apply for {selectedGig?.title}</DialogTitle>
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
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowApplyModal(false)}>Cancel</Button>
                <Button onClick={handleSubmitProposal}>Submit Proposal</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedGig?.title}</DialogTitle>
              <DialogDescription>Gig Details</DialogDescription>
            </DialogHeader>
            {selectedGig && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">About the Client</h4>
                  <p className="text-sm text-muted-foreground mb-2">{selectedGig.aboutClient}</p>
                  <p className="text-sm"><span className="font-medium">Client:</span> {selectedGig.client}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Budget</h4>
                  <p className="text-lg font-semibold text-green-600">{selectedGig.budget}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Work Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedGig.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Deadline</h4>
                  <p className="text-sm">{selectedGig.deadline}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedGig.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowDetailsModal(false)}>Close</Button>
                  <Button onClick={() => {
                    setShowDetailsModal(false);
                    handleApplyClick(selectedGig);
                  }}>Apply for this Gig</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default FreelancerDashboard;