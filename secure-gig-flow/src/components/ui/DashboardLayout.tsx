import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Shield, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Wallet, 
  Bell, 
  User,
  Menu,
  X
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getStoredUser, getCurrentUser, isAuthenticated } from '@/services/authService';

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface DashboardLayoutProps {
  navLinks: NavLink[];
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ navLinks, children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>('0.00');
  const [userData, setUserData] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Load user data on component mount
  useEffect(() => {
    const storedUser = getStoredUser();
    const currentUser = getCurrentUser();
    const isAuthenticatedUser = isAuthenticated();
    setUserData({ storedUser, currentUser, isAuthenticatedUser });
  }, [location.pathname]); // Re-fetch when route changes

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchWalletBalance = async (address: string) => {
    try {
      // Mock wallet balance fetching - replace with actual implementation
      setWalletBalance('5.2500');
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setWalletBalance('0.0000');
    }
  };

  // Load wallet address from localStorage on mount
  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress');
    if (storedAddress) {
      setWalletAddress(storedAddress);
      fetchWalletBalance(storedAddress);
    }

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          const newAddress = accounts[0];
          setWalletAddress(newAddress);
          localStorage.setItem('walletAddress', newAddress);
          fetchWalletBalance(newAddress);
        } else {
          setWalletAddress(null);
          setWalletBalance('0.0000');
          localStorage.removeItem('walletAddress');
        }
      };

      const handleChainChanged = () => {
        // Refresh balance when chain changes
        const storedAddr = localStorage.getItem('walletAddress');
        if (storedAddr) {
          fetchWalletBalance(storedAddr);
        }
      };

      (window.ethereum as any).on('accountsChanged', handleAccountsChanged);
      (window.ethereum as any).on('chainChanged', handleChainChanged);

      return () => {
        if ((window.ethereum as any).removeListener) {
          (window.ethereum as any).removeListener('accountsChanged', handleAccountsChanged);
          (window.ethereum as any).removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('clientData');
    localStorage.removeItem('freelancerData');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Navigate to home page
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'bg-muted/50 border-r flex flex-col transition-all duration-300 z-50',
        // Desktop styles
        'hidden lg:flex lg:fixed lg:top-0 lg:left-0 lg:h-full',
        isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
        // Mobile styles
        'fixed top-0 left-0 h-full w-64',
        isMobileSidebarOpen ? 'flex' : 'hidden lg:flex'
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
          {(!isSidebarCollapsed || window.innerWidth < 1024) && (
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">SecureGig</span>
            </div>
          )}
          {/* Desktop collapse button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden lg:flex"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
          {/* Mobile close button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <X />
          </Button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive(link.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted',
                  isSidebarCollapsed && window.innerWidth >= 1024 && 'justify-center'
                )}
              >
                <link.icon className="h-5 w-5 flex-shrink-0" />
                {(!isSidebarCollapsed || window.innerWidth < 1024) && (
                  <span className="text-sm font-medium">{link.label}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer (User Profile & Logout) */}
        <div className="p-4 border-t flex-shrink-0 space-y-4">
          <div className={cn(
            'flex items-center gap-3', 
            isSidebarCollapsed && window.innerWidth >= 1024 && 'justify-center'
          )}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={userData?.storedUser?.avatar} />
              <AvatarFallback>{userData?.storedUser?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            {(!isSidebarCollapsed || window.innerWidth < 1024) && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{userData?.storedUser?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{userData?.storedUser?.role || 'Member'}</p>
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            className={cn(
              'w-full flex items-center gap-3',
              isSidebarCollapsed && window.innerWidth >= 1024 ? 'justify-center px-2' : 'justify-start'
            )} 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {(!isSidebarCollapsed || window.innerWidth < 1024) && <span className="text-sm">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={cn(
        'flex-1 flex flex-col transition-all duration-300',
        // Desktop margin
        'lg:ml-0',
        !isSidebarCollapsed && 'lg:ml-64',
        isSidebarCollapsed && 'lg:ml-20'
      )}>
        {/* Mobile Header with Menu Button */}
        <header className="p-4 border-b flex justify-between items-center gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Header content */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            {walletAddress && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 border rounded-full px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-muted/50">
                  <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  <span className="font-mono hidden sm:inline">
                    {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
                  </span>
                  <span className="font-mono sm:hidden">
                    {`${walletAddress.slice(0, 4)}...${walletAddress.slice(-2)}`}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm font-medium">
                  <span className="text-green-400">{walletBalance}</span>
                  <span className="text-muted-foreground hidden sm:inline">AVAX</span>
                </div>
              </div>
            )}
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
