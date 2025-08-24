// Utility functions for user data management

export interface UserData {
    name: string;
    avatar: string;
    role: 'Client' | 'Freelancer';
    bio?: string;
    location?: string;
    website?: string;
    skills?: string[];
    hourlyRate?: string;
    companyName?: string;
    industry?: string;
    accountType?: string;
    experienceLevel?: string;
    portfolioLinks?: string[];
    walletBalance?: number;
    escrowBalance?: number;
  }
  
  export const getUserData = (): UserData => {
    // Try to get client data first
    const clientData = localStorage.getItem('clientData');
    if (clientData) {
      const data = JSON.parse(clientData);
      return {
        name: data.name || 'CryptoKing.eth',
        avatar: data.avatar || '🤴',
        role: 'Client',
        bio: data.bio,
        location: data.location,
        website: data.website,
        companyName: data.companyName,
        industry: data.industry,
        accountType: data.accountType,
        walletBalance: data.walletBalance,
        escrowBalance: data.escrowBalance
      };
    }
  
    // Try to get freelancer data
    const freelancerData = localStorage.getItem('freelancerData');
    if (freelancerData) {
      const data = JSON.parse(freelancerData);
      return {
        name: data.name || 'Alex.eth',
        avatar: data.avatar || '🚀',
        role: 'Freelancer',
        bio: data.bio,
        location: data.location,
        website: data.website,
        skills: data.skills,
        hourlyRate: data.hourlyRate,
        experienceLevel: data.experienceLevel,
        portfolioLinks: data.portfolioLinks,
        walletBalance: data.walletBalance,
        escrowBalance: data.escrowBalance
      };
    }
  
    // Default fallback based on current path
    const isClient = window.location.pathname.includes('client');
    return {
      name: isClient ? 'CryptoKing.eth' : 'Alex.eth',
      avatar: isClient ? '🤴' : '🚀',
      role: isClient ? 'Client' : 'Freelancer',
      walletBalance: 5.2500, // Default balance
      escrowBalance: 0 // Default escrow balance
    };
  };
  
  export const updateUserData = (userData: Partial<UserData>) => {
    const currentData = getUserData();
    const updatedData = { ...currentData, ...userData };
  
    if (updatedData.role === 'Client') {
      const clientData = {
        name: updatedData.name,
        avatar: updatedData.avatar,
        bio: updatedData.bio,
        location: updatedData.location,
        website: updatedData.website,
        companyName: updatedData.companyName,
        industry: updatedData.industry,
        accountType: updatedData.accountType,
        walletBalance: updatedData.walletBalance,
        escrowBalance: updatedData.escrowBalance
      };
      localStorage.setItem('clientData', JSON.stringify(clientData));
    } else {
      const freelancerData = {
        name: updatedData.name,
        avatar: updatedData.avatar,
        bio: updatedData.bio,
        location: updatedData.location,
        website: updatedData.website,
        skills: updatedData.skills,
        hourlyRate: updatedData.hourlyRate,
        experienceLevel: updatedData.experienceLevel,
        portfolioLinks: updatedData.portfolioLinks,
        walletBalance: updatedData.walletBalance,
        escrowBalance: updatedData.escrowBalance
      };
      localStorage.setItem('freelancerData', JSON.stringify(freelancerData));
    }
  };
  
  // Wallet and Escrow Management
  export const getStoredWalletBalance = (): number => {
    const userData = getUserData();
    return userData.walletBalance || 5.2500; // Default balance
  };

  export const getStoredEscrowBalance = (): number => {
    const userData = getUserData();
    return userData.escrowBalance || 0; // Default escrow balance
  };

  export const updateWalletBalance = (newBalance: number) => {
    const currentData = getUserData();
    updateUserData({ ...currentData, walletBalance: newBalance });
  };

  export const updateEscrowBalance = (newEscrowBalance: number) => {
    const currentData = getUserData();
    updateUserData({ ...currentData, escrowBalance: newEscrowBalance });
  };

  export const hireFreelancer = (contractAmount: number) => {
    const currentWallet = getStoredWalletBalance();
    const currentEscrow = getStoredEscrowBalance();
    
    if (currentWallet >= contractAmount) {
      // Deduct from wallet and add to escrow
      updateWalletBalance(currentWallet - contractAmount);
      updateEscrowBalance(currentEscrow + contractAmount);
      return { success: true, newWallet: currentWallet - contractAmount, newEscrow: currentEscrow + contractAmount };
    }
    return { success: false, error: 'Insufficient wallet balance' };
  };

  export const releaseEscrowFunds = (releaseAmount: number) => {
    const currentEscrow = getStoredEscrowBalance();
    
    if (currentEscrow >= releaseAmount) {
      updateEscrowBalance(currentEscrow - releaseAmount);
      return { success: true, newEscrow: currentEscrow - releaseAmount };
    }
    return { success: false, error: 'Insufficient escrow balance' };
  };

  // Get actual wallet balance from connected wallet
  export const getWalletBalance = async (): Promise<number> => {
    try {
      if (!window.ethereum) {
        return 0;
      }
  
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        return 0;
      }
  
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      });
  
      // Convert from Wei to AVAX (18 decimals)
      const balanceInAvax = parseInt(balance, 16) / Math.pow(10, 18);
      return balanceInAvax;
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return 0;
    }
  };