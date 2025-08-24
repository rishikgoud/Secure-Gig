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
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { getUserData } from '../lib/user-utils';
import { JobPost } from '@/api/types';
import ProposalManagement from '@/components/proposals/ProposalManagement';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  MessageCircle, 
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

// Using JobPost type from API types instead of local Gig interface

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
  const { user, isAuthenticated } = useAuth();
  const {
    myJobs,
    categories: jobCategories,
    popularSkills,
    isLoading,
    fetchMyJobs,
    fetchJobCategories,
    fetchPopularSkills,
    createJob,
    updateJob,
    deleteJob,
    updateJobStatus
  } = useJobs();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProposalsModal, setShowProposalsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showPostGigModal, setShowPostGigModal] = useState(false);
  const [selectedGig, setSelectedGig] = useState<JobPost | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [gigToDelete, setGigToDelete] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [budgetFilter, setBudgetFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [filteredGigs, setFilteredGigs] = useState<JobPost[]>([]);
  
  // Jobs are now managed by useJobs hook
  
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
    budgetType: 'fixed',
    currency: 'AVAX',
    timeline: '',
    timelineUnit: 'weeks',
    skills: '',
    category: '',
    experienceLevel: 'intermediate',
    locationType: 'remote',
    city: '',
    country: '',
    portfolioRequired: true,
    testRequired: true,
    urgency: 'high'
  });

  const userData = getUserData();
  const userName = user?.name || userData?.name || 'Client';
  const userAvatar = userData?.avatar || '';
  
  const navLinks = [
    { href: '/client-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/my-gigs', label: 'My Gigs', icon: Briefcase },
    { href: '/proposals', label: 'Proposals', icon: FileText },
    { href: '/contracts', label: 'Contracts', icon: Shield },
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

  // Fetch data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchMyJobs();
      fetchJobCategories();
      fetchPopularSkills();
    }
    
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
  }, [isAuthenticated, fetchMyJobs, fetchJobCategories, fetchPopularSkills]);

  // Filter jobs based on search and filters
  useEffect(() => {
    let filtered = myJobs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Budget filter
    if (budgetFilter) {
      const budget = parseFloat(budgetFilter);
      filtered = filtered.filter(job => job.budget.amount <= budget);
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(job => job.category === categoryFilter);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    setFilteredGigs(filtered);
  }, [myJobs, searchQuery, budgetFilter, categoryFilter, statusFilter]);

  // Initialize filtered jobs
  useEffect(() => {
    setFilteredGigs(myJobs);
  }, [myJobs]);

  const handleManageGig = (job: JobPost) => {
    setSelectedGig(job);
    setFormData({
      title: job.title,
      description: job.description,
      budget: job.budget.amount.toString(),
      timeline: typeof job.timeline === 'string' ? job.timeline : `${job.timeline.duration} ${job.timeline.unit}`,
      skills: job.skills.join(', '),
      category: job.category
    });
    setShowEditModal(true);
  };

  const handleViewProposals = (job: JobPost) => {
    setSelectedGig(job);
    setShowProposalsModal(true);
  };

  const handleDeleteGig = (jobId: string) => {
    setGigToDelete(jobId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (gigToDelete) {
      try {
        await deleteJob(gigToDelete);
        setGigToDelete(null);
        setShowDeleteConfirm(false);
      } catch (error) {
        // Error handling is done in the hook
        console.error('Delete failed:', error);
      }
    }
  };

  const handleUpdateGig = async () => {
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
      
      try {
        const updateData = {
          title: formData.title,
          description: formData.description,
          budget: {
            type: 'fixed' as const,
            amount: budgetAmount,
            currency: 'AVAX'
          },
          timeline: {
            duration: parseInt(formData.timeline.split(' ')[0]) || 1,
            unit: 'weeks' as const
          },
          skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
          category: formData.category as any
        };
        
        await updateJob(selectedGig._id, updateData);
        resetForm();
        setShowEditModal(false);
        setSelectedGig(null);
      } catch (error) {
        // Error handling is done in the hook
        console.error('Update failed:', error);
      }
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

  const handleAcceptProposal = async (proposal: Proposal) => {
    if (selectedGig) {
      try {
        await updateJobStatus(selectedGig._id, 'active');
        setShowProposalsModal(false);
        
        toast({
          title: "Gig Assigned Successfully!",
          description: `Your gig "${selectedGig.title}" has been successfully assigned to ${proposal.freelancerName}.`
        });
      } catch (error) {
        console.error('Failed to accept proposal:', error);
      }
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

  const availableCategories = jobCategories.length > 0 ? jobCategories : ['Web Development', 'Blockchain Development', 'Mobile Development', 'Smart Contracts', 'UI/UX Design', 'Data Science'];
  const statuses = ['draft', 'active', 'paused', 'completed', 'cancelled'];

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
                    {availableCategories.map(category => (
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
          {filteredGigs.map(job => (
            <Card key={job._id} className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-primary/20 hover:border-l-primary/60">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-xl">{job.title}</h3>
                      <Badge variant={job.status === 'active' ? 'default' : job.status === 'completed' ? 'secondary' : 'outline'}>
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{job.description}</p>
                    <div className="flex items-center gap-6 mb-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {job.budget.amount} {job.budget.currency}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {typeof job.timeline === 'string' ? job.timeline : `${job.timeline.duration} ${job.timeline.unit}`}
                      </span>
                      <span>{job.proposals?.count || 0} proposals</span>
                      <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleViewProposals(job)} className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    View Proposals ({job.proposals?.count || 0})
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleManageGig(job)} className="flex items-center gap-1">
                    <Edit className="h-4 w-4" />
                    Edit Gig
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteGig(job._id)} className="flex items-center gap-1 text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {filteredGigs.length === 0 && myJobs.length > 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No gigs match your search criteria.</p>
              <p>Try adjusting your filters or search terms.</p>
              <Button className="mt-4" variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
          
          {myJobs.length === 0 && (
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
            <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <ProposalManagement 
                job={selectedGig}
                onClose={() => setShowProposalsModal(false)}
              />
            </div>
          </div>
        )}

        {/* Legacy Proposals Modal - Remove after testing */}
        {false && showProposalsModal && selectedGig && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Proposals for "{selectedGig.title}"</CardTitle>
                  <CardDescription>{getProposalsForGig(parseInt(selectedGig._id)).length} proposals received</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowProposalsModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {getProposalsForGig(parseInt(selectedGig._id)).map(proposal => (
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
                          <MessageCircle className="h-3 w-3" />
                          Chat
                        </Button>
                        {selectedGig.status === 'active' && (
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
                {getProposalsForGig(parseInt(selectedGig._id)).length === 0 && (
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
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Start Chat
                      </Button>
                      {selectedGig?.status === 'active' && (
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
                  <Label htmlFor="post-budget">Budget Amount</Label>
                  <div className="flex gap-2">
                    <Input
                      id="post-budget"
                      type="number"
                      step="0.0001"
                      min="1"
                      placeholder="0.0000"
                      value={postGigFormData.budget}
                      onChange={(e) => setPostGigFormData(prev => ({ ...prev, budget: e.target.value }))}
                      className="flex-1"
                    />
                    <Select value={postGigFormData.currency} onValueChange={(value) => setPostGigFormData(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAX">AVAX</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="BTC">BTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="post-budget-type">Budget Type</Label>
                  <Select value={postGigFormData.budgetType} onValueChange={(value) => setPostGigFormData(prev => ({ ...prev, budgetType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="hourly">Hourly Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="post-timeline">Timeline Duration</Label>
                  <Input
                    id="post-timeline"
                    type="number"
                    min="1"
                    placeholder="e.g., 2"
                    value={postGigFormData.timeline}
                    onChange={(e) => setPostGigFormData(prev => ({ ...prev, timeline: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="post-timeline-unit">Timeline Unit</Label>
                  <Select value={postGigFormData.timelineUnit} onValueChange={(value) => setPostGigFormData(prev => ({ ...prev, timelineUnit: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-category">Category</Label>
                <Select value={postGigFormData.category} onValueChange={(value) => setPostGigFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web-development">Web Development</SelectItem>
                    <SelectItem value="blockchain-development">Blockchain Development</SelectItem>
                    <SelectItem value="mobile-development">Mobile Development</SelectItem>
                    <SelectItem value="ui-ux-design">UI/UX Design</SelectItem>
                    <SelectItem value="graphic-design">Graphic Design</SelectItem>
                    <SelectItem value="content-writing">Content Writing</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="ai-ml">AI/ML</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
                <Label htmlFor="post-experience">Experience Level Required</Label>
                <Select value={postGigFormData.experienceLevel} onValueChange={(value) => setPostGigFormData(prev => ({ ...prev, experienceLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-location">Work Location</Label>
                <Select value={postGigFormData.locationType} onValueChange={(value) => setPostGigFormData(prev => ({ ...prev, locationType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {postGigFormData.locationType !== 'remote' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="post-city">City</Label>
                    <Input
                      id="post-city"
                      placeholder="e.g., New York"
                      value={postGigFormData.city}
                      onChange={(e) => setPostGigFormData(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="post-country">Country</Label>
                    <Input
                      id="post-country"
                      placeholder="e.g., United States"
                      value={postGigFormData.country}
                      onChange={(e) => setPostGigFormData(prev => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="post-urgency">Project Urgency</Label>
                <Select value={postGigFormData.urgency} onValueChange={(value) => setPostGigFormData(prev => ({ ...prev, urgency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Flexible timeline</SelectItem>
                    <SelectItem value="medium">Medium - Standard timeline</SelectItem>
                    <SelectItem value="high">High - Urgent delivery needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Additional Requirements</Label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="portfolio-required"
                      checked={postGigFormData.portfolioRequired}
                      onChange={(e) => setPostGigFormData(prev => ({ ...prev, portfolioRequired: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="portfolio-required" className="text-sm font-normal">
                      Portfolio submission required
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="test-required"
                      checked={postGigFormData.testRequired}
                      onChange={(e) => setPostGigFormData(prev => ({ ...prev, testRequired: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="test-required" className="text-sm font-normal">
                      Skills test required
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1"
                  onClick={async () => {
                    // Validate required fields
                    if (!postGigFormData.title || postGigFormData.title.length < 10) {
                      toast({
                        title: "Invalid Title",
                        description: "Job title must be at least 10 characters long.",
                        variant: "destructive",
                      });
                      return;
                    }

                    if (!postGigFormData.description || postGigFormData.description.length < 50) {
                      toast({
                        title: "Invalid Description",
                        description: "Job description must be at least 50 characters long.",
                        variant: "destructive",
                      });
                      return;
                    }

                    if (!postGigFormData.budget || parseFloat(postGigFormData.budget) < 1) {
                      toast({
                        title: "Invalid Budget",
                        description: "Budget amount must be at least 1.",
                        variant: "destructive",
                      });
                      return;
                    }

                    if (!postGigFormData.category) {
                      toast({
                        title: "Missing Category",
                        description: "Please select a job category.",
                        variant: "destructive",
                      });
                      return;
                    }

                    if (!postGigFormData.skills || postGigFormData.skills.trim().length === 0) {
                      toast({
                        title: "Missing Skills",
                        description: "Please specify at least one required skill.",
                        variant: "destructive",
                      });
                      return;
                    }

                    if (!postGigFormData.timeline || parseInt(postGigFormData.timeline) < 1) {
                      toast({
                        title: "Invalid Timeline",
                        description: "Timeline duration must be at least 1.",
                        variant: "destructive",
                      });
                      return;
                    }

                    try {
                      const skillsArray = postGigFormData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
                      
                      if (skillsArray.length > 20) {
                        toast({
                          title: "Too Many Skills",
                          description: "Cannot have more than 20 skills.",
                          variant: "destructive",
                        });
                        return;
                      }

                      const jobData = {
                        title: postGigFormData.title.trim(),
                        description: postGigFormData.description.trim(),
                        category: postGigFormData.category,
                        skills: skillsArray,
                        budget: {
                          type: postGigFormData.budgetType as 'fixed' | 'hourly',
                          amount: parseFloat(postGigFormData.budget),
                          currency: postGigFormData.currency
                        },
                        timeline: {
                          duration: parseInt(postGigFormData.timeline),
                          unit: postGigFormData.timelineUnit as 'hours' | 'days' | 'weeks' | 'months'
                        },
                        requirements: {
                          experienceLevel: postGigFormData.experienceLevel as 'entry' | 'intermediate' | 'expert',
                          portfolioRequired: postGigFormData.portfolioRequired,
                          testRequired: postGigFormData.testRequired
                        },
                        location: {
                          type: postGigFormData.locationType as 'remote' | 'onsite' | 'hybrid',
                          ...(postGigFormData.locationType !== 'remote' && {
                            city: postGigFormData.city.trim() || undefined,
                            country: postGigFormData.country.trim() || undefined
                          })
                        },
                        urgency: postGigFormData.urgency as 'low' | 'medium' | 'high',
                        status: 'active' as const,
                        visibility: 'public' as const
                      };

                      await createJob(jobData);
                      // Success toast is handled in the hook

                      setPostGigFormData({
                        title: '',
                        description: '',
                        budget: '',
                        budgetType: 'fixed',
                        currency: 'AVAX',
                        timeline: '',
                        timelineUnit: 'weeks',
                        skills: '',
                        category: '',
                        experienceLevel: 'intermediate',
                        locationType: 'remote',
                        city: '',
                        country: '',
                        portfolioRequired: false,
                        testRequired: false,
                        urgency: 'medium'
                      });
                      setShowPostGigModal(false);
                    } catch (error) {
                      console.error('Failed to create job:', error);
                    }
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
