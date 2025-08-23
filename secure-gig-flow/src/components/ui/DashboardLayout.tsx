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
  User 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface DashboardLayoutProps {
  navLinks: NavLink[];
  children: React.ReactNode;
  userName: string;
  userRole: string;
  userAvatar?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ navLinks, children, userName, userRole, userAvatar }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>('0.00');
  const location = useLocation();
  const navigate = useNavigate();

  const fetchWalletBalance = async (address: string) => {
    try {
      if (window.ethereum) {
        // Ensure we're on the correct network before fetching balance
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const expectedChainId = import.meta.env.VITE_CHAIN_ID || '0xa869';
        
        // Debug logging for production
        console.log('DashboardLayout - Current chain ID:', chainId);
        console.log('DashboardLayout - Expected chain ID:', expectedChainId);
        
        // Robust chain ID comparison
        const currentChainIdDecimal = parseInt(chainId, 16);
        const expectedChainIdDecimal = parseInt(expectedChainId, 16);
        
        console.log('DashboardLayout - Current chain ID (decimal):', currentChainIdDecimal);
        console.log('DashboardLayout - Expected chain ID (decimal):', expectedChainIdDecimal);
        
        // Check if we're on Avalanche Fuji (43113)
        const isOnFujiNetwork = currentChainIdDecimal === 43113 || 
                               currentChainIdDecimal === expectedChainIdDecimal ||
                               chainId.toLowerCase() === expectedChainId.toLowerCase();
        
        console.log('DashboardLayout - Is on Fuji network:', isOnFujiNetwork);
        
        if (isOnFujiNetwork) {
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [address, 'latest']
          });
          const balanceInAvax = parseInt(balance, 16) / Math.pow(10, 18);
          console.log('DashboardLayout - Fetched balance:', balanceInAvax, 'AVAX');
          setWalletBalance(balanceInAvax.toFixed(4));
        } else {
          console.log('DashboardLayout - Not on Avalanche Fuji network, balance not fetched');
          setWalletBalance('0.0000');
        }
      }
    } catch (error) {
      console.error('DashboardLayout - Error fetching wallet balance:', error);
      setWalletBalance('0.0000');
    }
  };

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
    // Here you would typically clear auth state
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Fixed Sidebar */}
      <aside className={cn(
        'bg-muted/50 border-r flex flex-col transition-all duration-300 fixed top-0 left-0 h-full',
        isSidebarCollapsed ? 'w-20' : 'w-64'
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
          {!isSidebarCollapsed && (
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">SecureGig</span>
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            {isSidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
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
                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                  isActive(link.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted',
                  isSidebarCollapsed && 'justify-center'
                )}
              >
                <link.icon className="h-5 w-5" />
                {!isSidebarCollapsed && <span>{link.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer (User Profile & Logout) */}
        <div className="p-4 border-t flex-shrink-0">
          <div className={cn('flex items-center gap-3', isSidebarCollapsed && 'justify-center')}>
            <Avatar>
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" />
              <AvatarFallback>SG</AvatarFallback>
            </Avatar>
            {!isSidebarCollapsed && (
              <div>
                <p className="font-semibold">SecureGig User</p>
              </div>
            )}
          </div>
          <Button variant="ghost" className="w-full mt-4 flex items-center gap-3 justify-start" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={cn('flex-1 flex flex-col transition-all duration-300', isSidebarCollapsed ? 'ml-20' : 'ml-64')}>
        {/* Sticky Header */}
        <header className="p-4 border-b flex justify-end items-center gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          {walletAddress && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border rounded-full px-3 py-2 text-sm bg-muted/50">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="font-mono">{`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium">
                <span className="text-green-400">{walletBalance}</span>
                <span className="text-muted-foreground">AVAX</span>
              </div>
            </div>
          )}
          <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
        </header>
        {/* Scrollable Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
