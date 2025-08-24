import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Briefcase, FileText, MessageSquare, Shield, Settings } from 'lucide-react';

const ViewProposals = () => {
  const userRole = 'Client'; // This would be dynamic in a real app
  const dashboardHome = '/client-dashboard';

  const navLinks = [
    { href: dashboardHome, label: 'Dashboard', icon: LayoutDashboard },
    { href: '/find-gigs', label: 'Find Gigs', icon: Briefcase },
    { href: '/my-proposals', label: 'Proposals', icon: FileText },
    { href: '/my-contracts', label: 'Contracts', icon: Shield },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <DashboardLayout navLinks={navLinks}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">View Proposals</h1>
        <Card>
          <CardHeader>
            <CardTitle>Proposals for [Gig Title]</CardTitle>
          </CardHeader>
          <CardContent>
            <p>A list of proposals from freelancers will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ViewProposals;
