import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Briefcase, FileText, MessageSquare, Shield, Settings } from 'lucide-react';

const ManageGig = () => {
  const userRole = 'Client'; // This would be dynamic in a real app
  const dashboardHome = '/client-dashboard';

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
        <h1 className="text-3xl font-bold">Manage Gig</h1>
        <Card>
          <CardHeader>
            <CardTitle>Edit Gig Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Gig management form will go here.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManageGig;
