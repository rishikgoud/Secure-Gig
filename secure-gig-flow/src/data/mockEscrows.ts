import { EscrowData, EscrowStatus } from '@/types/escrow';

export const mockEscrows: EscrowData[] = [
  {
    id: '1',
    title: 'DeFi Dashboard Development',
    client: '0x742d35Cc6634C0532925a3b8D4C0a5D3C8C0a5D3',
    freelancer: '0x8ba1f109551bD432803012645Hac136c22C0a5D3',
    amount: '2.5',
    currency: 'AVAX',
    deadline: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days from now
    description: 'Build a responsive React dashboard with real-time data visualization for DeFi protocol. Must include charts, tables, and wallet integration.',
    status: EscrowStatus.Active,
    createdAt: Math.floor(Date.now() / 1000) - (2 * 24 * 60 * 60), // 2 days ago
    clientApproved: false,
    workSubmitted: false,
    milestones: [
      {
        id: '1-1',
        title: 'UI Design',
        amount: '1.0',
        completed: true,
        approvedByClient: true
      },
      {
        id: '1-2',
        title: 'Backend Integration',
        amount: '1.5',
        completed: false,
        approvedByClient: false
      }
    ],
  },
  {
    id: '2',
    title: 'NFT Marketplace Audit',
    client: '0x742d35Cc6634C0532925a3b8D4C0a5D3C8C0a5D3',
    freelancer: '0x9cb2f209551bD432803012645Hac136c22C0a5D4',
    amount: '1.8',
    currency: 'AVAX',
    deadline: Math.floor(Date.now() / 1000) - (1 * 24 * 60 * 60), // 1 day overdue
    description: 'Smart contract audit for NFT marketplace. Review security vulnerabilities and provide detailed report with recommendations.',
    status: EscrowStatus.Disputed,
    createdAt: Math.floor(Date.now() / 1000) - (10 * 24 * 60 * 60), // 10 days ago
    clientApproved: false,
    workSubmitted: true,
    disputeRaisedBy: "freelancer",
    disputeRaisedAt: Math.floor(Date.now() / 1000) - (1 * 24 * 60 * 60),
    milestones: [
      {
        id: '2-1',
        title: 'Initial Audit Report',
        amount: '1.8',
        completed: true,
        approvedByClient: false
      }
    ],
  },
  {
    id: '3',
    title: 'Brand Identity Design',
    client: '0x853e46Dd7634C0532925a3b8D4C0a5D3C8C0a5D5',
    freelancer: '0x8ba1f109551bD432803012645Hac136c22C0a5D3',
    amount: '0.75',
    currency: 'AVAX',
    deadline: Math.floor(Date.now() / 1000) - (3 * 24 * 60 * 60), // 3 days ago
    description: 'Create logo design and brand identity package for Web3 startup. Include variations for different use cases.',
    status: EscrowStatus.Completed,
    createdAt: Math.floor(Date.now() / 1000) - (14 * 24 * 60 * 60), // 14 days ago
    clientApproved: true,
    workSubmitted: true,
    completedAt: Math.floor(Date.now() / 1000) - (3 * 24 * 60 * 60),
    milestones: [
      {
        id: '3-1',
        title: 'Logo Design',
        amount: '0.75',
        completed: true,
        approvedByClient: true
      }
    ],
  },
  {
    id: '4',
    title: 'Mobile Portfolio App',
    client: '0x964f57Ee8634C0532925a3b8D4C0a5D3C8C0a5D6',
    freelancer: '0x9cb2f209551bD432803012645Hac136c22C0a5D4',
    amount: '3.2',
    currency: 'AVAX',
    deadline: Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60), // 14 days from now
    description: 'Develop mobile app for crypto portfolio tracking. iOS and Android versions with real-time price feeds and portfolio analytics.',
    status: EscrowStatus.Active,
    createdAt: Math.floor(Date.now() / 1000) - (1 * 24 * 60 * 60), // 1 day ago
    clientApproved: false,
    workSubmitted: false,
    milestones: [
      {
        id: '4-1',
        title: 'iOS App Development',
        amount: '1.6',
        completed: false,
        approvedByClient: false
      },
      {
        id: '4-2',
        title: 'Android App Development',
        amount: '1.6',
        completed: false,
        approvedByClient: false
      }
    ],
  },
  {
    id: '5',
    title: 'Technical Documentation',
    client: '0xa75g68Ff9634C0532925a3b8D4C0a5D3C8C0a5D7',
    freelancer: '0x8ba1f109551bD432803012645Hac136c22C0a5D3',
    amount: '1.5',
    currency: 'AVAX',
    deadline: Math.floor(Date.now() / 1000) - (2 * 24 * 60 * 60), // 2 days overdue
    description: 'Write technical documentation for DeFi protocol. Include API documentation, user guides, and developer tutorials.',
    status: EscrowStatus.Disputed,
    createdAt: Math.floor(Date.now() / 1000) - (21 * 24 * 60 * 60), // 21 days ago
    clientApproved: false,
    workSubmitted: true,
    disputeRaisedBy: "freelancer",
    disputeRaisedAt: Math.floor(Date.now() / 1000) - (2 * 24 * 60 * 60),
    milestones: [
      {
        id: '5-1',
        title: 'API Documentation',
        amount: '1.5',
        completed: true,
        approvedByClient: false
      }
    ],
  },
  {
    id: '6',
    title: 'DEX Development',
    client: '0xb86h79Gg0634C0532925a3b8D4C0a5D3C8C0a5D8',
    freelancer: '0xacb3f309551bD432803012645Hac136c22C0a5D5',
    amount: '4.0',
    currency: 'AVAX',
    deadline: Math.floor(Date.now() / 1000) - (5 * 24 * 60 * 60), // 5 days ago
    description: 'Full-stack development of decentralized exchange (DEX). Include smart contracts, frontend, and backend infrastructure.',
    status: EscrowStatus.Resolved,
    createdAt: Math.floor(Date.now() / 1000) - (45 * 24 * 60 * 60), // 45 days ago
    clientApproved: false,
    workSubmitted: true,
    disputeRaisedBy: "freelancer",
    disputeRaisedAt: Math.floor(Date.now() / 1000) - (10 * 24 * 60 * 60),
    resolvedAt: Math.floor(Date.now() / 1000) - (5 * 24 * 60 * 60),
    milestones: [
      {
        id: '6-1',
        title: 'Smart Contracts',
        amount: '2.0',
        completed: true,
        approvedByClient: true
      },
      {
        id: '6-2',
        title: 'Frontend Development',
        amount: '2.0',
        completed: true,
        approvedByClient: true
      }
    ],
  }
];

