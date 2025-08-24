import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { getUserData, getWalletBalance } from '../lib/user-utils';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  MessageCircle, 
  Shield, 
  Settings,
  DollarSign,
  Star,
  User,
  Calendar,
  CheckCircle,
  X,
  Eye,
  Clock,
  Award,
  MapPin,
  ExternalLink,
  Lock,
  Wallet
} from 'lucide-react';

interface Gig {
  id: number;
  title: string;
  description: string;
  budget: string;
  timeline: string;
  skills: string[];
  category: string;
  proposals: number;
  status: string;
  assignedTo?: string;
}

interface Proposal {
  id: number;
  gigId: number;
  freelancerName: string;
  freelancerWallet: string;
  proposedAmount: string;
  timeline: string;
  coverLetter: string;
  rating: number;
  completedProjects: number;
  skills: string[];
  appliedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface FreelancerProfile {
  name: string;
  wallet: string;
  rating: number;
  completedProjects: number;
  skills: string[];
  bio: string;
  location: string;
  hourlyRate: string;
  portfolio: {
    title: string;
    description: string;
    image: string;
    link: string;
  }[];
}

const ProposalsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [walletBalance, setWalletBalance] = useState(0);
  const [escrowBalance, setEscrowBalance] = useState(0);

  // Load actual wallet balance
  useEffect(() => {
    const loadWalletBalance = async () => {
      const balance = await getWalletBalance();
      setWalletBalance(balance);
    };
    loadWalletBalance();
  }, []);

  const [selectedProfile, setSelectedProfile] = useState<FreelancerProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [gigs] = useState<Gig[]>([
    {
      id: 1,
      title: "Build a DeFi Dashboard",
      description: "Create a comprehensive DeFi dashboard with real-time data visualization and portfolio tracking.",
      budget: "2.5",
      timeline: "4 weeks",
      skills: ["React", "Web3.js", "Chart.js"],
      category: "Web Development",
      proposals: 12,
      status: "Open"
    },
    {
      id: 2,
      title: "NFT Marketplace Smart Contract",
      description: "Develop and deploy smart contracts for an NFT marketplace with minting and trading capabilities.",
      budget: "3.0",
      timeline: "6 weeks",
      skills: ["Solidity", "Hardhat", "Ethers.js"],
      category: "Blockchain Development",
      proposals: 8,
      status: "Open"
    },
    {
      id: 3,
      title: "Mobile Crypto Wallet App",
      description: "Design and develop a secure mobile cryptocurrency wallet with multi-chain support.",
      budget: "4.2",
      timeline: "8 weeks",
      skills: ["React Native", "TypeScript", "Blockchain"],
      category: "Mobile Development",
      proposals: 15,
      status: "Open"
    }
  ]);

  const [mockProposals, setMockProposals] = useState<Proposal[]>([
    {
      id: 1,
      gigId: 1,
      freelancerName: "Alex Chen",
      freelancerWallet: "0x742d35Cc6634C0532925a3b8D2",
      proposedAmount: "2.3",
      timeline: "3 weeks",
      coverLetter: "I have 5+ years of experience in React and Web3 development. I've built similar DeFi dashboards and can deliver high-quality work within your timeline.",
      rating: 4.9,
      completedProjects: 47,
      skills: ["React", "Web3.js", "Chart.js", "TypeScript"],
      appliedAt: "2024-01-16",
      status: "pending"
    },
    {
      id: 2,
      gigId: 1,
      freelancerName: "Sarah Williams",
      freelancerWallet: "0x8ba1f109551bD432803012645Hac136c",
      proposedAmount: "2.1",
      timeline: "4 weeks",
      coverLetter: "Specialized in DeFi applications with a strong background in data visualization. I can create an intuitive and responsive dashboard that meets your requirements.",
      rating: 4.8,
      completedProjects: 32,
      skills: ["React", "D3.js", "Web3", "Solidity"],
      appliedAt: "2024-01-17",
      status: "pending"
    },
    {
      id: 3,
      gigId: 2,
      freelancerName: "BlockchainPro.eth",
      freelancerWallet: "0x1234567890abcdef1234567890abcdef12345678",
      proposedAmount: "2.8",
      timeline: "5 weeks",
      coverLetter: "Expert in Solidity and smart contract development. I've deployed multiple NFT marketplaces and can ensure secure, gas-optimized contracts.",
      rating: 4.95,
      completedProjects: 89,
      skills: ["Solidity", "Hardhat", "OpenZeppelin", "IPFS"],
      appliedAt: "2024-01-11",
      status: "pending"
    },
    {
      id: 4,
      gigId: 3,
      freelancerName: "MobileDev Pro",
      freelancerWallet: "0xabcdef1234567890abcdef1234567890abcdef12",
      proposedAmount: "3.8",
      timeline: "7 weeks",
      coverLetter: "Mobile development specialist focusing on secure cryptocurrency applications.",
      rating: 4.7,
      completedProjects: 23,
      skills: ["React Native", "TypeScript", "Blockchain", "Security"],
      appliedAt: "2024-01-21",
      status: "pending"
    }
  ]);


