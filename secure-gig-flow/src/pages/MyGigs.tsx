import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { getUserData } from '../lib/user-utils';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Shield, 
  Settings,
  DollarSign,
  Plus,
  X,
  Edit,
  Trash2,
  Eye,
  Calendar,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  SlidersHorizontal
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
  createdAt: string;
  assignedTo?: string;
}

interface Proposal {
  id: number;
  gigId: number;
  freelancerName: string;
  portfolioLink: string;
  skills: string[];
  proposedAmount: string;
  proposedTimeline: string;
  coverLetter: string;
  rating: number;
}

const MyGigs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProposalsModal, setShowProposalsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showPostGigModal, setShowPostGigModal] = useState(false);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [gigToDelete, setGigToDelete] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [budgetFilter, setBudgetFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [filteredGigs, setFilteredGigs] = useState<Gig[]>([]);
  
  const [gigs, setGigs] = useState<Gig[]>([
    {
      id: 1,
      title: "Build a DeFi Dashboard",
      description: "Create a comprehensive DeFi dashboard with real-time data visualization and portfolio tracking.",
      budget: "2.5",
      timeline: "4 weeks",
      skills: ["React", "Web3.js", "Chart.js"],
      category: "Web Development",
      proposals: 12,
      status: "Open",
      createdAt: "2024-01-15"
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
      status: "Assigned",
      assignedTo: "BlockchainPro.eth",
      createdAt: "2024-01-10"
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
      status: "Open",
      createdAt: "2024-01-20"
    },
    {
      id: 4,
      title: "Smart Contract Audit",
      description: "Comprehensive security audit of DeFi smart contracts with detailed vulnerability report.",
      budget: "1.8",
      timeline: "3 weeks",
      skills: ["Solidity", "Security", "Audit"],
      category: "Smart Contracts",
      proposals: 6,
      status: "In Progress",
      createdAt: "2024-01-12"
    }
  ]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    timeline: '',
    skills: '',
    category: ''
  });

  const [postGigFormData, setPostGigFormData] = useState({
    title: '',
    description: '',
    budget: '',
    timeline: '',
    skills: '',
    category: '',
    experience: ''
  });

  const userData = getUserData();
  const userName = userData?.name || 'Client';
  const userAvatar = userData?.avatar || '👤';
  
  const navLinks = [
    { href: '/client-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/my-gigs', label: 'My Gigs', icon: Briefcase },
    { href: '/proposals', label: 'Proposals', icon: FileText },
    { href: '/contracts', label: 'Contracts', icon: Shield },
    { href: '/chat', label: 'Messages', icon: MessageSquare },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const mockProposals: Proposal[] = [
    {
      id: 1,
      gigId: 1,
      freelancerName: "Alex.eth",
      portfolioLink: "https://portfolio.alex.eth",
      skills: ["React", "Web3.js", "Solidity"],
      proposedAmount: "2.2",
      proposedTimeline: "3 weeks",
      coverLetter: "I have 5+ years of experience in DeFi development and have built similar dashboards for major protocols.",
      rating: 4.9
    },
    {
      id: 2,
      gigId: 1,
      freelancerName: "Sarah.crypto",
      portfolioLink: "https://sarah-dev.com",
      skills: ["React", "TypeScript", "Chart.js"],
      proposedAmount: "2.4",
      proposedTimeline: "4 weeks",
      coverLetter: "I specialize in creating beautiful dashboards with excellent UX. Check out my portfolio for examples.",
      rating: 4.8
    }
  ];

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
  }, []);

  // Filter gigs based on search and filters
  useEffect(() => {
    let filtered = gigs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(gig => 
        gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Budget filter
    if (budgetFilter) {
      const budget = parseFloat(budgetFilter);
      filtered = filtered.filter(gig => parseFloat(gig.budget) <= budget);
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(gig => gig.category === categoryFilter);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(gig => gig.status === statusFilter);
    }

    setFilteredGigs(filtered);
  }, [gigs, searchQuery, budgetFilter, categoryFilter, statusFilter]);

  // Initialize filtered gigs
  useEffect(() => {
    setFilteredGigs(gigs);
  }, [gigs]);

  const handleManageGig = (gig: Gig) => {
    setSelectedGig(gig);
    setFormData({
      title: gig.title,
      description: gig.description,
      budget: gig.budget,
      timeline: gig.timeline,
      skills: gig.skills.join(', '),
      category: gig.category
    });
    setShowEditModal(true);
  };

  const handleViewProposals = (gig: Gig) => {
    setSelectedGig(gig);
    setShowProposalsModal(true);
  };

  const handleDeleteGig = (gigId: number) => {
    setGigToDelete(gigId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (gigToDelete) {
      const gigToRemove = gigs.find(g => g.id === gigToDelete);
      setGigs(gigs.filter(gig => gig.id !== gigToDelete));
      
      // Remove associated proposals from localStorage
      const existingProposals = JSON.parse(localStorage.getItem('proposals') || '[]');
      const updatedProposals = existingProposals.filter((proposal: any) => proposal.gigId !== gigToDelete);
      localStorage.setItem('proposals', JSON.stringify(updatedProposals));
      
      setGigToDelete(null);
      setShowDeleteConfirm(false);
      
      if (gigToRemove) {
        toast({
          title: "Gig Deleted",
          description: `"${gigToRemove.title}" and all associated proposals have been permanently deleted.`
        });
      }
    }
  };

  const handleUpdateGig = () => {
    if (selectedGig && formData.title && formData.description && formData.budget) {
      const budgetAmount = parseFloat(formData.budget);
      
      if (budgetAmount < 0.01) {
        toast({
          title: "Invalid Amount",
          description: "Minimum budget is 0.01 AVAX",
          variant: "destructive"
        });
        return;
      }
      
      if (budgetAmount > walletBalance) {
        toast({
          title: "Insufficient Balance",
          description: "Please check your wallet balance.",
          variant: "destructive"
        });
        return;
      }
      
      const updatedGigs = gigs.map(gig => 
        gig.id === selectedGig.id 
          ? {
              ...gig,
              title: formData.title,
              description: formData.description,
              budget: formData.budget,
              timeline: formData.timeline,
              skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
              category: formData.category
            }
          : gig
      );
      setGigs(updatedGigs);
      resetForm();
      setShowEditModal(false);
      setSelectedGig(null);
      
      toast({
        title: "Gig Updated Successfully!",
        description: `Your gig "${formData.title}" has been updated.`
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      budget: '',
      timeline: '',
      skills: '',
      category: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAcceptProposal = (proposal: Proposal) => {
    if (selectedGig) {
      const updatedGigs = gigs.map(gig => 
        gig.id === selectedGig.id 
          ? { ...gig, status: 'Assigned', assignedTo: proposal.freelancerName }
          : gig
      );
      setGigs(updatedGigs);
      setShowProposalsModal(false);
      
      toast({
        title: "Gig Assigned Successfully!",
        description: `Your gig "${selectedGig.title}" has been successfully assigned to ${proposal.freelancerName}.`
      });
    }
  };

  const handleViewPortfolio = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowPortfolioModal(true);
  };

  const handleChat = (freelancerName: string) => {
    toast({
      title: "Chat Opening",
      description: `Opening chat with ${freelancerName}...`
    });
  };

  const getProposalsForGig = (gigId: number) => {
    return mockProposals.filter(proposal => proposal.gigId === gigId);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setBudgetFilter('');
    setCategoryFilter('');
    setStatusFilter('');
  };

  const categories = [...new Set(gigs.map(gig => gig.category))];
  const statuses = [...new Set(gigs.map(gig => gig.status))];

  return (
    <DashboardLayout navLinks={navLinks} userName={userName} userRole="Client" userAvatar={userAvatar}>
      <div className="space-y-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-gradient-primary">My Gigs</h1>
            <Button 
              onClick={() => setShowPostGigModal(true)}
              className="bg-gradient-primary text-white hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post a Gig
            </Button>
          </div>

          {/* Search and Filter Section */}
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search gigs by title, skills, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Budget (AVAX)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">≤ 1 AVAX</SelectItem>
                    <SelectItem value="2">≤ 2 AVAX</SelectItem>
                    <SelectItem value="3">≤ 3 AVAX</SelectItem>
                    <SelectItem value="5">≤ 5 AVAX</SelectItem>
                    <SelectItem value="10">≤ 10 AVAX</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={clearFilters}>
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {filteredGigs.map(gig => (
            <Card key={gig.id} className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-primary/20 hover:border-l-primary/60">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-xl">{gig.title}</h3>
                      <Badge variant={gig.status === 'Open' ? 'default' : gig.status === 'Assigned' ? 'secondary' : 'outline'}>
                        {gig.status === 'Assigned' ? `Assigned to ${gig.assignedTo}` : gig.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{gig.description}</p>
                    <div className="flex items-center gap-6 mb-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {gig.budget} AVAX
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {gig.timeline}
                      </span>
                      <span>{gig.proposals} proposals</span>
                      <span>Posted: {gig.createdAt}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {gig.skills.map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleViewProposals(gig)} className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    View Proposals ({gig.proposals})
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleManageGig(gig)} className="flex items-center gap-1">
                    <Edit className="h-4 w-4" />
                    Edit Gig
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteGig(gig.id)} className="flex items-center gap-1 text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {filteredGigs.length === 0 && gigs.length > 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No gigs match your search criteria.</p>
              <p>Try adjusting your filters or search terms.</p>
              <Button className="mt-4" variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
          
          {gigs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No gigs posted yet.</p>
              <p>Post your first gig to start receiving proposals from freelancers.</p>
              <Button className="mt-4" onClick={() => navigate('/client-dashboard')}>
                Post Your First Gig
              </Button>
            </div>
          )}
        </div>

        {/* Edit Gig Modal */}
        {showEditModal && selectedGig && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Edit Gig</CardTitle>
                  <CardDescription>Update your gig details.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowEditModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title *</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Web Development">Web Development</SelectItem>
                        <SelectItem value="Blockchain Development">Blockchain Development</SelectItem>
                        <SelectItem value="Smart Contracts">Smart Contracts</SelectItem>
                        <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                        <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                        <SelectItem value="Data Analysis">Data Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description *</Label>
                  <Textarea
                    id="edit-description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-budget">Budget (AVAX) *</Label>
                    <div className="relative">
                      <Input
                        id="edit-budget"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.budget}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                        AVAX
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Available: {walletBalance.toFixed(4)} AVAX | Min: 0.01 AVAX</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-timeline">Timeline *</Label>
                    <Input
                      id="edit-timeline"
                      value={formData.timeline}
                      onChange={(e) => handleInputChange('timeline', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-skills">Required Skills</Label>
                  <Input
                    id="edit-skills"
                    value={formData.skills}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button onClick={() => setShowEditModal(false)} variant="outline">Cancel</Button>
                  <Button onClick={handleUpdateGig} disabled={!formData.title || !formData.description || !formData.budget}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Proposals Modal */}
        {showProposalsModal && selectedGig && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Proposals for "{selectedGig.title}"</CardTitle>
                  <CardDescription>{getProposalsForGig(selectedGig.id).length} proposals received</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowProposalsModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {getProposalsForGig(selectedGig.id).map(proposal => (
                  <Card key={proposal.id} className="p-4 border-l-4 border-l-primary/20">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{proposal.freelancerName}</h4>
                          <Badge variant="secondary">★ {proposal.rating}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{proposal.coverLetter}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {proposal.skills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1 font-medium text-green-600">
                            <DollarSign className="h-3 w-3" />
                            {proposal.proposedAmount} AVAX
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {proposal.proposedTimeline}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 lg:w-auto">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleViewPortfolio(proposal)}
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Portfolio
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleChat(proposal.freelancerName)}
                          className="flex items-center gap-1"
                        >
                          <MessageSquare className="h-3 w-3" />
                          Chat
                        </Button>
                        {selectedGig.status === 'Open' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleAcceptProposal(proposal)}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Accept
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                {getProposalsForGig(selectedGig.id).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No proposals received for this gig yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Portfolio Modal */}
        {showPortfolioModal && selectedProposal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{selectedProposal.freelancerName}'s Portfolio</CardTitle>
                  <CardDescription>View freelancer's work and experience</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowPortfolioModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">About</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedProposal.coverLetter}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Skills & Expertise</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProposal.skills.map(skill => (
                          <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Portfolio Preview</h4>
                      <div className="bg-muted/30 rounded-lg p-8 text-center">
                        <ExternalLink className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Portfolio content would be displayed here</p>
                        <Button 
                          className="mt-4" 
                          onClick={() => window.open(selectedProposal.portfolioLink, '_blank')}
                        >
                          View Full Portfolio
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Card className="p-4">
                      <div className="text-center space-y-2">
                        <div className="text-2xl font-bold">★ {selectedProposal.rating}</div>
                        <p className="text-sm text-muted-foreground">Rating</p>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Proposed Amount</span>
                          <span className="font-semibold text-green-600">{selectedProposal.proposedAmount} AVAX</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Timeline</span>
                          <span className="font-semibold">{selectedProposal.proposedTimeline}</span>
                        </div>
                      </div>
                    </Card>
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        onClick={() => handleChat(selectedProposal.freelancerName)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Start Chat
                      </Button>
                      {selectedGig?.status === 'Open' && (
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => {
                            handleAcceptProposal(selectedProposal);
                            setShowPortfolioModal(false);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Proposal
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Post Gig Modal */}
        <Dialog open={showPostGigModal} onOpenChange={setShowPostGigModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Post a New Gig</DialogTitle>
              <DialogDescription>
                Create a new project and find the perfect freelancer
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="post-title">Project Title</Label>
                <Input
                  id="post-title"
                  placeholder="Enter your project title"
                  value={postGigFormData.title}
                  onChange={(e) => setPostGigFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-description">Project Description</Label>
                <Textarea
                  id="post-description"
                  placeholder="Describe your project requirements, goals, and expectations..."
                  rows={4}
                  value={postGigFormData.description}
                  onChange={(e) => setPostGigFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="post-budget">Budget (AVAX)</Label>
                  <Input
                    id="post-budget"
                    type="number"
                    step="0.0001"
                    placeholder="0.0000"
                    value={postGigFormData.budget}
                    onChange={(e) => setPostGigFormData(prev => ({ ...prev, budget: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="post-timeline">Timeline</Label>
                  <Input
                    id="post-timeline"
                    placeholder="e.g., 2 weeks"
                    value={postGigFormData.timeline}
                    onChange={(e) => setPostGigFormData(prev => ({ ...prev, timeline: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-category">Category</Label>
                <Select value={postGigFormData.category} onValueChange={(value) => setPostGigFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Blockchain Development">Blockchain Development</SelectItem>
                    <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                    <SelectItem value="Smart Contracts">Smart Contracts</SelectItem>
                    <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-skills">Required Skills</Label>
                <Input
                  id="post-skills"
                  placeholder="e.g., React, Solidity, Web3.js (comma separated)"
                  value={postGigFormData.skills}
                  onChange={(e) => setPostGigFormData(prev => ({ ...prev, skills: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-experience">Experience Level</Label>
                <Select value={postGigFormData.experience} onValueChange={(value) => setPostGigFormData(prev => ({ ...prev, experience: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entry Level">Entry Level</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (!postGigFormData.title || !postGigFormData.description || !postGigFormData.budget || !postGigFormData.category) {
                      toast({
                        title: "Missing Information",
                        description: "Please fill in all required fields.",
                        variant: "destructive",
                      });
                      return;
                    }

                    const newGig: Gig = {
                      id: Math.max(...gigs.map(g => g.id)) + 1,
                      title: postGigFormData.title,
                      description: postGigFormData.description,
                      budget: postGigFormData.budget,
                      timeline: postGigFormData.timeline,
                      skills: postGigFormData.skills.split(',').map(s => s.trim()),
                      category: postGigFormData.category,
                      proposals: 0,
                      status: "Open",
                      createdAt: new Date().toISOString().split('T')[0]
                    };

                    setGigs(prev => [newGig, ...prev]);
                    
                    toast({
                      title: "Gig Posted Successfully",
                      description: `Your gig "${postGigFormData.title}" has been posted and is now live.`,
                    });

                    setPostGigFormData({
                      title: '',
                      description: '',
                      budget: '',
                      timeline: '',
                      skills: '',
                      category: '',
                      experience: ''
                    });
                    setShowPostGigModal(false);
                  }}
                >
                  Post Gig
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPostGigModal(false);
                    setPostGigFormData({
                      title: '',
                      description: '',
                      budget: '',
                      timeline: '',
                      skills: '',
                      category: '',
                      experience: ''
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
              <CardHeader>
                <CardTitle className="text-red-600">Delete Gig</CardTitle>
                <CardDescription>Are you sure you want to delete this gig? This action cannot be undone.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end gap-2">
                  <Button onClick={() => setShowDeleteConfirm(false)} variant="outline">Cancel</Button>
                  <Button onClick={confirmDelete} variant="destructive">Delete</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyGigs;
