import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  DollarSign, 
  Eye, 
  MessageCircle,
  Users,
  CheckCircle,
  Clock
} from 'lucide-react';

const Freelancers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');

  // Mock freelancer data
  const freelancers = [
    {
      id: '1',
      name: 'Sarah Chen',
      title: 'Full-Stack Developer',
      avatar: '',
      rating: 4.9,
      reviewCount: 127,
      hourlyRate: 85,
      location: 'San Francisco, CA',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
      bio: 'Experienced full-stack developer with 6+ years building scalable web applications. Specialized in React, Node.js, and cloud architecture.',
      completedJobs: 89,
      responseTime: '2 hours',
      availability: 'Available',
      portfolio: ['E-commerce Platform', 'SaaS Dashboard', 'Mobile App Backend'],
      verified: true
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      title: 'UI/UX Designer',
      avatar: '',
      rating: 4.8,
      reviewCount: 94,
      hourlyRate: 75,
      location: 'New York, NY',
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      bio: 'Creative UI/UX designer focused on creating intuitive and beautiful user experiences. 5+ years of experience with startups and enterprises.',
      completedJobs: 67,
      responseTime: '1 hour',
      availability: 'Available',
      portfolio: ['Mobile Banking App', 'E-learning Platform', 'Healthcare Dashboard'],
      verified: true
    },
    {
      id: '3',
      name: 'Elena Rodriguez',
      title: 'Blockchain Developer',
      avatar: '',
      rating: 5.0,
      reviewCount: 45,
      hourlyRate: 120,
      location: 'Remote',
      skills: ['Solidity', 'Web3.js', 'Smart Contracts', 'DeFi'],
      bio: 'Blockchain specialist with deep expertise in smart contract development and DeFi protocols. Former Ethereum Foundation contributor.',
      completedJobs: 34,
      responseTime: '4 hours',
      availability: 'Busy',
      portfolio: ['DEX Protocol', 'NFT Marketplace', 'Yield Farming Platform'],
      verified: true
    },
    {
      id: '4',
      name: 'David Kim',
      title: 'Mobile App Developer',
      avatar: '',
      rating: 4.7,
      reviewCount: 156,
      hourlyRate: 70,
      location: 'Seoul, South Korea',
      skills: ['React Native', 'Flutter', 'iOS', 'Android'],
      bio: 'Mobile development expert with 7+ years creating cross-platform applications. Published 20+ apps on App Store and Google Play.',
      completedJobs: 112,
      responseTime: '3 hours',
      availability: 'Available',
      portfolio: ['Fitness Tracking App', 'Food Delivery App', 'Social Media Platform'],
      verified: true
    },
    {
      id: '5',
      name: 'Priya Patel',
      title: 'Data Scientist',
      avatar: '',
      rating: 4.9,
      reviewCount: 78,
      hourlyRate: 95,
      location: 'London, UK',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis'],
      bio: 'Data scientist with PhD in Computer Science. Specialized in ML model development and data pipeline architecture.',
      completedJobs: 56,
      responseTime: '2 hours',
      availability: 'Available',
      portfolio: ['Recommendation System', 'Fraud Detection Model', 'Predictive Analytics'],
      verified: true
    },
    {
      id: '6',
      name: 'Alex Thompson',
      title: 'Digital Marketing Specialist',
      avatar: '',
      rating: 4.6,
      reviewCount: 203,
      hourlyRate: 60,
      location: 'Toronto, Canada',
      skills: ['SEO', 'Google Ads', 'Social Media', 'Content Strategy'],
      bio: 'Digital marketing expert with 8+ years helping businesses grow online. Managed $2M+ in ad spend with proven ROI.',
      completedJobs: 145,
      responseTime: '1 hour',
      availability: 'Available',
      portfolio: ['E-commerce Growth', 'SaaS Lead Generation', 'Brand Awareness Campaign'],
      verified: false
    }
  ];

  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesSearch = freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         freelancer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         freelancer.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSkill = !skillFilter || freelancer.skills.some(skill => 
      skill.toLowerCase().includes(skillFilter.toLowerCase())
    );
    
    const matchesLocation = !locationFilter || freelancer.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesRating = !ratingFilter || freelancer.rating >= parseFloat(ratingFilter);
    
    const matchesPrice = !priceFilter || 
      (priceFilter === 'under-50' && freelancer.hourlyRate < 50) ||
      (priceFilter === '50-100' && freelancer.hourlyRate >= 50 && freelancer.hourlyRate <= 100) ||
      (priceFilter === 'over-100' && freelancer.hourlyRate > 100);

    return matchesSearch && matchesSkill && matchesLocation && matchesRating && matchesPrice;
  });

  const handleViewProfile = (freelancerId: string) => {
    window.location.href = `/freelancer-profile/${freelancerId}`;
  };

  const handleInviteToGig = (freelancerId: string) => {
    window.location.href = `/invite-freelancer/${freelancerId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="max-w-7xl mx-auto space-y-8 py-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="bg-gradient-secondary text-white px-6 py-3">
            <Users className="h-4 w-4 mr-2" />
            Freelancer Directory
          </Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold">
            Find the Perfect <span className="text-gradient-primary">Talent</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse verified freelancers and find the right expertise for your project
          </p>
        </div>

        {/* Filters */}
        <Card className="card-web3 border-2 border-border">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search freelancers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Skill Filter */}
              <Select onValueChange={setSkillFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Skills" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Skills</SelectItem>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="node">Node.js</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="blockchain">Blockchain</SelectItem>
                </SelectContent>
              </Select>

              {/* Rating Filter */}
              <Select onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Ratings</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0">4.0+ Stars</SelectItem>
                  <SelectItem value="3.5">3.5+ Stars</SelectItem>
                </SelectContent>
              </Select>

              {/* Price Filter */}
              <Select onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Prices</SelectItem>
                  <SelectItem value="under-50">Under $50/hr</SelectItem>
                  <SelectItem value="50-100">$50-100/hr</SelectItem>
                  <SelectItem value="over-100">Over $100/hr</SelectItem>
                </SelectContent>
              </Select>

              {/* Location Filter */}
              <Input
                placeholder="Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {filteredFreelancers.length} of {freelancers.length} freelancers
          </p>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sort by: Relevance</span>
          </div>
        </div>

        {/* Freelancer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFreelancers.map((freelancer) => (
            <Card key={freelancer.id} className="card-web3 hover:scale-105 transition-all duration-300 hover:shadow-glow-primary border-2 border-border hover:border-primary/30">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={freelancer.avatar} />
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {freelancer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold">{freelancer.name}</h3>
                        {freelancer.verified && (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{freelancer.title}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={freelancer.availability === 'Available' ? 'default' : 'secondary'}
                    className={freelancer.availability === 'Available' ? 'bg-green-500/10 text-green-400 border-green-400/30' : ''}
                  >
                    {freelancer.availability}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Rating & Location */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{freelancer.rating}</span>
                    <span className="text-muted-foreground">({freelancer.reviewCount})</span>
                  </div>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{freelancer.location}</span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {freelancer.bio}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1">
                  {freelancer.skills.slice(0, 4).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {freelancer.skills.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{freelancer.skills.length - 4}
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-semibold text-primary">{freelancer.completedJobs}</div>
                    <div className="text-muted-foreground">Jobs</div>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary">${freelancer.hourlyRate}/hr</div>
                    <div className="text-muted-foreground">Rate</div>
                  </div>
                  <div>
                    <div className="font-semibold text-accent">{freelancer.responseTime}</div>
                    <div className="text-muted-foreground">Response</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 group border-2 hover:border-primary/50"
                    onClick={() => handleViewProfile(freelancer.id)}
                  >
                    <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    View Profile
                  </Button>
                  <Button
                    className="flex-1 btn-primary group"
                    onClick={() => handleInviteToGig(freelancer.id)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Invite to Gig
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {filteredFreelancers.length > 0 && (
          <div className="text-center pt-8">
            <Button variant="outline" className="text-lg px-8 py-4 border-2">
              Load More Freelancers
            </Button>
          </div>
        )}

        {/* No Results */}
        {filteredFreelancers.length === 0 && (
          <div className="text-center py-16">
            <Users className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No freelancers found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search terms
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSkillFilter('');
              setLocationFilter('');
              setRatingFilter('');
              setPriceFilter('');
            }}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Freelancers;
