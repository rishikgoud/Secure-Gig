import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertTriangle, 
  FileText, 
  MessageSquare, 
  Scale, 
  Upload, 
  ShieldCheck 
} from 'lucide-react';

const Dispute = () => {
  const contract = {
    id: 4,
    title: 'Mobile Wallet App Design',
    otherParty: 'WalletTech Inc',
    role: 'Client',
    budget: '$2,500',
    deadline: '2023-12-20',
    status: 'disputed',
  };

  const timeline = [
    { date: '2023-12-22', event: 'Dispute initiated by WalletTech Inc.', by: 'Client' },
    { date: '2023-12-23', event: 'Initial response submitted by Freelancer.', by: 'Freelancer' },
    { date: '2023-12-24', event: 'Evidence uploaded: Final design files.', by: 'Freelancer' },
    { date: '2023-12-24', event: 'Evidence uploaded: Scope document.', by: 'Client' },
    { date: '2023-12-26', event: 'Arbitrator assigned to the case.', by: 'System' },
  ];

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-destructive mb-4 flex items-center gap-3">
            <AlertTriangle className="h-10 w-10" />
            Dispute Resolution
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage the dispute for contract: <strong>{contract.title}</strong>
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Dispute Area */}
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Statement</CardTitle>
                <CardDescription>Clearly explain your position and provide any relevant details. This will be reviewed by the arbitrator.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <Textarea placeholder="Describe the issue in detail..." rows={6} />
                  <div>
                    <Label htmlFor="evidence">Upload Evidence</Label>
                    <Input id="evidence" type="file" className="mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">You can upload documents, images, or zip files (max 50MB).</p>
                  </div>
                  <Button className="bg-destructive hover:bg-destructive/90 text-white">
                    Submit Statement
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dispute Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        {index < timeline.length - 1 && <div className="w-px flex-1 bg-border"></div>}
                      </div>
                      <div>
                        <p className="font-semibold">{item.event}</p>
                        <p className="text-sm text-muted-foreground">{item.date} - by {item.by}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Title:</strong> {contract.title}</p>
                <p><strong>Client:</strong> WalletTech Inc</p>
                <p><strong>Freelancer:</strong> You</p>
                <p><strong>Budget:</strong> {contract.budget}</p>
                <p><strong>Status:</strong> <span className="text-destructive font-semibold">Disputed</span></p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How it Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 mt-1" />
                  <div>
                    <h4 className="font-semibold">Submit Evidence</h4>
                    <p className="text-sm text-muted-foreground">Both parties provide their statements and evidence.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Scale className="h-5 w-5 mt-1" />
                  <div>
                    <h4 className="font-semibold">Arbitration</h4>
                    <p className="text-sm text-muted-foreground">An impartial arbitrator reviews the case.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 mt-1" />
                  <div>
                    <h4 className="font-semibold">Resolution</h4>
                    <p className="text-sm text-muted-foreground">A binding decision is made and funds are released accordingly.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dispute;
