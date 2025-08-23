import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Briefcase, FileText, MessageSquare, Shield, Settings } from 'lucide-react';

const GigDetails = () => {
  const userRole = 'Freelancer'; // This would be dynamic in a real app
  const dashboardHome = '/freelancer-dashboard';

  const navLinks = [
    { href: dashboardHome, label: 'Dashboard', icon: LayoutDashboard },
    { href: '/gigs', label: 'Find Gigs', icon: Briefcase },
    { href: '/proposals', label: 'My Proposals', icon: FileText },
    { href: '/contracts', label: 'My Contracts', icon: Shield },
    { href: '/chat', label: 'Messages', icon: MessageSquare },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <DashboardLayout navLinks={navLinks} userName="Alex.eth" userRole={userRole}>
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
