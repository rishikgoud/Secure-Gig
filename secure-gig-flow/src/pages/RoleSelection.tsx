import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, ArrowRight, CheckCircle, Star, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState<'client' | 'freelancer' | null>(null);
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'client' | 'freelancer') => {
    setSelectedRole(role);
    // Store role in localStorage (in real app, this would be stored in DB/Smart Contract)
    localStorage.setItem('userRole', role);
    // Redirect to profile setup
    navigate('/profile-setup');
  };

  const roles = [
    {
      id: 'client' as const,
      title: 'Client',
      subtitle: 'Hire Talent',
      description: 'Post projects, hire freelancers, and manage your team with secure escrow payments.',
      icon: Users,
      features: [
        'Post unlimited projects',
        'Access to global talent pool',
        'Secure escrow protection',
        'Real-time project tracking',
        'Dispute resolution system'
      ],
      stats: {
        projects: '50K+',
        freelancers: '10K+',
        satisfaction: '98%'
      },
      gradient: 'bg-gradient-to-br from-primary/20 to-primary/5',
      borderColor: 'border-primary/30',
      iconColor: 'text-primary'
    },
    {
      id: 'freelancer' as const,
      title: 'Freelancer',
      subtitle: 'Find Work',
      description: 'Showcase your skills, find exciting projects, and get paid securely through smart contracts.',
      icon: Briefcase,
      features: [
        'Browse thousands of gigs',
        'Set your own rates',
        'Instant crypto payments',
        'Build your reputation',
        'Global client access'
      ],
      stats: {
        gigs: '25K+',
        earnings: '$2.5M+',
        rating: '4.9★'
      },
      gradient: 'bg-gradient-to-br from-secondary/20 to-secondary/5',
      borderColor: 'border-secondary/30',
      iconColor: 'text-secondary'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="max-w-6xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="bg-gradient-primary text-white px-6 py-3">
            Step 2 of 3
          </Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold">
            Choose Your <span className="text-gradient-primary">Role</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select how you want to use SecureGig. You can always switch roles later.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {roles.map((role) => (
            <Card
              key={role.id}
              className={`card-web3 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                selectedRole === role.id ? 'ring-2 ring-primary shadow-glow-primary' : ''
              } ${role.gradient} border-2 ${role.borderColor}`}
              onClick={() => handleRoleSelect(role.id)}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-6 rounded-2xl ${role.gradient} border ${role.borderColor}`}>
                    <role.icon className={`h-16 w-16 ${role.iconColor}`} />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">{role.title}</CardTitle>
                <p className={`text-lg font-semibold ${role.iconColor}`}>{role.subtitle}</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-muted-foreground text-center leading-relaxed">
                  {role.description}
                </p>

                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    What you get:
                  </h4>
                  <ul className="space-y-2">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${role.iconColor}`}>
                      {Object.values(role.stats)[0]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {role.id === 'client' ? 'Projects' : 'Active Gigs'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${role.iconColor}`}>
                      {Object.values(role.stats)[1]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {role.id === 'client' ? 'Freelancers' : 'Total Earned'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${role.iconColor}`}>
                      {Object.values(role.stats)[2]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {role.id === 'client' ? 'Satisfaction' : 'Avg Rating'}
                    </div>
                  </div>
                </div>

                {/* Select Button */}
                <Button
                  className={`w-full text-lg py-6 group transition-all duration-300 ${
                    role.id === 'client' ? 'btn-primary' : 'btn-secondary'
                  }`}
                  onClick={() => handleRoleSelect(role.id)}
                >
                  Choose {role.title}
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Footer */}
        <div className="text-center space-y-4 pt-8">
          <p className="text-sm text-muted-foreground">
            Join thousands of users already earning and hiring on SecureGig
          </p>
          <div className="flex justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-muted-foreground">$2.5M+ in escrow</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-muted-foreground">4.9/5 average rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-muted-foreground">10K+ active users</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
