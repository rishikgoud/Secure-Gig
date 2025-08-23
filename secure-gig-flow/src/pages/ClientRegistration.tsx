import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Building, 
  DollarSign,
  Save,
  ArrowLeft
} from 'lucide-react';

const ClientRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '🤴',
    accountType: 'individual',
    company: '',
    industry: '',
    budgetPreference: ''
  });

  const avatarOptions = ['🤴', '👑', '🚀', '💎', '🔥', '⚡', '🌟', '🎯', '🛡️', '🎪', '🎨', '🎭'];

  const industries = [
    'DeFi & Finance',
    'NFT & Gaming',
    'Web3 Infrastructure',
    'DAO & Governance',
    'Metaverse & VR',
    'Blockchain Analytics',
    'Smart Contracts',
    'Other'
  ];

  const budgetRanges = [
    '1-5 AVAX',
    '5-10 AVAX',
    '10-25 AVAX',
    '25-50 AVAX',
    '50-100 AVAX',
    '100+ AVAX'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.bio) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Save user data to localStorage
    const userData = {
      ...formData,
      role: 'client',
      registeredAt: new Date().toISOString()
    };
    
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userRole', 'client');
    localStorage.setItem('isRegistered', 'true');

    toast({
      title: "Registration Complete!",
      description: "Welcome to SecureGigFlow. Redirecting to your dashboard...",
    });

    setTimeout(() => {
      navigate('/client-dashboard');
    }, 1500);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/role-selection')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Role Selection
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Registration</h1>
            <p className="text-gray-600">Set up your client profile to start hiring talent</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Complete Your Profile
            </CardTitle>
            <CardDescription>
              This information will be visible to freelancers when you post projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Selection */}
              <div className="space-y-3">
                <Label>Choose Your Avatar</Label>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{formData.avatar}</div>
                  <div className="grid grid-cols-6 gap-2">
                    {avatarOptions.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => handleInputChange('avatar', avatar)}
                        className={`text-2xl p-2 rounded-lg border-2 hover:bg-gray-100 transition-colors ${
                          formData.avatar === avatar ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Short Bio *</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell freelancers about yourself and what you're looking for..."
                  required
                />
              </div>

              {/* Account Type */}
              <div className="space-y-3">
                <Label>Account Type</Label>
                <RadioGroup
                  value={formData.accountType}
                  onValueChange={(value) => handleInputChange('accountType', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual">Individual</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="company" id="company" />
                    <Label htmlFor="company">Company</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Company Name (if company selected) */}
              {formData.accountType === 'company' && (
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Enter your company name"
                  />
                </div>
              )}

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Budget Preference */}
              <div className="space-y-2">
                <Label htmlFor="budgetPreference">Typical Project Budget</Label>
                <Select value={formData.budgetPreference} onValueChange={(value) => handleInputChange('budgetPreference', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your typical budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                <Save className="mr-2 h-4 w-4" />
                Complete Registration
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientRegistration;
