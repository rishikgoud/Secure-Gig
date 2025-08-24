import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { getUserData } from '../lib/user-utils';
import { PopulatedProposal } from '@/api/types';
import { useToast } from '@/hooks/use-toast';
import { useProposals } from '@/hooks/useProposals';
import { 
  LayoutDashboard, 
  Search,
  FileText, 
  Shield, 
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  X,
  Calendar,
  DollarSign,
  User,
  AlertCircle,
  Loader2
} from 'lucide-react';

const MyProposals = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const userData = getUserData();
  const { toast } = useToast();

  console.log('🔍 MyProposals: Component mounted with userData:', userData);

  // Use the custom hook for proposals
  const {
    proposals,
    loading,
    error,
    totalCount,
    refetch,
    updateFilters,
    clearError
  } = useProposals(undefined, {
    page: 1,
    limit: 20,
    sortBy: 'submittedAt',
    sortOrder: 'desc'
  });

  console.log('🔍 MyProposals: Hook state - loading:', loading, 'error:', error, 'proposals:', proposals, 'totalCount:', totalCount);

  const navLinks = [
    { href: '/freelancer-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/find-gigs', label: 'Find Gigs', icon: Search },
    { href: '/my-proposals', label: 'My Proposals', icon: FileText },
    { href: '/my-contracts', label: 'My Contracts', icon: Shield },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  // Filter proposals based on search and status
  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.coverLetter?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const activeFiltersCount = [statusFilter !== 'all'].filter(Boolean).length;

  return (
    <DashboardLayout navLinks={navLinks}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Proposals</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track your submitted proposals and their status
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {filteredProposals.length} proposals
            </Badge>
            {totalCount > 0 && (
              <Badge variant="outline" className="text-xs sm:text-sm">
                {totalCount} total
              </Badge>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search proposals by job title or cover letter..."
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
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              {statusFilter !== 'all' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className="text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Desktop Filters - Always visible */}
            <div className="hidden sm:flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              {statusFilter !== 'all' && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStatusFilter('all')}
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
                  <Label htmlFor="mobile-status" className="text-sm font-medium">Status</Label>
                  <select
                    id="mobile-status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="p-4 border-red-200 bg-red-50">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={refetch}>
                  Retry
                </Button>
                <Button variant="ghost" size="sm" onClick={clearError}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="p-4 sm:p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Proposals Grid */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredProposals.map((proposal) => (
              <Card key={proposal._id} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg font-semibold line-clamp-2 leading-tight">
                        <h3 className="text-lg font-semibold mb-2">{proposal.jobId?.title || 'Untitled Job'}</h3>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          className={`text-xs border ${getStatusColor(proposal.status)}`}
                        >
                          <div className="flex items-center gap-1">
                            {getStatusIcon(proposal.status)}
                            <span className="capitalize">{proposal.status}</span>
                          </div>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col gap-3 sm:gap-4">
                  <CardDescription className="text-sm line-clamp-3 flex-1">
                    {proposal.coverLetter || 'No cover letter provided'}
                  </CardDescription>

                  {/* Proposal Details */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium text-foreground">
                        ${proposal.proposedRate?.amount?.toLocaleString() || 'N/A'}
                        {proposal.jobId?.budget?.type === 'hourly' && '/hr'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>
                        Submitted {new Date(proposal.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {proposal.timeline && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span>{proposal.timeline}</span>
                      </div>
                    )}
                  </div>

                  {/* Milestones Preview */}
                  {proposal.deliverables && proposal.deliverables.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium text-foreground">
                        {proposal.deliverables.length} deliverable{proposal.deliverables.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs sm:text-sm flex items-center gap-2"
                    >
                      <Eye className="h-3 w-3" />
                      View Details
                    </Button>
                    {proposal.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProposals.length === 0 && (
          <Card className="p-8 sm:p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold">
                  {proposals.length === 0 ? 'No proposals yet' : 'No matching proposals'}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                  {proposals.length === 0 
                    ? 'Start applying to gigs to see your proposals here.'
                    : 'Try adjusting your search criteria or filters.'
                  }
                </p>
              </div>
              {proposals.length === 0 ? (
                <Button className="text-sm" onClick={() => window.location.href = '/find-gigs'}>
                  Browse Gigs
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
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
    </DashboardLayout>
  );
};

export default MyProposals;
