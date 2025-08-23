import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Briefcase, 
  Star, 
  DollarSign, 
  Users, 
  Code,
  ArrowRight 
} from 'lucide-react';

const RoleSelectionPage = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role: 'client' | 'freelancer') => {
    localStorage.setItem('selectedRole', role);
    navigate(`/${role}-registration`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Role</h1>
          <p className="text-xl text-gray-600">How would you like to use SecureGigFlow?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Client Card */}
          <Card className="relative overflow-hidden border-2 hover:border-blue-500 transition-all duration-300 hover:shadow-xl group cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Briefcase className="h-8 w-8 text-blue-600" />
                </div>
                <Badge variant="secondary">Hire Talent</Badge>
              </div>
              <CardTitle className="text-2xl text-gray-900">Login as Client</CardTitle>
              <CardDescription className="text-gray-600">
                Post projects, hire freelancers, and manage your team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Access to 50,000+ verified freelancers</span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Secure escrow payments with AVAX</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm">Project management tools</span>
                </div>
              </div>
              
              <Button 
                onClick={() => handleRoleSelection('client')}
                className="w-full bg-blue-600 hover:bg-blue-700 group-hover:bg-blue-700 transition-colors"
              >
                Continue as Client
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Freelancer Card */}
          <Card className="relative overflow-hidden border-2 hover:border-purple-500 transition-all duration-300 hover:shadow-xl group cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Code className="h-8 w-8 text-purple-600" />
                </div>
                <Badge variant="secondary">Earn Money</Badge>
              </div>
              <CardTitle className="text-2xl text-gray-900">Login as Freelancer</CardTitle>
              <CardDescription className="text-gray-600">
                Find projects, showcase your skills, and grow your career
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-purple-500" />
                  <span className="text-sm">Access to premium Web3 projects</span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Get paid instantly in AVAX</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Build your professional reputation</span>
                </div>
              </div>
              
              <Button 
                onClick={() => handleRoleSelection('freelancer')}
                className="w-full bg-purple-600 hover:bg-purple-700 group-hover:bg-purple-700 transition-colors"
              >
                Continue as Freelancer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500">
            You can always switch roles later in your account settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
