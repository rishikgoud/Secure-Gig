import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { getUserData } from '../lib/user-utils';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, 
  Search,
  FileText, 
  MessageSquare, 
  Shield, 
  Settings,
  Clock,
  User,
  DollarSign,
  Calendar,
  Edit,
  Save
} from 'lucide-react';

interface Contract {
  id: number;
  gigTitle: string;
  clientName: string;
  clientWallet: string;
  budget: string;
  deadline: string;
  description: string;
  progress: number;
  progressNotes: string;
  status: 'Active' | 'Completed' | 'In Review';
  startDate: string;
}

const MyContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [newProgress, setNewProgress] = useState(0);
  const [progressNotes, setProgressNotes] = useState('');
  
  const userData = getUserData();
  const userName = userData?.name || 'Freelancer';
  const userAvatar = userData?.avatar || '👨‍💻';
  const { toast } = useToast();

  const navLinks = [
    { href: '/freelancer-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/find-gigs', label: 'Find Gigs', icon: Search },
    { href: '/my-proposals', label: 'My Proposals', icon: FileText },
    { href: '/my-contracts', label: 'My Contracts', icon: Shield },
    { href: '/chat', label: 'Messages', icon: MessageSquare },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  // Mock contracts data
  useEffect(() => {
    const mockContracts: Contract[] = [
      {
        id: 1,
        gigTitle: "Build a DeFi Dashboard",
        clientName: "CryptoClient.eth",
        clientWallet: "0x742d35Cc6634C0532925a3b8D2",
        budget: "2.5 AVAX",
        deadline: "4 weeks",
        description: "Create a comprehensive DeFi dashboard with real-time data visualization and portfolio tracking capabilities.",
        progress: 65,
        progressNotes: "Completed UI design and implemented basic data fetching. Working on chart integrations.",
        status: "Active",
        startDate: "2024-01-15"
      },
      {
        id: 2,
        gigTitle: "NFT Marketplace Smart Contract",
        clientName: "NFTCreator.eth",
        clientWallet: "0x8ba1f109551bD432803012645Hac136c",
        budget: "3.0 AVAX",
        deadline: "6 weeks",
        description: "Develop and deploy smart contracts for an NFT marketplace with minting, trading, and royalty features.",
        progress: 30,
        progressNotes: "Smart contract architecture completed. Starting implementation of core functions.",
        status: "Active",
        startDate: "2024-01-20"
      }
    ];

    // Load from localStorage or use mock data
    const savedContracts = localStorage.getItem('freelancerContracts');
    if (savedContracts) {
      setContracts(JSON.parse(savedContracts) as Contract[]);
    } else {
      setContracts(mockContracts);
      localStorage.setItem('freelancerContracts', JSON.stringify(mockContracts));
    }
  }, []);

  const handleUpdateProgress = (contract: Contract) => {
    setSelectedContract(contract);
    setNewProgress(contract.progress);
    setProgressNotes(contract.progressNotes);
    setShowProgressModal(true);
  };

  const handleSaveProgress = () => {
    if (!selectedContract) return;

    const updatedContracts = contracts.map(contract => 
      contract.id === selectedContract.id 
        ? { 
            ...contract, 
            progress: newProgress, 
            progressNotes: progressNotes,
            status: (newProgress === 100 ? 'Completed' : 'Active') as 'Active' | 'Completed' | 'In Review'
          }
        : contract
    );

    setContracts(updatedContracts);
    localStorage.setItem('freelancerContracts', JSON.stringify(updatedContracts));
    
    setShowProgressModal(false);
    toast({
      title: "Progress Updated",
      description: `Work progress for "${selectedContract.gigTitle}" has been updated to ${newProgress}%.`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout navLinks={navLinks} userName={userName} userRole="Freelancer" userAvatar={userAvatar}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Contracts</h1>
          <div className="text-sm text-muted-foreground">
            {contracts.length} active contract{contracts.length !== 1 ? 's' : ''}
          </div>
        </div>

        {contracts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No contracts yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                You don't have any active contracts. Apply to gigs to get started with your freelancing journey.
              </p>
              <Button onClick={() => window.location.href = '/find-gigs'}>
                Find Gigs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {contracts.map((contract) => (
              <Card key={contract.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{contract.gigTitle}</CardTitle>
                      <CardDescription className="mt-2">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {contract.clientName}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {contract.budget}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {contract.deadline}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(contract.status)}
                    >
                      {contract.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Project Description</h4>
                      <p className="text-sm text-muted-foreground">{contract.description}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Work Progress</h4>
                        <span className="text-sm font-semibold">{contract.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${contract.progress}%` }}
                        ></div>
                      </div>
                      {contract.progressNotes && (
                        <p className="text-sm text-muted-foreground">{contract.progressNotes}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Started: {formatDate(contract.startDate)}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleUpdateProgress(contract)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Update Progress
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Progress Update Modal */}
        <Dialog open={showProgressModal} onOpenChange={setShowProgressModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Update Work Progress</DialogTitle>
              <DialogDescription>
                Update your progress for "{selectedContract?.gigTitle}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Progress Percentage</Label>
                  <div className="mt-4">
                    <Slider
                      value={[newProgress]}
                      onValueChange={(value) => setNewProgress(value[0])}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>0%</span>
                      <span className="font-semibold">{newProgress}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="progress-notes">Progress Notes</Label>
                  <Textarea
                    id="progress-notes"
                    placeholder="Describe what you've completed and what you're working on next..."
                    value={progressNotes}
                    onChange={(e) => setProgressNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowProgressModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProgress}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Progress
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default MyContracts;
