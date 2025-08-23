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
  Trash2
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
        skills: data.skills || [],
        hourlyRate: '0.00', // Clients don't have hourly rates
        avatar: data.avatar || '🤴',
        companyName: data.companyName || '',
        industry: data.industry || '',
        accountType: data.accountType || 'individual'
      };
    } else if (userRole === 'Freelancer' && freelancerData) {
      const data = JSON.parse(freelancerData);
      return {
        displayName: data.name || 'CryptoKing.eth',
        bio: data.bio || 'Experienced blockchain developer and DeFi enthusiast.',
        location: data.location || 'San Francisco, CA',
        website: data.website || '',
        skills: data.skills || ['Solidity', 'React', 'Web3.js'],
        hourlyRate: data.hourlyRate || '0.05',
        avatar: data.avatar || '🤴',
        experienceLevel: data.experienceLevel || 'intermediate',
        portfolioLinks: data.portfolioLinks || []
      };
    }
    
    // Default fallback
    return {
      displayName: 'CryptoKing.eth',
      bio: userRole === 'Client' 
        ? 'Experienced blockchain enthusiast and project manager.' 
        : 'Experienced blockchain developer and DeFi enthusiast.',
      location: 'San Francisco, CA',
      website: '',
      skills: userRole === 'Client' ? [] : ['Solidity', 'React', 'Web3.js'],
      hourlyRate: userRole === 'Client' ? '0.00' : '0.05',
      avatar: '🤴'
    };
  };

  // Profile state with proper typing
  const [profile, setProfile] = useState<any>(loadUserData());

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailProposals: true,
    emailMessages: true,
    emailMilestones: true,
    pushProposals: false,
    pushMessages: true,
    pushMilestones: true
  });

  // Security settings
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '24h',
    walletAutoLock: true
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: 'system',
    language: 'en',
    currency: 'AVAX'
  });

  const [newSkill, setNewSkill] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const navLinks = [
    { href: dashboardHome, label: 'Dashboard', icon: LayoutDashboard },
    { href: '/my-gigs', label: 'My Gigs', icon: Briefcase },
    { href: '/proposals', label: 'Proposals', icon: FileText },
    { href: '/contracts', label: 'Contracts', icon: Shield },
    { href: '/chat', label: 'Messages', icon: MessageSquare },
    { href: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const avatarOptions = ['🤴', '👑', '🚀', '💎', '🔥', '⚡', '🌟', '🎯', '🛡️', '🎪', '🎨', '🎭'];

  const handleProfileUpdate = () => {
    // Save role-specific data to localStorage
    if (userRole === 'Client') {
      const clientData = {
        name: profile.displayName,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        avatar: profile.avatar,
        companyName: profile.companyName || '',
        industry: profile.industry || '',
        accountType: profile.accountType || 'individual'
      };
      localStorage.setItem('clientData', JSON.stringify(clientData));
    } else {
      const freelancerData = {
        name: profile.displayName,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        skills: profile.skills,
        hourlyRate: profile.hourlyRate,
        avatar: profile.avatar,
        experienceLevel: profile.experienceLevel || 'intermediate',
        portfolioLinks: profile.portfolioLinks || []
      };
      localStorage.setItem('freelancerData', JSON.stringify(freelancerData));
    }

    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleNotificationUpdate = () => {
    toast({
      title: "Notifications Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleSecurityUpdate = () => {
    toast({
      title: "Security Settings Updated",
      description: "Your security preferences have been saved.",
    });
  };

  const handleAppearanceUpdate = () => {
    toast({
      title: "Appearance Updated",
      description: "Your appearance preferences have been saved.",
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  return (
    <DashboardLayout navLinks={navLinks} userName={profile.displayName} userRole={userRole} userAvatar={profile.avatar}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and settings</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Selection */}
                <div className="space-y-3">
                  <Label>Avatar</Label>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{profile.avatar}</div>
                    <div className="grid grid-cols-6 gap-2">
                      {avatarOptions.map((avatar) => (
                        <button
                          key={avatar}
                          onClick={() => setProfile(prev => ({ ...prev, avatar }))}
                          className={`text-2xl p-2 rounded-lg border-2 hover:bg-gray-100 transition-colors ${
                            profile.avatar === avatar ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profile.displayName}
                      onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell others about yourself..."
                  />
                </div>

                {/* Client-specific fields */}
                {userRole === 'Client' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountType">Account Type</Label>
                        <Select 
                          value={profile.accountType || 'individual'} 
                          onValueChange={(value) => setProfile((prev: any) => ({ ...prev, accountType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {profile.accountType === 'company' && (
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input
                            id="companyName"
                            value={profile.companyName || ''}
                            onChange={(e) => setProfile((prev: any) => ({ ...prev, companyName: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>
                    {profile.accountType === 'company' && (
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Select 
                          value={profile.industry || ''} 
                          onValueChange={(value) => setProfile((prev: any) => ({ ...prev, industry: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}

                {/* Freelancer-specific fields */}
                {userRole === 'Freelancer' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="experienceLevel">Experience Level</Label>
                        <Select 
                          value={profile.experienceLevel || 'intermediate'} 
                          onValueChange={(value) => setProfile((prev: any) => ({ ...prev, experienceLevel: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate">Hourly Rate (AVAX)</Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          step="0.0001"
                          value={profile.hourlyRate}
                          onChange={(e) => setProfile((prev: any) => ({ ...prev, hourlyRate: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Skills section - only for freelancers */}
                    <div className="space-y-2">
                      <Label>Skills</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {profile.skills?.map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                            {skill}
                            <button
                              onClick={() => {
                                const updatedSkills = profile.skills.filter((s: string) => s !== skill);
                                setProfile((prev: any) => ({ ...prev, skills: updatedSkills }));
                              }}
                              className="ml-1 hover:text-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        />
                        <Button onClick={addSkill} variant="outline">Add</Button>
                      </div>
                    </div>
                  </>
                )}


                <Button onClick={handleProfileUpdate} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Email Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailProposals">New Proposals</Label>
                      <Switch
                        id="emailProposals"
                        checked={notifications.emailProposals}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailProposals: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailMessages">New Messages</Label>
                      <Switch
                        id="emailMessages"
                        checked={notifications.emailMessages}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailMessages: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailMilestones">Milestone Updates</Label>
                      <Switch
                        id="emailMilestones"
                        checked={notifications.emailMilestones}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailMilestones: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Push Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pushProposals">New Proposals</Label>
                      <Switch
                        id="pushProposals"
                        checked={notifications.pushProposals}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushProposals: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pushMessages">New Messages</Label>
                      <Switch
                        id="pushMessages"
                        checked={notifications.pushMessages}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushMessages: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pushMilestones">Milestone Updates</Label>
                      <Switch
                        id="pushMilestones"
                        checked={notifications.pushMilestones}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushMilestones: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleNotificationUpdate} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      id="twoFactor"
                      checked={security.twoFactorEnabled}
                      onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, twoFactorEnabled: checked }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout</Label>
                    <Select
                      value={security.sessionTimeout}
                      onValueChange={(value) => setSecurity(prev => ({ ...prev, sessionTimeout: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 Hour</SelectItem>
                        <SelectItem value="8h">8 Hours</SelectItem>
                        <SelectItem value="24h">24 Hours</SelectItem>
                        <SelectItem value="7d">7 Days</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="walletAutoLock">Auto-lock Wallet</Label>
                      <p className="text-sm text-muted-foreground">Automatically lock wallet after inactivity</p>
                    </div>
                    <Switch
                      id="walletAutoLock"
                      checked={security.walletAutoLock}
                      onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, walletAutoLock: checked }))}
                    />
                  </div>
                </div>

                <Button onClick={handleSecurityUpdate} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance & Language
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={appearance.theme}
                      onValueChange={(value) => setAppearance(prev => ({ ...prev, theme: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={appearance.language}
                      onValueChange={(value) => setAppearance(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Primary Currency</Label>
                    <Select
                      value={appearance.currency}
                      onValueChange={(value) => setAppearance(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAX">AVAX</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleAppearanceUpdate} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Appearance Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
