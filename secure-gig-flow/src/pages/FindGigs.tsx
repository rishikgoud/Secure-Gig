import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { getUserData } from '../lib/user-utils';
import { useToast } from '@/hooks/use-toast';
import { useRealTimeJobs } from '@/hooks/useRealTimeJobs';
import SimpleProposalForm from '@/components/proposals/SimpleProposalForm';
import { apiClient } from '@/api/client';
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
  Filter,
  Briefcase,
  X,
  Calendar,
  Star
} from 'lucide-react';
import { getStoredToken, isAuthenticated } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

interface Gig {
  _id: string;
  title: string;
  description: string;
  budget: {
    type: 'fixed' | 'hourly';
    amount: number;
    currency: string;
  };
  deadline: string;
  skills: string[];
  category: string;
  client: {
    name: string;
    rating?: number;
  };
  createdAt: string;
  status: string;
}

const FindGigs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGig, setSelectedGig] = useState<any>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBudgetRange, setSelectedBudgetRange] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const { jobs, loading, error, connectionStatus, refetch, clearError } = useRealTimeJobs();
  
  const userData = getUserData();
  const userName = userData?.name || 'Freelancer';
  const userAvatar = userData?.avatar || '👨‍💻';
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredGigs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
    job.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (selectedCategory !== 'all' && job.category === selectedCategory) ||
    (selectedBudgetRange !== 'all' && getBudgetRange(job.budget.amount) === selectedBudgetRange)
  );

  const navLinks = [
    { href: '/freelancer-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/find-gigs', label: 'Find Gigs', icon: Search },
    { href: '/my-proposals', label: 'My Proposals', icon: FileText },
    { href: '/my-contracts', label: 'My Contracts', icon: Shield },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleApplyClick = (job: any) => {
    // Check authentication before opening modal
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit proposals",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    // Ensure job has an ID before opening modal
    const jobWithId = {
      ...job,
      _id: job._id || job.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    console.log('Setting selected gig with ID:', jobWithId._id);
    setSelectedGig(jobWithId);
    setSubmitError(null);
    setShowApplyModal(true);
  };

  const handleViewDetailsClick = (job: any) => {
    setSelectedGig(job);
    setShowDetailsModal(true);
  };

  const handleSubmitProposal = async (proposalData: any) => {
    console.log('🔍 DEBUG: Starting proposal submission...');
    
    // Check authentication before submission
    const isAuth = isAuthenticated();
    console.log('🔍 DEBUG: isAuthenticated():', isAuth);
    
    if (!isAuth) {
      console.log('❌ DEBUG: User not authenticated, redirecting to login');
      setSubmitError("Please sign in to submit proposals");
      navigate('/login');
      return;
    }

    try {
      // Debug token retrieval
      const token = getStoredToken();
      console.log('🔍 DEBUG: Retrieved token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
      
      // Check localStorage directly
      const directToken = localStorage.getItem('authToken');
      console.log('🔍 DEBUG: Direct localStorage authToken:', directToken ? `${directToken.substring(0, 20)}...` : 'null');
      
      // Check user data
      const userData = localStorage.getItem('user');
      console.log('🔍 DEBUG: User data exists:', !!userData);
      
      if (token) {
        console.log('🔍 DEBUG: Setting auth token on API client...');
        apiClient.setAuthToken(token);
        console.log('🔍 DEBUG: Auth token set successfully');
      } else {
        console.log('❌ DEBUG: No authentication token found in localStorage');
        throw new Error("No authentication token found");
      }

      // Validate jobId
      const jobId = selectedGig?._id || selectedGig?.id;
      console.log('🔍 DEBUG: Job ID for proposal:', jobId);
      console.log('🔍 DEBUG: Selected job object:', selectedGig);
      
      if (!jobId) {
        throw new Error("Job ID is required for proposal submission");
      }

      // Prepare proposal data with all required fields
      const validatedData = {
        jobId: jobId,
        coverLetter: proposalData.coverLetter,
        proposedRate: proposalData.proposedRate,
        timeline: proposalData.timeline || {
          duration: 1,
          unit: 'weeks'
        },
        experience: proposalData.experience || 'Experienced freelancer ready to deliver quality work.',
        portfolioLinks: proposalData.portfolioLinks || [],
        estimatedDuration: proposalData.estimatedDuration,
        milestones: proposalData.milestones || [],
        attachments: proposalData.attachments || []
      };

      console.log('🔍 DEBUG: Validated proposal data:', validatedData);
      console.log('🔍 DEBUG: Making API call to createProposal...');

      const response = await apiClient.createProposal(validatedData);
      
      console.log('✅ DEBUG: Proposal submitted successfully:', response);
      toast({
        title: "Proposal Submitted Successfully!",
        description: `Your proposal for "${selectedGig?.title}" has been sent to the client`,
      });

      setShowApplyModal(false);
      setSelectedGig(null);
      setSubmitError(null);
      
    } catch (error) {
      console.log('Proposal submission error:', error);
      
      let errorMessage = "Failed to submit proposal";
      
      // Enhanced error handling like Fiverr/Upwork
      if (error instanceof Error) {
        if (error.message.includes('inactive job')) {
          errorMessage = "This job is no longer accepting proposals. Please try applying to other similar jobs.";
        } else if (error.message.includes('authentication') || error.message.includes('Authentication required')) {
          errorMessage = "Please sign in to submit a proposal.";
          navigate('/login');
        } else if (error.message.includes('duplicate') || error.message.includes('already applied')) {
          errorMessage = "You have already submitted a proposal for this job.";
        } else if (error.message.includes('not found')) {
          errorMessage = "This job is no longer available. It may have been removed or completed.";
        } else {
          errorMessage = error.message;
        }
      } else if (typeof error === 'object' && error !== null) {
        const apiError = error as any;
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        } else if (apiError.response?.data?.errors?.length > 0) {
          console.log('Validation errors:', apiError.response.data.errors);
          errorMessage = apiError.response.data.errors[0].message || apiError.response.data.errors[0];
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }
      
      console.error('Final error message:', errorMessage);
      console.error('Full error object:', error);
      setSubmitError(errorMessage);
      
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSubmittingProposal(false);
      console.log('Submission process completed');
    }
  };

  const handleCloseApplyModal = () => {
    setShowApplyModal(false);
    setSelectedGig(null);
    setSubmitError(null);
    setSubmittingProposal(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBudgetRange = (amount: number) => {
    if (amount < 500) return '0-500';
    if (amount < 1000) return '500-1000';
    if (amount < 5000) return '1000-5000';
    return '5000+';
  };

  return (
    <DashboardLayout navLinks={navLinks}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Find Gigs</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Discover opportunities that match your skills
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {filteredGigs.length} gigs available
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search gigs by title, skills, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <div className="flex items-center justify-between sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {(selectedCategory !== 'all' || selectedBudgetRange !== 'all') && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {[selectedCategory !== 'all', selectedBudgetRange !== 'all'].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
              {(selectedCategory !== 'all' || selectedBudgetRange !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedBudgetRange('all');
                  }}
                  className="text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Desktop Filters - Always visible */}
            <div className="hidden sm:flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Categories</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Design">Design</option>
                  <option value="Writing">Writing</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="budget" className="text-sm font-medium">Budget Range</Label>
                <select
                  id="budget"
                  value={selectedBudgetRange}
                  onChange={(e) => setSelectedBudgetRange(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Budgets</option>
                  <option value="0-500">$0 - $500</option>
                  <option value="500-1000">$500 - $1,000</option>
                  <option value="1000-5000">$1,000 - $5,000</option>
                  <option value="5000+">$5,000+</option>
                </select>
              </div>
              {(selectedCategory !== 'all' || selectedBudgetRange !== 'all') && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedBudgetRange('all');
                    }}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Filters - Collapsible */}
            {showMobileFilters && (
              <div className="sm:hidden space-y-4 border-t pt-4">
                <div>
                  <Label htmlFor="mobile-category" className="text-sm font-medium">Category</Label>
                  <select
                    id="mobile-category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">All Categories</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Design">Design</option>
                    <option value="Writing">Writing</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="mobile-budget" className="text-sm font-medium">Budget Range</Label>
                  <select
                    id="mobile-budget"
                    value={selectedBudgetRange}
                    onChange={(e) => setSelectedBudgetRange(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">All Budgets</option>
                    <option value="0-500">$0 - $500</option>
                    <option value="500-1000">$500 - $1,000</option>
                    <option value="1000-5000">$1,000 - $5,000</option>
                    <option value="5000+">$5,000+</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Gigs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredGigs.map((gig) => (
            <Card key={gig._id} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg font-semibold line-clamp-2 leading-tight">
                      {gig.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {gig.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {gig.budget.type === 'fixed' ? 'Fixed Price' : 'Hourly'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col gap-3 sm:gap-4">
                <CardDescription className="text-sm line-clamp-3 flex-1">
                  {gig.description}
                </CardDescription>

                {/* Skills */}
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {gig.skills.slice(0, 4).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                      {skill}
                    </Badge>
                  ))}
                  {gig.skills.length > 4 && (
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      +{gig.skills.length - 4} more
                    </Badge>
                  )}
                </div>

                {/* Gig Details */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium text-foreground">
                      ${gig.budget.amount.toLocaleString()}
                      {gig.budget.type === 'hourly' && '/hr'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>Due {new Date(gig.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span>{gig.client.name}</span>
                    {gig.client.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{gig.client.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetailsClick(gig)}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApplyClick(gig)}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredGigs.length === 0 && (
          <Card className="p-8 sm:p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold">No gigs found</h3>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                  Try adjusting your search criteria or check back later for new opportunities.
                </p>
              </div>
              {(searchTerm || selectedCategory !== 'all' || selectedBudgetRange !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedBudgetRange('all');
                  }}
                  className="text-sm"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Gig Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedGig && (
            <div className="space-y-4 sm:space-y-6">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-bold leading-tight">
                  {selectedGig.title}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="outline">{selectedGig.category}</Badge>
                  <Badge variant="secondary">
                    {selectedGig.budget.type === 'fixed' ? 'Fixed Price' : 'Hourly'}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm sm:text-base mb-2">Description</h4>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {selectedGig.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Budget</h4>
                    <p className="text-lg font-bold text-green-600">
                      ${selectedGig.budget.amount.toLocaleString()}
                      {selectedGig.budget.type === 'hourly' && '/hr'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Deadline</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedGig.deadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedGig.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Client Information</h4>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{selectedGig.client.name}</p>
                      {selectedGig.client.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">
                            {selectedGig.client.rating.toFixed(1)} rating
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleApplyClick(selectedGig);
                    }}
                    className="flex-1"
                  >
                    Apply for this Gig
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Application Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Apply for Gig</DialogTitle>
            <DialogDescription className="text-sm">
              Submit your proposal for "{selectedGig?.title}"
            </DialogDescription>
          </DialogHeader>
          
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{submitError}</AlertDescription>
            </Alert>
          )}
          
          <SimpleProposalForm
            job={selectedGig}
            onSubmit={handleSubmitProposal}
            onCancel={handleCloseApplyModal}
            isSubmitting={submittingProposal}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default FindGigs;
