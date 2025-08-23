import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Code, 
  Star,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';

const FreelancerRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '🚀',
    skills: [] as string[],
    experienceLevel: '',
    portfolioLinks: [] as string[],
    availability: true,
    hourlyRate: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newPortfolioLink, setNewPortfolioLink] = useState('');

  const avatarOptions = ['🚀', '💎', '🔥', '⚡', '🌟', '🎯', '🛡️', '🎪', '🎨', '🎭', '🤴', '👑'];

  const experienceLevels = [
    'Entry Level (0-1 years)',
    'Intermediate (2-4 years)',
    'Expert (5-7 years)',
    'Senior (8+ years)'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.bio || formData.skills.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and add at least one skill.",
        variant: "destructive"
      });
      return;
    }

    // Save user data to localStorage
    const userData = {
      ...formData,
      role: 'freelancer',
      registeredAt: new Date().toISOString()
    };
    
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userRole', 'freelancer');
    localStorage.setItem('isRegistered', 'true');

    toast({
      title: "Registration Complete!",
      description: "Welcome to SecureGigFlow. Redirecting to your dashboard...",
    });

    setTimeout(() => {
      navigate('/freelancer-dashboard');
    }, 1500);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addPortfolioLink = () => {
    if (newPortfolioLink.trim() && !formData.portfolioLinks.includes(newPortfolioLink.trim())) {
      setFormData(prev => ({
        ...prev,
        portfolioLinks: [...prev.portfolioLinks, newPortfolioLink.trim()]
      }));
      setNewPortfolioLink('');
    }
  };

  const removePortfolioLink = (linkToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks.filter(link => link !== linkToRemove)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Freelancer Registration</h1>
            <p className="text-gray-600">Set up your freelancer profile to start finding projects</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Complete Your Profile
            </CardTitle>
            <CardDescription>
              This information will be visible to clients when you apply for projects
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
                          formData.avatar === avatar ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
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
                <Label htmlFor="bio">Professional Bio *</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Describe your experience, expertise, and what makes you unique..."
                  required
                />
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <Label>Skills *</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill (e.g., React, Solidity, Web3)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select value={formData.experienceLevel} onValueChange={(value) => handleInputChange('experienceLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Hourly Rate */}
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (AVAX)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.001"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  placeholder="0.050"
                />
              </div>

              {/* Portfolio Links */}
              <div className="space-y-3">
                <Label>Portfolio Links</Label>
                <div className="space-y-2 mb-3">
                  {formData.portfolioLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                      <span className="flex-1 text-sm truncate">{link}</span>
                      <button
                        type="button"
                        onClick={() => removePortfolioLink(link)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add portfolio link (e.g., GitHub, personal website)"
                    value={newPortfolioLink}
                    onChange={(e) => setNewPortfolioLink(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPortfolioLink())}
                  />
                  <Button type="button" onClick={addPortfolioLink} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="availability">Available for Work</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle this to show clients you're accepting new projects
                  </p>
                </div>
                <Switch
                  id="availability"
                  checked={formData.availability}
                  onCheckedChange={(checked) => handleInputChange('availability', checked)}
                />
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
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

export default FreelancerRegistration;
