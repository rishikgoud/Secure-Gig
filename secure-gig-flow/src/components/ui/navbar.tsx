import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Menu, X, Shield, Zap } from 'lucide-react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-lg border-b border-border/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <RouterLink to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
            <div className="bg-gradient-primary p-2 rounded-lg glow-primary">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-heading font-bold text-gradient-primary">
              SecureGig
            </span>
          </RouterLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1 space-x-8">
            <ScrollLink to="hero" smooth={true} duration={500} offset={-70} spy={true} activeClass="text-primary font-medium" className={`transition-colors text-foreground hover:text-primary cursor-pointer`}>
              Home
            </ScrollLink>
            <ScrollLink to="how-it-works" smooth={true} duration={500} offset={-70} spy={true} activeClass="text-primary font-medium" className="text-foreground hover:text-primary transition-colors cursor-pointer">
              How it Works
            </ScrollLink>
            <ScrollLink to="features" smooth={true} duration={500} offset={-70} spy={true} activeClass="text-primary font-medium" className="text-foreground hover:text-primary transition-colors cursor-pointer">
              Features
            </ScrollLink>
            <ScrollLink to="testimonials" smooth={true} duration={500} offset={-70} spy={true} activeClass="text-primary font-medium" className="text-foreground hover:text-primary transition-colors cursor-pointer">
              Testimonials
            </ScrollLink>
            <ScrollLink to="contact" smooth={true} duration={500} offset={-70} spy={true} activeClass="text-primary font-medium" className="text-foreground hover:text-primary transition-colors cursor-pointer">
              Contact
            </ScrollLink>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center justify-end">
            <RouterLink to="/auth">
              <Button className="btn-primary shadow-lg hover:shadow-glow-primary transition-all duration-300">
                <Wallet className="h-4 w-4 mr-2" />
                Sign In / Connect Wallet
              </Button>
            </RouterLink>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border/50 animate-slide-down bg-background/95 backdrop-blur-lg">
            <ScrollLink to="hero" smooth={true} duration={500} offset={-70} spy={true} className="block py-2 text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </ScrollLink>
            <ScrollLink to="how-it-works" smooth={true} duration={500} offset={-70} spy={true} className="block py-2 text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              How it Works
            </ScrollLink>
            <ScrollLink to="features" smooth={true} duration={500} offset={-70} spy={true} className="block py-2 text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Features
            </ScrollLink>
            <ScrollLink to="testimonials" smooth={true} duration={500} offset={-70} spy={true} className="block py-2 text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Testimonials
            </ScrollLink>
            <ScrollLink to="contact" smooth={true} duration={500} offset={-70} spy={true} className="block py-2 text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Contact
            </ScrollLink>
            <div className="pt-4 space-y-3">
              <RouterLink to="/auth" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-foreground hover:text-primary">
                  Sign In
                </Button>
              </RouterLink>
              <RouterLink to="/auth" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full btn-hero">
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              </RouterLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;