  const mockFreelancerProfiles: { [key: string]: FreelancerProfile } = {
    "Alex Chen": {
      name: "Alex Chen",
      wallet: "0x742d35Cc6634C0532925a3b8D2",
      rating: 4.9,
      completedProjects: 47,
      skills: ["React", "Web3.js", "Chart.js", "TypeScript", "Node.js"],
      bio: "Full-stack developer with 5+ years of experience in Web3 and DeFi applications. Passionate about creating user-friendly interfaces for complex blockchain technologies.",
      location: "San Francisco, CA",
      hourlyRate: "0.05",
      portfolio: [
        {
          title: "DeFi Portfolio Tracker",
          description: "Real-time portfolio tracking with yield farming analytics",
          image: "/placeholder.svg",
          link: "https://defi-tracker.example.com"
        }
      ]
    },
    "Sarah Williams": {
      name: "Sarah Williams",
      wallet: "0x8ba1f109551bD432803012645Hac136c",
      rating: 4.8,
      completedProjects: 32,
      skills: ["React", "D3.js", "Web3", "Solidity", "Python"],
      bio: "Data visualization expert specializing in DeFi dashboards and analytics platforms.",
      location: "Austin, TX",
      hourlyRate: "0.04",
      portfolio: [
        {
          title: "Yield Analytics Dashboard",
          description: "Advanced analytics for DeFi yield strategies",
          image: "/placeholder.svg",
          link: "https://yield-analytics.example.com"
        }
      ]
    },
    "BlockchainPro.eth": {
      name: "BlockchainPro.eth",
      wallet: "0x1234567890abcdef1234567890abcdef12345678",
      rating: 4.95,
      completedProjects: 89,
      skills: ["Solidity", "Hardhat", "OpenZeppelin", "IPFS", "Assembly"],
      bio: "Senior blockchain developer with expertise in smart contract security and gas optimization.",
      location: "Remote",
      hourlyRate: "0.08",
      portfolio: [
        {
          title: "Multi-Chain DEX",
          description: "Cross-chain decentralized exchange with automated market making",
          image: "/placeholder.svg",
          link: "https://multi-dex.example.com"
        }
      ]
    },
    "MobileDev Pro": {
      name: "MobileDev Pro",
      wallet: "0xabcdef1234567890abcdef1234567890abcdef12",
      rating: 4.7,
      completedProjects: 23,
      skills: ["React Native", "TypeScript", "Blockchain", "Security"],
      bio: "Mobile development specialist focusing on secure cryptocurrency applications.",
      location: "London, UK",
      hourlyRate: "0.06",
      portfolio: [
        {
          title: "Crypto Wallet App",
          description: "Multi-chain mobile wallet with DeFi integration",
          image: "/placeholder.svg",
          link: "https://crypto-wallet.example.com"
        }
      ]
    }
  };

