import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Briefcase, FileText, MessageSquare, Shield, Settings } from 'lucide-react';

const ViewProposals = () => {
  const userRole = 'Client'; // This would be dynamic in a real app
  const dashboardHome = '/client-dashboard';

  const navLinks = [
    { href: dashboardHome, label: 'Dashboard', icon: LayoutDashboard },
    { href: '/gigs', label: 'My Gigs', icon: Briefcase },
    { href: '/proposals', label: 'Proposals', icon: FileText },
    { href: '/contracts', label: 'Contracts', icon: Shield },
    { href: '/chat', label: 'Messages', icon: MessageSquare },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <DashboardLayout navLinks={navLinks} userName="CryptoKing.eth" userRole={userRole}>
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
