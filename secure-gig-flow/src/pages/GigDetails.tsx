import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Briefcase, FileText, MessageSquare, Shield, Settings } from 'lucide-react';

const GigDetails = () => {
  const userRole = 'Freelancer'; // This would be dynamic in a real app
  const dashboardHome = '/freelancer-dashboard';

  const navLinks = [
    { href: dashboardHome, label: 'Dashboard', icon: LayoutDashboard },
    { href: '/find-gigs', label: 'Find Gigs', icon: Briefcase },
    { href: '/my-proposals', label: 'My Proposals', icon: FileText },
    { href: '/my-contracts', label: 'My Contracts', icon: Shield },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <DashboardLayout navLinks={navLinks}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Gig Details</h1>
        <Card>
          <CardHeader>
            <CardTitle>[Gig Title]</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Detailed information about the gig will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GigDetails;