  // Fetch wallet balance on component mount
  useEffect(() => {
    const fetchBalance = async () => {
      const address = localStorage.getItem('walletAddress');
      if (address && window.ethereum) {
        try {
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [address, 'latest']
          });
          const balanceInAvax = parseInt(balance, 16) / Math.pow(10, 18);
          setWalletBalance(balanceInAvax);
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      }
    };
    fetchBalance();
    
    // Load escrow balance from localStorage
    const savedEscrow = localStorage.getItem('escrowBalance');
    if (savedEscrow) {
      setEscrowBalance(parseFloat(savedEscrow));
    }
  }, []);

  const handleViewProfile = (freelancerName: string) => {
    const profile = mockFreelancerProfiles[freelancerName];
    if (profile) {
      setSelectedProfile(profile);
      setShowProfileModal(true);
    }
  };

  const handleChat = (freelancerName: string) => {
    // Format the message for WhatsApp
    const message = encodeURIComponent(`Hi ${freelancerName}, I'd like to discuss your proposal for my project.`);
    // Open WhatsApp Web with the pre-filled message
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleRejectProposal = (proposalId: number) => {
    setMockProposals(prev => 
      prev.map(proposal => 
        proposal.id === proposalId 
          ? { ...proposal, status: 'rejected' as const }
          : proposal
      )
    );
    toast({
      title: "Proposal Rejected",
      description: "The proposal has been rejected.",
      variant: "destructive"
    });
  };

  const handleAcceptProposal = async (proposal: Proposal) => {
    const proposedAmount = parseFloat(proposal.proposedAmount);
    
    if (walletBalance < proposedAmount) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${proposedAmount} AVAX but only have ${walletBalance.toFixed(4)} AVAX in your wallet.`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate AVAX deduction and escrow lock
      const newWalletBalance = walletBalance - proposedAmount;
      const newEscrowBalance = escrowBalance + proposedAmount;
      
      setWalletBalance(newWalletBalance);
      setEscrowBalance(newEscrowBalance);
      
      // Save escrow balance to localStorage
      localStorage.setItem('escrowBalance', newEscrowBalance.toString());
      
      // Update proposal status
      setMockProposals(prev => 
        prev.map(p => 
          p.id === proposal.id 
            ? { ...p, status: 'accepted' as const }
            : p
        )
      );

      toast({
        title: "Task Assigned Successfully!",
        description: `Task assigned to ${proposal.freelancerName}. ${proposedAmount} AVAX locked in Escrow until task completion.`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to process the payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getGigById = (gigId: number) => {
    return gigs.find(gig => gig.id === gigId);
  };

  const getProposalsForGig = (gigId: number) => {
    return mockProposals.filter(proposal => proposal.gigId === gigId && proposal.status === 'pending');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const userData = getUserData();
  const userName = userData?.name || 'Client';
  const userAvatar = userData?.avatar || '👤';
  
  const navLinks = [
    { href: '/client-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/my-gigs', label: 'My Gigs', icon: Briefcase },
    { href: '/proposals', label: 'Proposals', icon: FileText },
    { href: '/contracts', label: 'Contracts', icon: Shield },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <DashboardLayout navLinks={navLinks}>
      <div className="space-y-6 md:space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Received Proposals</h1>
            <p className="text-muted-foreground text-sm md:text-base">Review and manage proposals from freelancers for your posted gigs</p>
          </div>
        </div>

        {/* Wallet Balance and Escrow Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wallet Balance</p>
                <p className="text-xl md:text-2xl font-bold">{walletBalance.toFixed(4)} AVAX</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 md:p-3 rounded-full">
                <Wallet className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Escrow Balance</p>
                <p className="text-xl md:text-2xl font-bold text-green-600">{escrowBalance.toFixed(4)} AVAX</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-2 md:p-3 rounded-full">
                <Shield className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6 md:space-y-8">
          {gigs.map(gig => {
            const gigProposals = getProposalsForGig(gig.id);
            if (gigProposals.length === 0) return null;
            
            return (
              <Card key={gig.id} className="p-4 md:p-6">
                <div className="mb-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 gap-4">
                    <div className="flex-1">
                      <h2 className="text-lg md:text-xl font-semibold mb-2">{gig.title}</h2>
                      <p className="text-muted-foreground mb-3 text-sm md:text-base leading-relaxed">{gig.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {gig.skills.map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-left lg:text-right flex-shrink-0">
                      <div className="text-lg font-semibold text-green-600 mb-1">
                        {gig.budget} AVAX
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {gig.timeline}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-4">
                    <span className="font-medium">{gigProposals.length}</span> freelancer{gigProposals.length !== 1 ? 's' : ''} applied
                  </div>
                  
                  <div className="space-y-4">
                    {gigProposals.map(proposal => (
                      <div key={proposal.id} className="border rounded-lg p-3 md:p-4 hover:bg-muted/20 transition-colors">
                        <div className="flex flex-col gap-4">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                              <h4 className="font-semibold text-base">{proposal.freelancerName}</h4>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                  <Star className="h-3 w-3 fill-current" />
                                  {proposal.rating}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {proposal.completedProjects} projects
                                </Badge>
                                <Badge variant={getStatusBadgeVariant(proposal.status)} className="text-xs">
                                  {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1 font-medium text-green-600">
                                <DollarSign className="h-3 w-3" />
                                {proposal.proposedAmount} AVAX
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {proposal.timeline}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Applied {proposal.appliedAt}
                              </span>
                            </div>
                            
                            <p className="text-muted-foreground mb-3 text-sm leading-relaxed">{proposal.coverLetter}</p>
                            
                            <div className="flex flex-wrap gap-2">
                              {proposal.skills.map(skill => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {proposal.status === 'pending' && (
                          <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-4 border-t mt-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewProfile(proposal.freelancerName)}
                              className="flex items-center gap-1 w-full sm:w-auto"
                            >
                              <Eye className="h-4 w-4" />
                              View Profile
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleChat(proposal.freelancerName)}
                              className="flex items-center gap-1 w-full sm:w-auto"
                            >
                              <MessageCircle className="h-4 w-4" />
                              Chat
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleRejectProposal(proposal.id)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700 w-full sm:w-auto"
                            >
                              <X className="h-4 w-4" />
                              Reject
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleAcceptProposal(proposal)}
                              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Accept & Hire
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {mockProposals.filter(p => p.status === 'pending').length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 opacity-50" />
            <p className="text-base md:text-lg">No proposals received yet.</p>
            <p className="text-sm md:text-base">Post some gigs to start receiving proposals from talented freelancers.</p>
          </div>
        )}

        {/* Freelancer Profile Modal */}
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl pr-8">Freelancer Profile</DialogTitle>
            </DialogHeader>
            {selectedProfile && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold mb-2">{selectedProfile.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <Star className="h-3 w-3 fill-current" />
                        {selectedProfile.rating}
                      </Badge>
                      <Badge variant="outline" className="w-fit">
                        <Award className="h-3 w-3 mr-1" />
                        {selectedProfile.completedProjects} projects
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedProfile.location}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4 text-sm md:text-base leading-relaxed">{selectedProfile.bio}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-medium">Hourly Rate:</span>
                      <span className="text-green-600 font-semibold">{selectedProfile.hourlyRate} AVAX/hour</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Portfolio</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProfile.portfolio.map((item, index) => (
                      <Card key={index} className="p-4">
                        <h5 className="font-semibold mb-2 text-sm md:text-base">{item.title}</h5>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{item.description}</p>
                        <Button variant="outline" size="sm" className="flex items-center gap-1 w-full sm:w-auto">
                          <ExternalLink className="h-3 w-3" />
                          View Project
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Wallet:</span> 
                  <span className="font-mono break-all ml-1">{selectedProfile.wallet}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ProposalsPage;
