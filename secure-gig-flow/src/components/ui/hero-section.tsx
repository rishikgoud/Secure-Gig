import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Shield, Zap, Users, Wallet } from 'lucide-react';
import heroImage from '@/assets/hero-blockchain.jpg';

const HeroSection = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced Background with multiple layers */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Web3 Blockchain Freelance Marketplace" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-secondary/10" />
      </div>

      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center space-y-8 animate-slide-up">
          {/* Enhanced Badge */}
          <div className="inline-flex items-center space-x-2">
            <Badge className="bg-gradient-primary text-white px-6 py-3 text-sm font-semibold animate-pulse-glow border border-primary/30 shadow-lg">
              <Zap className="h-4 w-4 mr-2" />
              Powered by Web3 & Smart Contracts
            </Badge>
            <Badge variant="outline" className="border-secondary/50 text-secondary px-4 py-2 bg-secondary/10">
              0% Platform Fees
            </Badge>
          </div>

          {/* Enhanced Main Heading */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold leading-tight tracking-tight">
              <span className="text-gradient-hero drop-shadow-lg">Freelancing</span>
              <br />
              <span className="text-foreground drop-shadow-lg">Decentralized</span>
              <br />
              <span className="text-gradient-primary drop-shadow-lg">Secure</span>
            </h1>
            <div className="space-y-4">
              <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light md:max-w-lg lg:max-w-4xl">
                The first Web3 marketplace where <span className="text-primary font-semibold">smart contracts</span> eliminate payment scams, 
                reduce fees, and create true peer-to-peer freelancing.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Instant Payments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span>Global Access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <span>Zero Trust Issues</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Button asChild className="btn-hero text-lg px-12 py-6 shadow-2xl hover:shadow-glow-primary transition-all duration-300 group">
              <Link to="/auth">
              <Users className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
              Hire Now
                <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
                        <Button asChild className="btn-secondary text-lg px-12 py-6 shadow-xl hover:shadow-glow-secondary transition-all duration-300 group">
              <Link to="/auth">
              <Wallet className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
              Start Freelancing
                <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          
          {/* Stats Bar */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">$2.5M+</div>
              <div className="text-sm text-muted-foreground">In Escrow</div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-border" />
            <div className="space-y-1">
              <div className="text-2xl font-bold text-secondary">10K+</div>
              <div className="text-sm text-muted-foreground">Freelancers</div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-border" />
            <div className="space-y-1">
              <div className="text-2xl font-bold text-accent">50K+</div>
              <div className="text-sm text-muted-foreground">Jobs Completed</div>
            </div>
          </div>

          {/* Enhanced Trust Indicators */}
          <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="group flex flex-col items-center space-y-4 p-8 card-web3 hover:scale-105 transition-all duration-300 hover:shadow-glow-primary">
              <div className="relative">
                <Shield className="h-16 w-16 text-primary glow-primary group-hover:scale-110 transition-transform" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gradient-primary">100% Secure Escrow</h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Smart contracts guarantee payment protection for both parties with immutable blockchain security
              </p>
            </div>
            
            <div className="group flex flex-col items-center space-y-4 p-8 card-web3 hover:scale-105 transition-all duration-300 hover:shadow-glow-secondary">
              <div className="relative">
                <Zap className="h-16 w-16 text-secondary glow-secondary group-hover:scale-110 transition-transform" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  %
                </div>
              </div>
              <h3 className="text-xl font-bold text-gradient-teal">Ultra Low Fees</h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Pay only 2-3% vs 20-30% on traditional platforms. Save thousands on every project
              </p>
            </div>
            
            <div className="group flex flex-col items-center space-y-4 p-8 card-web3 hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <div className="relative">
                <Users className="h-16 w-16 text-accent group-hover:scale-110 transition-transform" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-primary rounded-full animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-gradient-indigo">Global Talent Network</h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Access verified freelancers worldwide with blockchain-verified skills and reputation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Floating Elements */}
      <div className="absolute top-32 left-10 animate-float opacity-30">
        <div className="w-24 h-24 bg-gradient-primary rounded-full glow-primary blur-sm" />
      </div>
      <div className="absolute top-1/3 right-16 animate-float opacity-25" style={{animationDelay: '1s'}}>
        <div className="w-16 h-16 bg-gradient-indigo-violet rounded-full glow-primary" />
      </div>
      <div className="absolute bottom-32 right-10 animate-float opacity-30" style={{animationDelay: '2s'}}>
        <div className="w-20 h-20 bg-gradient-secondary rounded-full glow-secondary blur-sm" />
      </div>
      <div className="absolute bottom-1/3 left-20 animate-float opacity-25" style={{animationDelay: '3s'}}>
        <div className="w-12 h-12 bg-gradient-teal-blue rounded-full" />
      </div>
      
      {/* Geometric Shapes */}
      <div className="absolute top-1/4 left-1/4 animate-float opacity-10" style={{animationDelay: '1.5s'}}>
        <div className="w-8 h-8 border-2 border-primary rotate-45 animate-spin" style={{animationDuration: '20s'}} />
      </div>
      <div className="absolute bottom-1/4 right-1/4 animate-float opacity-10" style={{animationDelay: '2.5s'}}>
        <div className="w-6 h-6 bg-accent rounded-full animate-pulse" />
      </div>
    </section>
  );
};

export default HeroSection;