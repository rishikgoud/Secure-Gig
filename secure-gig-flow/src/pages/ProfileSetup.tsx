import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Briefcase, ArrowRight, Upload, DollarSign, Building, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileSetup = () => {
  const [userRole, setUserRole] = useState<'client' | 'freelancer' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    orgName: '',
    bio: '',
    budgetPreference: '',
    skills: '',
    portfolio: '',
    hourlyRate: '',
    walletAddress: '0x742d...4b2f' // Auto-filled from wallet connection
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Get role from localStorage
    const role = localStorage.getItem('userRole') as 'client' | 'freelancer' | null;
    setUserRole(role);
    
    if (!role) {
      navigate('/role-selection');
    }
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = () => {
    // Save profile data (in real app, this would be saved to DB/Smart Contract)
    localStorage.setItem('userProfile', JSON.stringify(formData));
    
    // Redirect to appropriate dashboard
    if (userRole === 'client') {
      navigate('/client-dashboard');
    } else {
      navigate('/freelancer-dashboard');
    }
  };

  const handleSkipForNow = () => {
    // Create basic profile
    const basicProfile = {
      ...formData,
      name: formData.name || 'Anonymous User'
    };
    localStorage.setItem('userProfile', JSON.stringify(basicProfile));
    
    // Redirect to appropriate dashboard
    if (userRole === 'client') {
      navigate('/client-dashboard');
    } else {
      navigate('/freelancer-dashboard');
    }
  };

  if (!userRole) {
    return <div>Loading...</div>;
  }

  const isClient = userRole === 'client';
  const roleIcon = isClient ? Users : Briefcase;
  const roleColor = isClient ? 'text-primary' : 'text-secondary';
  const roleGradient = isClient ? 'bg-gradient-primary' : 'bg-gradient-secondary';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className={`${roleGradient} text-white px-6 py-3`}>
            Step 3 of 3
          </Badge>
          <div className="flex justify-center">
            <div className={`${roleGradient} p-4 rounded-2xl glow-primary`}>
              {React.createElement(roleIcon, { className: "h-12 w-12 text-white" })}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold">
            Setup Your <span className={`text-gradient-${isClient ? 'primary' : 'secondary'}`}>Profile</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            {isClient 
              ? 'Tell us about your business and project needs'
              : 'Showcase your skills and set your rates'
            }
          </p>
        </div>

        {/* Profile Form */}
        <Card className="card-web3 border-2 border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <User className={`h-6 w-6 ${roleColor}`} />
              <span>{isClient ? 'Client' : 'Freelancer'} Information</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Common Fields */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="text-lg py-6"
              />
            </div>

            {/* Client-specific fields */}
            {isClient && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="orgName"
                      placeholder="Your company or organization"
                      value={formData.orgName}
                      onChange={(e) => handleInputChange('orgName', e.target.value)}
                      className="text-lg py-6 pl-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budgetPreference">Budget Preference</Label>
                  <Select onValueChange={(value) => handleInputChange('budgetPreference', value)}>
                    <SelectTrigger className="text-lg py-6">
                      <SelectValue placeholder="Select your typical project budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-1k">Under $1,000</SelectItem>
                      <SelectItem value="1k-5k">$1,000 - $5,000</SelectItem>
                      <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                      <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                      <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                      <SelectItem value="over-50k">Over $50,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Freelancer-specific fields */}
            {!isClient && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills & Expertise *</Label>
                  <Input
                    id="skills"
                    placeholder="e.g., React, Node.js, UI/UX Design, Marketing"
                    value={formData.skills}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                    className="text-lg py-6"
                  />
                  <p className="text-sm text-muted-foreground">
                    Separate skills with commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio URL</Label>
                  <Input
                    id="portfolio"
                    placeholder="https://your-portfolio.com"
                    value={formData.portfolio}
                    onChange={(e) => handleInputChange('portfolio', e.target.value)}
                    className="text-lg py-6"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="hourlyRate"
                      type="number"
                      placeholder="50"
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      className="text-lg py-6 pl-12"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Bio field for both */}
            <div className="space-y-2">
              <Label htmlFor="bio">
                {isClient ? 'About Your Business' : 'Professional Bio'}
              </Label>
              <Textarea
                id="bio"
                placeholder={isClient 
                  ? "Tell freelancers about your company, industry, and what kind of projects you typically work on..."
                  : "Describe your experience, specializations, and what makes you unique as a freelancer..."
                }
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="min-h-[120px] text-lg"
              />
            </div>

            {/* Wallet Address (auto-filled) */}
            <div className="space-y-2">
              <Label htmlFor="walletAddress">Wallet Address</Label>
              <Input
                id="walletAddress"
                value={formData.walletAddress}
                disabled
                className="text-lg py-6 bg-muted/50 font-mono"
              />
              <p className="text-sm text-muted-foreground">
                Auto-filled from your connected wallet
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                className={`flex-1 text-lg py-6 group ${isClient ? 'btn-primary' : 'btn-secondary'}`}
                onClick={handleSaveProfile}
                disabled={!formData.name || (!isClient && !formData.skills)}
              >
                Save Profile & Continue
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                variant="outline"
                className="flex-1 text-lg py-6 border-2"
                onClick={handleSkipForNow}
              >
                Skip for Now
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                You can always update your profile later from your dashboard
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;
