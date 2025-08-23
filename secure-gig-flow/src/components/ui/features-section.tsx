import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Zap, 
  Globe, 
  DollarSign, 
  MessageSquare, 
  Star,
  Clock,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Smart Contract Escrow",
      description: "Funds are locked in blockchain escrow until work is completed and approved. No more payment scams or disputes.",
      benefits: ["100% Payment Security", "Automatic Release", "Dispute Protection"],
      color: "text-primary"
    },
    {
      icon: DollarSign,
      title: "Ultra-Low Fees",
      description: "Pay only 2-5% platform fees vs 20-30% on traditional platforms. More money stays in your pocket.",
      benefits: ["85% Lower Fees", "Transparent Pricing", "No Hidden Costs"],
      color: "text-secondary"
    },
    {
      icon: Globe,
      title: "Borderless Payments",
      description: "Accept cryptocurrency payments globally without currency conversion fees or banking delays.",
      benefits: ["Instant Transfers", "Global Access", "Stablecoin Support"],
      color: "text-accent"
    },
    {
      icon: MessageSquare,
      title: "Built-in Communication",
      description: "Encrypted messaging, file sharing, and project collaboration tools integrated into the platform.",
      benefits: ["Secure Chat", "File Sharing", "Project Tracking"],
      color: "text-primary"
    },
    {
      icon: Star,
      title: "Reputation System",
      description: "Blockchain-based reputation scores and NFT badges that can't be faked or manipulated.",
      benefits: ["Verified Reviews", "NFT Achievements", "Skill Verification"],
      color: "text-secondary"
    },
    {
      icon: Clock,
      title: "AI Dispute Resolution",
      description: "Advanced AI mediator analyzes contracts and evidence to resolve disputes fairly and quickly.",
      benefits: ["24/7 Resolution", "Fair Outcomes", "Quick Decisions"],
      color: "text-accent"
    }
  ];

  const stats = [
    { label: "Average Fee Savings", value: "85%", icon: TrendingUp },
    { label: "Payment Security", value: "100%", icon: Shield },
    { label: "Dispute Resolution Time", value: "24h", icon: Clock },
    { label: "Global Freelancers", value: "50K+", icon: Globe }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-background via-muted/10 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 md:space-y-6 mb-12 md:mb-16">
          <Badge className="bg-gradient-primary text-primary-foreground px-4 py-2 text-sm md:text-base">
            Platform Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold">
            <span className="text-foreground">Why Choose </span>
            <span className="text-gradient-secondary">SecureGig?</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Built from the ground up with Web3 technology to solve the biggest problems 
            in freelancing today.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 card-web3">
              <stat.icon className="h-8 w-8 text-primary mx-auto mb-3 glow-primary" />
              <div className="text-2xl md:text-3xl font-bold text-gradient-primary mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="card-web3 h-full group relative overflow-hidden border-2 border-border hover:border-primary/30">
              <CardContent className="p-8 relative z-10">
                <feature.icon className={`h-12 w-12 ${feature.color} mb-6 glow-primary group-hover:scale-110 transition-all duration-300`} />
                <h3 className="text-xl font-heading font-bold mb-4 group-hover:text-gradient-primary transition-all duration-300">{feature.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-gradient-primary rounded-full animate-pulse-glow" />
                      <span className="text-primary font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              {/* Gradient border effect */}
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-all duration-300 rounded-2xl" />
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-card border border-border rounded-3xl p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-heading font-bold mb-4">
            Ready to Experience the Future of Freelancing?
          </h3>
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of freelancers and clients who are already using blockchain 
            technology to work securely and efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button className="btn-hero">
                Get Started Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;