// Helper function to get escrows for a specific user address
export const getEscrowsForUser = (userAddress: string): EscrowData[] => {
  return mockEscrows.filter(escrow => 
    escrow.client.toLowerCase() === userAddress.toLowerCase() ||
    escrow.freelancer.toLowerCase() === userAddress.toLowerCase()
  );
};

// Helper function to get escrows by role
export const getEscrowsByRole = (role: 'client' | 'freelancer', userAddress: string): EscrowData[] => {
  return mockEscrows.filter(escrow => {
    if (role === 'client') {
      return escrow.client.toLowerCase() === userAddress.toLowerCase();
    } else {
      return escrow.freelancer.toLowerCase() === userAddress.toLowerCase();
    }
  });
};

export const getEscrowById = (id: string): EscrowData | undefined => {
  return mockEscrows.find(escrow => escrow.id === id);
};

export const getTotalValueLocked = (): string => {
  const total = mockEscrows
    .filter(escrow => escrow.status === EscrowStatus.Active)
    .reduce((sum, escrow) => sum + parseFloat(escrow.amount), 0);
  return total.toFixed(4);
};

export const getActiveEscrowsCount = (): number => {
  return mockEscrows.filter(escrow => escrow.status === EscrowStatus.Active).length;
};

export const getEscrowStats = (): { totalEscrows: number; totalValueLocked: string; activeEscrows: number; completedEscrows: number; disputedEscrows: number } => {
  const totalEscrows = mockEscrows.length;
  const totalValueLocked = getTotalValueLocked();
  const activeEscrows = mockEscrows.filter(e => e.status === EscrowStatus.Active).length;
  const completedEscrows = mockEscrows.filter(e => e.status === EscrowStatus.Completed).length;
  const disputedEscrows = mockEscrows.filter(e => e.status === EscrowStatus.Disputed || e.disputeRaisedAt).length;
  
  return {
    totalEscrows,
    totalValueLocked,
    activeEscrows,
    completedEscrows,
    disputedEscrows
  };
};
