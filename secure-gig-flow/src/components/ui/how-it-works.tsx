import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Lock, 
  CheckCircle, 
  Coins, 
  ArrowRight,
  Shield,
  Users,
  Gavel
} from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: FileText,
      title: "Post Gig",
      description: "Clients create detailed project requirements and set their budget",
      details: "Set milestones, deadlines, and payment terms",
      buttonText: "Post a Gig",
      buttonAction: () => window.location.href = '/auth'
    },
    {
      icon: Users,
      title: "Work & Collaborate",
      description: "Choose from qualified applicants and start the project",
      details: "Review portfolios and communicate directly",
      buttonText: "View Freelancers",
      buttonAction: () => window.location.href = '/auth'
    },
    {
      icon: Lock,
      title: "Escrow Payment",
      description: "Payment is securely locked in a smart contract escrow",
      details: "Blockchain ensures complete transparency and security",
      buttonText: "Learn More",
      buttonAction: () => window.location.href = '/auth'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Dispute Resolution",
      description: "AI-powered mediation system resolves conflicts fairly and quickly",
      color: "text-primary"
    },
    {
      icon: Gavel,
      title: "DAO Governance",
      description: "Community voting for complex disputes and platform decisions",
      color: "text-secondary"
    },
    {
      icon: Lock,
      title: "Trustless System",
      description: "No need to trust the platform - smart contracts handle everything",
      color: "text-accent"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 md:space-y-6 mb-12 md:mb-16">
          <Badge className="bg-gradient-secondary text-accent-foreground px-4 py-2 text-sm md:text-base">
            How It Works
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold">
            <span className="text-gradient-primary">Secure</span> & 
            <span className="text-foreground"> Transparent</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Our blockchain-powered platform eliminates trust issues and ensures 
            fair payments for everyone.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {steps.map((step, index) => (
            <Card key={index} className="card-web3 group relative overflow-hidden border-2 border-border hover:border-primary/30 transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative">
                    <div className="bg-gradient-indigo-violet p-6 rounded-2xl glow-primary group-hover:scale-110 transition-all duration-300">
                      <step.icon className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-gradient-teal-blue text-white px-3 py-1 rounded-full text-xs font-bold">
                      Step {index + 1}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gradient-primary">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                    <p className="text-sm text-primary font-medium bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
                      {step.details}
                    </p>
                    <Button 
                      className="btn-primary w-full mt-6 group-hover:shadow-glow-primary transition-all duration-300"
                      onClick={step.buttonAction}
                    >
                      {step.buttonText}
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Advanced Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="card-web3 text-center">
              <CardContent className="p-8">
                <feature.icon className={`h-12 w-12 ${feature.color} mx-auto mb-4 glow-primary`} />
                <h3 className="text-xl font-heading font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;