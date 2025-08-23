import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  MapPin, 
  Star, 
  Eye, 
  MessageCircle,
  Bookmark,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import {
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Shield, 
  Settings,
} from 'lucide-react';

const Gigs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');

  const navLinks = [
    { href: '/client-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/gigs', label: 'My Gigs', icon: Briefcase },
    { href: '/proposals', label: 'Proposals', icon: FileText },
    { href: '/contracts', label: 'Contracts', icon: Shield },
    { href: '/chat', label: 'Messages', icon: MessageSquare },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const gigs = [
    {
      id: 1,
      title: 'Build a DeFi Trading Platform',
      description: 'Looking for an experienced blockchain developer to create a comprehensive DeFi trading platform with smart contracts, yield farming, and staking features.',
      client: 'CryptoVentures LLC',
      clientRating: 4.9,
      budget: '$5,000 - $10,000',
      duration: '2-3 months',
      category: 'Blockchain Development',
      skills: ['Solidity', 'React', 'Web3.js', 'DeFi'],
      proposals: 12,
      posted: '2 days ago',
      location: 'Remote',
      verified: true,
      featured: true
    },
    {
      id: 2,
      title: 'NFT Marketplace Frontend Development',
      description: 'Need a skilled frontend developer to build a modern, responsive NFT marketplace with wallet integration and real-time bidding functionality.',
      client: 'ArtBlock Studios',
      clientRating: 4.7,
      budget: '$3,000 - $6,000',
      duration: '1-2 months',
      category: 'Frontend Development',
      skills: ['React', 'TypeScript', 'Web3', 'UI/UX'],
      proposals: 8,
      posted: '1 day ago',
      location: 'Remote',
      verified: true,
      featured: false
    },
    {
      id: 3,
      title: 'Smart Contract Audit & Security Review',
      description: 'Seeking a blockchain security expert to audit our DeFi protocol smart contracts and provide comprehensive security recommendations.',
      client: 'SecureChain Protocol',
      clientRating: 5.0,
      budget: '$2,000 - $4,000',
      duration: '2-4 weeks',
      category: 'Security & Audit',
      skills: ['Solidity', 'Security Audit', 'DeFi', 'Testing'],
      proposals: 15,
      posted: '3 days ago',
      location: 'Remote',
      verified: true,
      featured: true
    },
    {
      id: 4,
      title: 'Mobile Wallet App Development',
      description: 'Create a secure mobile wallet application for iOS and Android with multi-chain support and DeFi integration.',
      client: 'WalletTech Inc',
      clientRating: 4.8,
      budget: '$8,000 - $15,000',
      duration: '3-4 months',
      category: 'Mobile Development',
      skills: ['React Native', 'Blockchain', 'Mobile Security', 'UI/UX'],
      proposals: 6,
      posted: '5 days ago',
      location: 'Remote',
      verified: true,
      featured: false
    },
    {
      id: 5,
      title: 'DAO Governance Platform',
      description: 'Build a comprehensive DAO governance platform with voting mechanisms, proposal systems, and treasury management.',
      client: 'DecentralizedDAO',
      clientRating: 4.6,
      budget: '$4,000 - $8,000',
      duration: '2-3 months',
      category: 'Blockchain Development',
      skills: ['Solidity', 'Governance', 'React', 'Web3'],
      proposals: 10,
      posted: '1 week ago',
      location: 'Remote',
      verified: false,
      featured: false
    }
  ];

  const categories = [
    'All Categories',
    'Blockchain Development',
    'Frontend Development',
    'Backend Development',
    'Mobile Development',
    'Security & Audit',
    'UI/UX Design',
    'Smart Contracts',
    'DeFi Development'
  ];

  const filteredGigs = gigs.filter(gig => {
    const matchesSearch = gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gig.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gig.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || gig.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout navLinks={navLinks} userName="CryptoKing.eth" userRole="Client" walletAddress="0x1234567890abcdef1234567890abcdef12345678">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-gradient-primary mb-4">
            Browse Gigs
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover exciting Web3 and blockchain projects from verified clients
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search gigs by title, description, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.slice(1).map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedBudget} onValueChange={setSelectedBudget}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Budget Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Budgets</SelectItem>
                <SelectItem value="under-1k">Under $1,000</SelectItem>
                <SelectItem value="1k-5k">$1,000 - $5,000</SelectItem>
                <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                <SelectItem value="over-10k">Over $10,000</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Durations</SelectItem>
                <SelectItem value="under-1month">Under 1 month</SelectItem>
                <SelectItem value="1-3months">1-3 months</SelectItem>
                <SelectItem value="3-6months">3-6 months</SelectItem>
                <SelectItem value="over-6months">Over 6 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredGigs.length} of {gigs.length} gigs
          </p>
        </div>

        {/* Gigs Grid */}
        <div className="grid gap-6">
          {filteredGigs.map((gig) => (
            <Card key={gig.id} className="hover:shadow-lg transition-shadow border-border/50">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {gig.featured && (
                        <Badge className="bg-gradient-primary text-white">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {gig.verified && (
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          Verified Client
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl hover:text-primary transition-colors cursor-pointer">
                      {gig.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {gig.description}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Skills */}
                  <div className="flex flex-wrap gap-2">
                    {gig.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {/* Gig Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{gig.budget}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{gig.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{gig.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{gig.posted}</span>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {gig.client.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{gig.client}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-muted-foreground">{gig.clientRating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{gig.proposals} proposals</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm" className="bg-gradient-primary text-white">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Send Proposal
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg">
            Load More Gigs
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Gigs;
