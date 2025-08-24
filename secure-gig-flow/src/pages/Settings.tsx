import React, { useState } from 'react';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Shield, 
  Settings as SettingsIcon,
  User,
  Bell,
  Lock,
  Palette,
  Globe,
  Save,
  Upload,
  Camera,
  Edit,
  Trash2,
  Search
} from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  
  // Determine user role and dashboard home path dynamically
  const userRole = window.location.pathname.includes('client') ? 'Client' : 'Freelancer';
  const dashboardHome = userRole === 'Client' ? '/client-dashboard' : '/freelancer-dashboard';

  // Load user data from localStorage
  const loadUserData = () => {
    const clientData = localStorage.getItem('clientData');
    const freelancerData = localStorage.getItem('freelancerData');
    
    if (userRole === 'Client' && clientData) {
      const data = JSON.parse(clientData);
      return {
        displayName: data.name || 'CryptoKing.eth',
        bio: data.bio || 'Experienced blockchain enthusiast and project manager.',
        location: data.location || 'San Francisco, CA',
        website: data.website || '',
        avatar: data.avatar || '👑',
        email: data.email || 'cryptoking@example.com',
        phone: data.phone || '+1 (555) 123-4567',
        timezone: data.timezone || 'America/Los_Angeles',
        language: data.language || 'en'
      };
    } else if (userRole === 'Freelancer' && freelancerData) {
      const data = JSON.parse(freelancerData);
      return {
        displayName: data.name || 'Alex Chen',
        bio: data.bio || 'Full-stack developer specializing in React and Node.js',
        location: data.location || 'New York, NY',
        website: data.website || '',
        avatar: data.avatar || '👨‍💻',
        email: data.email || 'alex@example.com',
        phone: data.phone || '+1 (555) 987-6543',
        timezone: data.timezone || 'America/New_York',
        language: data.language || 'en',
        hourlyRate: data.hourlyRate || 75,
        skills: data.skills || ['React', 'Node.js', 'TypeScript', 'MongoDB']
      };
    }
    
    return {
      displayName: 'User',
      bio: '',
      location: '',
      website: '',
      avatar: '👤',
      email: '',
      phone: '',
      timezone: 'UTC',
      language: 'en',
      hourlyRate: userRole === 'Freelancer' ? 50 : undefined,
      skills: userRole === 'Freelancer' ? [] : undefined
    };
  };

  const [formData, setFormData] = useState(loadUserData());
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    proposalUpdates: true,
    messageNotifications: true,
    marketingEmails: false
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowDirectMessages: true
  });

  const navLinks = userRole === 'Client' 
    ? [
        { href: dashboardHome, label: 'Dashboard', icon: LayoutDashboard },
        { href: '/my-gigs', label: 'My Gigs', icon: Briefcase },
        { href: '/proposals', label: 'Proposals', icon: FileText },
        { href: '/contracts', label: 'Contracts', icon: Shield },
        { href: '/settings', label: 'Settings', icon: SettingsIcon },
      ]
    : [
        { href: dashboardHome, label: 'Dashboard', icon: LayoutDashboard },
        { href: '/find-gigs', label: 'Find Gigs', icon: Search },
        { href: '/my-proposals', label: 'My Proposals', icon: FileText },
        { href: '/my-contracts', label: 'My Contracts', icon: Shield },
        { href: '/settings', label: 'Settings', icon: SettingsIcon },
      ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handlePrivacyChange = (field: string, value: any) => {
    setPrivacy(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    const storageKey = userRole === 'Client' ? 'clientData' : 'freelancerData';
    const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const updatedData = { ...existingData, ...formData };
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
    });
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('userNotifications', JSON.stringify(notifications));
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleSavePrivacy = () => {
    localStorage.setItem('userPrivacy', JSON.stringify(privacy));
    toast({
      title: "Privacy Settings Updated",
      description: "Your privacy settings have been saved.",
    });
  };

  return (
    <DashboardLayout navLinks={navLinks}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your account preferences and settings
            </p>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-0 h-auto sm:h-10 p-1">
            <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-0">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-0">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-0">
              <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-0">
              <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 bg-primary/10 rounded-full flex items-center justify-center text-2xl sm:text-3xl">
                      {formData.avatar}
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">Change Avatar</span>
                      </Button>
                      <p className="text-xs text-muted-foreground">JPG, PNG or GIF (max. 2MB)</p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-medium">Display Name</Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  {userRole === 'Freelancer' && (
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate" className="text-sm font-medium">Hourly Rate ($)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => handleInputChange('hourlyRate', parseInt(e.target.value))}
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="text-sm resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {userRole === 'Freelancer' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills?.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                          <button
                            onClick={() => {
                              const newSkills = formData.skills?.filter((_: any, i: number) => i !== index);
                              handleInputChange('skills', newSkills);
                            }}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Add a skill and press Enter"
                      className="text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const value = (e.target as HTMLInputElement).value.trim();
                          if (value && !formData.skills?.includes(value)) {
                            handleInputChange('skills', [...(formData.skills || []), value]);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button onClick={handleSaveProfile} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Profile
                  </Button>
                  <Button variant="outline">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  {Object.entries({
                    emailNotifications: 'Email Notifications',
                    pushNotifications: 'Push Notifications',
                    proposalUpdates: 'Proposal Updates',
                    messageNotifications: 'Message Notifications',
                    marketingEmails: 'Marketing Emails'
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">{label}</Label>
                        <p className="text-xs text-muted-foreground">
                          {key === 'emailNotifications' && 'Receive email notifications for important updates'}
                          {key === 'pushNotifications' && 'Get push notifications on your device'}
                          {key === 'proposalUpdates' && 'Notifications when proposals are accepted or rejected'}
                          {key === 'messageNotifications' && 'Notifications for new messages'}
                          {key === 'marketingEmails' && 'Receive marketing emails and newsletters'}
                        </p>
                      </div>
                      <Switch
                        checked={notifications[key as keyof typeof notifications]}
                        onCheckedChange={(checked) => handleNotificationChange(key, checked)}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button onClick={handleSaveNotifications} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Profile Visibility</Label>
                    <Select value={privacy.profileVisibility} onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="contacts">Contacts Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {Object.entries({
                    showEmail: 'Show Email Address',
                    showPhone: 'Show Phone Number',
                    allowDirectMessages: 'Allow Direct Messages'
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">{label}</Label>
                        <p className="text-xs text-muted-foreground">
                          {key === 'showEmail' && 'Display your email address on your profile'}
                          {key === 'showPhone' && 'Display your phone number on your profile'}
                          {key === 'allowDirectMessages' && 'Allow other users to send you direct messages'}
                        </p>
                      </div>
                      <Switch
                        checked={privacy[key as keyof typeof privacy] as boolean}
                        onCheckedChange={(checked) => handlePrivacyChange(key, checked)}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button onClick={handleSavePrivacy} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Privacy Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  App Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Language</Label>
                    <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Timezone</Label>
                    <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button onClick={handleSaveProfile} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
