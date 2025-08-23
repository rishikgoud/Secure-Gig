import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { getUserData, getWalletBalance } from '../lib/user-utils';
import { 
  FileText, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  PlayCircle, 
  PauseCircle, 
  AlertTriangle, 
  MessageCircle, 
  MessageSquare, 
  Download, 
  User, 
  Star, 
  Calendar,
  LayoutDashboard,
  Briefcase,
  Shield,
  Settings,
  Wallet,
  Upload,
  QrCode,
  X
} from 'lucide-react';

const Contracts = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [escrowBalance, setEscrowBalance] = useState(8.2341);

  // Load actual wallet balance
  useEffect(() => {
    const loadWalletBalance = async () => {
      const balance = await getWalletBalance();
      setWalletBalance(balance);
    };
    loadWalletBalance();
  }, []);

  const [freelancerAddress, setFreelancerAddress] = useState('');
  const [releaseAmount, setReleaseAmount] = useState('');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const { toast } = useToast();

  const userData = getUserData();
  const userName = userData?.name || 'Client';
  const userAvatar = userData?.avatar || '';

  const navLinks = [
    { href: '/client-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/my-gigs', label: 'My Gigs', icon: Briefcase },
    { href: '/proposals', label: 'Proposals', icon: FileText },
    { href: '/contracts', label: 'Contracts', icon: Shield },
    { href: '/chat', label: 'Messages', icon: MessageSquare },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const contracts = [
    {
      id: 1,
      title: 'NFT Marketplace Frontend Development',
      otherParty: 'ArtBlock Studios',
      role: 'Freelancer',
      budget: '2.5000',
      escrowAmount: '2.5000',
      deadline: '2024-03-15',
      status: 'active',
      progress: 65,
      lastUpdate: '2024-02-10',
      milestones: [
        { id: 1, name: 'UI/UX Design Mockups', completed: true },
        { id: 2, name: 'Frontend Scaffolding', completed: true },
        { id: 3, name: 'Wallet Integration', completed: false },
        { id: 4, name: 'Marketplace Functionality', completed: false },
      ],
    },
    {
      id: 2,
      title: 'DAO Governance Platform Development',
      otherParty: 'Alex Chen',
      role: 'Client',
      budget: '3.6000',
      escrowAmount: '3.6000',
      deadline: '2024-04-01',
      status: 'active',
      progress: 30,
      lastUpdate: '2024-02-12',
      milestones: [
        { id: 1, name: 'Smart Contract Development', completed: true },
        { id: 2, name: 'Frontend Integration', completed: false },
        { id: 3, name: 'Testing & Deployment', completed: false },
      ],
    },
    {
      id: 3,
      title: 'DeFi Protocol Audit',
      otherParty: 'SecureChain Protocol',
      role: 'Freelancer',
      budget: '1.6500',
      escrowAmount: '0.0000',
      deadline: '2024-01-30',
      status: 'completed',
      progress: 100,
      lastUpdate: '2024-01-28',
      rating: 5,
    },
    {
      id: 4,
      title: 'Mobile Wallet App Design',
      otherParty: 'WalletTech Inc',
      role: 'Client',
      budget: '1.3800',
      escrowAmount: '0.2760',
      deadline: '2023-12-20',
      status: 'disputed',
      progress: 80,
      lastUpdate: '2023-12-22',
      disputeReason: 'Final deliverables did not match the agreed scope.'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-500 text-white">Active</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 text-white">Completed</Badge>;
      case 'disputed':
        return <Badge variant="destructive">Disputed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredContracts = (status: string) => contracts.filter(c => c.status === status);

  return (
    <DashboardLayout navLinks={navLinks} userName={userName} userRole="Client" userAvatar={userAvatar}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-gradient-primary mb-4">Contracts</h1>
          <p className="text-lg text-muted-foreground">View and manage all your active and past contracts.</p>
        </div>

        {/* Wallet Balance and Escrow Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wallet Balance</p>
                <p className="text-2xl font-bold">5.2500 AVAX</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Escrow Balance</p>
                <p className="text-2xl font-bold text-green-600">6.3760 AVAX</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="active">Active ({filteredContracts('active').length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({filteredContracts('completed').length})</TabsTrigger>
            <TabsTrigger value="disputed">Disputed ({filteredContracts('disputed').length})</TabsTrigger>
          </TabsList>

          {['active', 'completed', 'disputed'].map(status => (
            <TabsContent key={status} value={status} className="space-y-6">
              {filteredContracts(status).map(contract => (
                <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{contract.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {contract.role === 'Client' ? 'Freelancer' : 'Client'}: {contract.otherParty}
                        </CardDescription>
                      </div>
                      {getStatusBadge(contract.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2"><DollarSign className="h-4 w-4" /><span>{contract.budget} AVAX</span></div>
                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>Deadline: {contract.deadline}</span></div>
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>Last Update: {contract.lastUpdate}</span></div>
                      </div>
                      {contract.status === 'active' && (
                        <div>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${contract.progress}%` }}></div>
                          </div>
                          <p className="text-sm text-right mt-1">{contract.progress}% complete</p>
                        </div>
                      )}
                      {contract.status === 'disputed' && (
                        <div className="bg-destructive/10 p-3 rounded-lg text-sm text-destructive">
                          <p><strong>Dispute Reason:</strong> {contract.disputeReason}</p>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedContract(contract);
                              setDetailsModalOpen(true);
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />View Details
                          </Button>
                          <Button variant="outline" size="sm"><MessageCircle className="h-4 w-4 mr-2" />Chat</Button>
                        </div>
                        {contract.status === 'active' && (
                          <Button 
                            className="bg-green-500 text-white"
                            onClick={() => {
                              setSelectedContract(contract);
                              setReleaseModalOpen(true);
                            }}
                          >
                            Release Milestone
                          </Button>
                        )}
                        {contract.status === 'completed' && <Button variant="outline">Leave Feedback</Button>}
                        {contract.status === 'disputed' && <Button variant="destructive">View Dispute</Button>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {/* View Details Modal */}
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border shadow-lg">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-2xl font-bold text-foreground">{selectedContract?.title}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Contract details and progress overview
              </DialogDescription>
            </DialogHeader>
            
            {selectedContract && (
              <div className="space-y-6">
                {/* Freelancer Info */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">
                    {selectedContract.role === 'Client' ? 'Freelancer' : 'Client'} Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{selectedContract.otherParty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground font-mono">
                        0x{Math.random().toString(16).substr(2, 40)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contract Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Gig Description</h3>
                    <p className="text-muted-foreground">{selectedContract.description || selectedContract.title}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Freelancer Information</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedContract.freelancer}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Wallet Address</p>
                        <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{selectedContract.freelancerWallet || '0x742d35Cc6634C0532925a3b8D2'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Work Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">{selectedContract.progress}%</span>
                      </div>
                      <Progress value={selectedContract.progress} className="h-3" />
                    </div>
                    
                    {selectedContract.milestones && (
                      <div>
                        <h4 className="font-medium mb-2">Milestones</h4>
                        <div className="space-y-2">
                          {selectedContract.milestones.map((milestone: any) => (
                            <div key={milestone.id} className="flex items-center gap-3">
                              {milestone.completed ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <Clock className="h-5 w-5 text-muted-foreground" />
                              )}
                              <span className={milestone.completed ? 'line-through text-muted-foreground' : ''}>
                                {milestone.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Budget</p>
                      <p className="text-lg font-bold">{selectedContract.budget} AVAX</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount to Pay</p>
                      <p className="text-lg font-bold text-green-600">{selectedContract.escrowAmount} AVAX</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Release Milestone Modal */}
        <Dialog open={releaseModalOpen} onOpenChange={setReleaseModalOpen}>
          <DialogContent className="max-w-md">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <div className="relative">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Release Milestone Payment
                </DialogTitle>
                <DialogDescription>
                  Release AVAX tokens from escrow to the freelancer
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-6">
                {selectedContract && (
                  <div className="bg-muted/50 p-3 rounded-lg text-sm">
                    <p><strong>Project:</strong> {selectedContract.title}</p>
                    <p><strong>Available Escrow:</strong> {selectedContract.escrowAmount} AVAX</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="freelancer-address">Freelancer Wallet Address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="freelancer-address"
                      placeholder="0x..."
                      value={freelancerAddress}
                      onChange={(e) => setFreelancerAddress(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="px-3"
                      onClick={() => {
                        // Create a file input element for QR code upload simulation
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            // Simulate QR code processing - generate a random wallet address
                            const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
                            setFreelancerAddress(mockAddress);
                            toast({
                              title: "QR Code Processed",
                              description: `Wallet address extracted from ${file.name}`,
                            });
                          }
                        };
                        input.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload a QR code image to auto-fill the wallet address
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="release-amount">Amount to Release (AVAX)</Label>
                  <Input
                    id="release-amount"
                    type="number"
                    step="0.0001"
                    placeholder="0.0000"
                    value={releaseAmount}
                    onChange={(e) => setReleaseAmount(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      if (!freelancerAddress || !releaseAmount) {
                        toast({
                          title: "Missing Information",
                          description: "Please fill in all required fields.",
                          variant: "destructive",
                        });
                        return;
                      }

                      const amount = parseFloat(releaseAmount);
                      const escrow = parseFloat(selectedContract?.escrowAmount || '0');
                      
                      if (amount > escrow) {
                        toast({
                          title: "Insufficient Escrow",
                          description: "Release amount exceeds available escrow balance.",
                          variant: "destructive",
                        });
                        return;
                      }

                      // Update escrow balance in localStorage
                      const updatedEscrowBalance = escrow - amount;
                      localStorage.setItem('escrowBalance', updatedEscrowBalance.toFixed(4));

                      // Update contract escrow amount
                      if (selectedContract) {
                        selectedContract.escrowAmount = updatedEscrowBalance.toFixed(4);
                        
                        // Update contracts in localStorage if they exist
                        const storedContracts = localStorage.getItem('contracts');
                        if (storedContracts) {
                          const contracts = JSON.parse(storedContracts);
                          const updatedContracts = contracts.map((contract: any) => 
                            contract.id === selectedContract.id 
                              ? { ...contract, escrowAmount: updatedEscrowBalance.toFixed(4) }
                              : contract
                          );
                          localStorage.setItem('contracts', JSON.stringify(updatedContracts));
                        }
                      }

                      toast({
                        title: "Milestone Released Successfully",
                        description: `${amount} AVAX has been released to ${selectedContract?.otherParty}. Escrow balance updated.`,
                      });

                      setReleaseModalOpen(false);
                      setFreelancerAddress('');
                      setReleaseAmount('');
                    }}
                  >
                    Confirm Release
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReleaseModalOpen(false);
                      setFreelancerAddress('');
                      setReleaseAmount('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Contracts;
