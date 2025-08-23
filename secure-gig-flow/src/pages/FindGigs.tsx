import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { getUserData } from '../lib/user-utils';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, 
  Search,
  FileText, 
  MessageSquare, 
  Shield, 
  Settings,
  Clock,
  MapPin,
  User,
  DollarSign,
  Filter
} from 'lucide-react';

interface Gig {
  id: number;
  title: string;
  client: string;
  clientWallet: string;
  budget: string;
  description: string;
  deadline: string;
  skills: string[];
  location: string;
  aboutClient: string;
  category: string;
  postedDate: string;
}

const FindGigs = () => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [filteredGigs, setFilteredGigs] = useState<Gig[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [proposalMessage, setProposalMessage] = useState('');
  const [proposedTimeline, setProposedTimeline] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const userData = getUserData();
  const userName = userData?.name || 'Freelancer';
  const userAvatar = userData?.avatar || '👨‍💻';
  const { toast } = useToast();

  const navLinks = [
    { href: '/freelancer-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/find-gigs', label: 'Find Gigs', icon: Search },
    { href: '/my-proposals', label: 'My Proposals', icon: FileText },
    { href: '/my-contracts', label: 'My Contracts', icon: Shield },
    { href: '/chat', label: 'Messages', icon: MessageSquare },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  // Mock gigs data
  useEffect(() => {
    const mockGigs: Gig[] = [
      {
        id: 1,
        title: "Build a DeFi Dashboard",
        client: "CryptoClient.eth",
        clientWallet: "0x742d35Cc6634C0532925a3b8D2",
        budget: "2.5 AVAX",
        description: "Create a comprehensive DeFi dashboard with real-time data visualization and portfolio tracking capabilities. The dashboard should support multiple DeFi protocols and provide users with insights into their investments.",
        deadline: "4 weeks",
        skills: ["React", "Web3.js", "Chart.js", "TypeScript"],
        location: "Remote",
        aboutClient: "Experienced DeFi project founder looking for skilled developers to build next-generation financial tools.",
        category: "Web Development",
        postedDate: "2024-01-20"
      },
      {
        id: 2,
        title: "NFT Marketplace Smart Contract",
        client: "NFTCreator.eth",
        clientWallet: "0x8ba1f109551bD432803012645Hac136c",
        budget: "3.0 AVAX",
        description: "Develop and deploy smart contracts for an NFT marketplace with minting, trading, and royalty features. The platform should support ERC-721 and ERC-1155 standards with gas optimization.",
        deadline: "6 weeks",
        skills: ["Solidity", "Hardhat", "OpenZeppelin", "IPFS"],
        location: "Remote",
        aboutClient: "Digital artist and NFT enthusiast building a community-focused marketplace platform.",
        category: "Blockchain Development",
        postedDate: "2024-01-18"
      },
      {
        id: 3,
        title: "Mobile Crypto Wallet App",
        client: "WalletTech.eth",
        clientWallet: "0x1234567890abcdef1234567890abcdef12345678",
        budget: "4.2 AVAX",
        description: "Design and develop a secure mobile cryptocurrency wallet with multi-chain support and DeFi integration. The app should have biometric authentication and hardware wallet support.",
        deadline: "8 weeks",
        skills: ["React Native", "TypeScript", "Blockchain", "Security"],
        location: "Remote",
        aboutClient: "Fintech startup focused on making cryptocurrency accessible to mainstream users.",
        category: "Mobile Development",
        postedDate: "2024-01-15"
      },
      {
        id: 4,
        title: "Yield Farming Analytics Tool",
        client: "YieldMaster.eth",
        clientWallet: "0xabcdef1234567890abcdef1234567890abcdef12",
        budget: "1.8 AVAX",
        description: "Build a comprehensive yield farming analytics tool that tracks APY across different protocols and provides automated rebalancing suggestions.",
        deadline: "5 weeks",
        skills: ["Python", "Web3.py", "Data Analysis", "API Integration"],
        location: "Remote",
        aboutClient: "DeFi researcher and yield farmer looking to build tools for the community.",
        category: "Data Analysis",
        postedDate: "2024-01-22"
      },
      {
        id: 5,
        title: "Cross-Chain Bridge Interface",
        client: "BridgeBuilder.eth",
        clientWallet: "0x9876543210fedcba9876543210fedcba98765432",
        budget: "5.0 AVAX",
        description: "Create a user-friendly interface for a cross-chain bridge protocol. The interface should support multiple chains and provide real-time transaction tracking.",
        deadline: "10 weeks",
        skills: ["React", "Web3.js", "Multi-chain", "UI/UX"],
        location: "Remote",
        aboutClient: "Blockchain infrastructure company building interoperability solutions.",
        category: "Web Development",
        postedDate: "2024-01-19"
      }
    ];

    setGigs(mockGigs);
    setFilteredGigs(mockGigs);
  }, []);

  // Filter gigs based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredGigs(gigs);
    } else {
      const filtered = gigs.filter(gig =>
        gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gig.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gig.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        gig.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGigs(filtered);
    }
  }, [searchTerm, gigs]);

  const handleApplyClick = (gig: Gig) => {
    setSelectedGig(gig);
    setShowApplyModal(true);
    setProposalMessage('');
    setProposedTimeline('');
    setAdditionalNotes('');
  };

  const handleViewDetailsClick = (gig: Gig) => {
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
      gigId: selectedGig!.id,
      gigTitle: selectedGig!.title,
      clientName: selectedGig!.client,
      proposalMessage,
      proposedTimeline,
      additionalNotes,
      status: 'Pending',
      appliedAt: new Date().toISOString(),
      proposedAmount: selectedGig!.budget
    };
    
    existingProposals.push(newProposal);
    localStorage.setItem('freelancerProposals', JSON.stringify(existingProposals));
    
    setShowApplyModal(false);
    toast({
      title: "Successfully applied for gig!",
      description: `Your proposal for "${selectedGig!.title}" has been submitted.`
    });
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
          <h1 className="text-3xl font-bold">Find Gigs</h1>
          <div className="text-sm text-muted-foreground">
            {filteredGigs.length} gig{filteredGigs.length !== 1 ? 's' : ''} available
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, description, skills, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gigs List */}
        <div className="space-y-6">
          {filteredGigs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No gigs found</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm ? 'Try adjusting your search terms or filters.' : 'Check back later for new opportunities.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredGigs.map((gig) => (
              <Card key={gig.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{gig.title}</CardTitle>
                      <CardDescription className="mt-2">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {gig.client}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {gig.location}
                          </span>
                          <span className="text-muted-foreground">
                            Posted {formatDate(gig.postedDate)}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">{gig.budget}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {gig.deadline}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      {gig.description.length > 200 
                        ? `${gig.description.substring(0, 200)}...` 
                        : gig.description
                      }
                    </p>

                    <div>
                      <h4 className="font-medium mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {gig.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <Badge variant="outline">{gig.category}</Badge>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewDetailsClick(gig)}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleApplyClick(gig)}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

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

export default FindGigs;
