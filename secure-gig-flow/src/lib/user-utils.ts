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
        accountType: data.accountType
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
        portfolioLinks: data.portfolioLinks
      };
    }
  
    // Default fallback based on current path
    const isClient = window.location.pathname.includes('client');
    return {
      name: isClient ? 'CryptoKing.eth' : 'Alex.eth',
      avatar: isClient ? '🤴' : '🚀',
      role: isClient ? 'Client' : 'Freelancer'
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
        accountType: updatedData.accountType
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
        portfolioLinks: updatedData.portfolioLinks
      };
      localStorage.setItem('freelancerData', JSON.stringify(freelancerData));
    }
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
  