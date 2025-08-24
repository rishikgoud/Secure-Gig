// API Response Types
export interface ChainInfo {
  chainId: number;
  name: string;
  blockNumber: number;
}

export interface GasSuggestion {
  slow: {
    gasPrice: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
  };
  standard: {
    gasPrice: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
  };
  fast: {
    gasPrice: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
  };
}

export interface WalletBalance {
  native: {
    balance: string;
    balanceDisplayValue: string;
    symbol: string;
    decimals: number;
  };
  erc20Tokens: Array<{
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    balance: string;
    balanceDisplayValue: string;
  }>;
}

export interface Transaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: number;
  timestamp: string;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  blockNumber?: number;
  gasUsed?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: any;
}

// Authentication Types
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: 'client' | 'freelancer';
  phone?: string;
  walletAddress?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: 'success';
  token: string;
  data: {
    user: User;
  };
}

// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'freelancer';
  phone?: string;
  walletAddress?: string;
  profile?: UserProfile;
  ratings: {
    average: number;
    count: number;
    reviews: Review[];
  };
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  location?: string;
  website?: string;
  avatar?: string;
  portfolio?: PortfolioItem[];
  experience?: Experience[];
  education?: Education[];
}

export interface PortfolioItem {
  _id?: string;
  title: string;
  description: string;
  url: string;
  image?: string;
}

export interface Experience {
  _id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Education {
  _id?: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
}

export interface Review {
  _id: string;
  reviewerId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// Job Types
export interface JobPost {
  _id: string;
  clientId: string | User;
  title: string;
  description: string;
  category: JobCategory;
  skills: string[];
  budget: {
    type: 'fixed' | 'hourly';
    amount: number;
    currency: string;
  };
  timeline: {
    duration: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
    startDate?: string;
    endDate?: string;
  };
  requirements: {
    experienceLevel: 'entry' | 'intermediate' | 'expert';
    minimumRating?: number;
    portfolioRequired: boolean;
    testRequired: boolean;
  };
  location: {
    type: 'remote' | 'onsite' | 'hybrid';
    city?: string;
    country?: string;
    timezone?: string;
  };
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  visibility: 'public' | 'private' | 'invited';
  proposals: {
    count: number;
    received: string[];
  };
  escrow: {
    isEnabled: boolean;
    contractAddress?: string;
    amount?: number;
  };
  tags: string[];
  featured: boolean;
  urgency: 'low' | 'medium' | 'high';
  applications: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export type JobCategory = 
  | 'web-development'
  | 'mobile-development'
  | 'blockchain-development'
  | 'ui-ux-design'
  | 'graphic-design'
  | 'content-writing'
  | 'marketing'
  | 'data-science'
  | 'ai-ml'
  | 'devops'
  | 'consulting'
  | 'other';

export interface JobSearchFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: JobCategory;
  skills?: string[];
  budgetMin?: number;
  budgetMax?: number;
  budgetType?: 'fixed' | 'hourly';
  experienceLevel?: 'entry' | 'intermediate' | 'expert';
  locationType?: 'remote' | 'onsite' | 'hybrid';
  urgency?: 'low' | 'medium' | 'high';
  sortBy?: 'createdAt' | 'budget' | 'applications' | 'views';
  sortOrder?: 'asc' | 'desc';
}

export interface JobSearchResponse {
  status: 'success';
  results: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  data: {
    jobPosts: JobPost[];
  };
}

export interface ApiResponse<T> {
  status: 'success';
  data: T;
}

export interface UserSearchFilters {
  page?: number;
  limit?: number;
  role?: 'client' | 'freelancer';
  skills?: string[];
  location?: string;
  minRating?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Wallet Types
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
}

export interface NetworkConfig {
  chainId: number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

// Map Entity Types
export interface MapEntity {
  id: string;
  role: 'client' | 'freelancer';
  name: string;
  location: {
    lat: number;
    lng: number;
    city: string;
    country: string;
  };
  skills: string[];
  rating?: number;
  reviewCount?: number;
  budget?: string;
  description?: string;
  avatar?: string;
}

export interface MapFilters {
  role?: 'client' | 'freelancer' | 'all';
  skills?: string;
  radius?: number;
  search?: string;
  lat?: number;
  lng?: number;
}

export interface MapEntitiesResponse {
  entities: MapEntity[];
  total: number;
}

// Proposal types
export interface ProposalData {
  _id?: string;
  jobId: string | JobPost;
  freelancerId?: string | User;
  coverLetter: string;
  proposedRate: {
    amount: number;
    currency: 'USD' | 'AVAX' | 'ETH';
    type: 'fixed' | 'hourly';
  };
  timeline: {
    duration: number;
    unit: 'days' | 'weeks' | 'months';
  };
  experience: string;
  portfolioLinks: string[];
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'shortlisted';
  submittedAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  clientResponse?: string;
}

export interface PopulatedProposal extends Omit<ProposalData, 'jobId' | 'freelancerId'> {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    description: string;
    budget: {
      amount: number;
      currency: string;
      type: 'fixed' | 'hourly';
    };
    category: string;
    status: string;
    clientId: {
      _id: string;
      name: string;
      email: string;
      profile?: {
        avatar?: string;
      };
      ratings?: {
        average: number;
      };
      isVerified: boolean;
    };
  };
  freelancerId: {
    _id: string;
    name: string;
    email: string;
    profile?: {
      avatar?: string;
      bio?: string;
      skills?: string[];
      hourlyRate?: number;
    };
    ratings?: {
      average: number;
    };
    isVerified: boolean;
  };
  freelancer?: User;
}

export interface ProposalSearchFilters {
  jobId?: string;
  freelancerId?: string;
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'shortlisted';
  page?: number;
  limit?: number;
  sortBy?: 'submittedAt' | 'updatedAt' | 'proposedRate.amount';
  sortOrder?: 'asc' | 'desc';
}

export interface ProposalSearchResponse {
  proposals: PopulatedProposal[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProposalStats {
  total: number;
  byStatus: {
    [key: string]: {
      count: number;
      avgProposedAmount: number;
    };
  };
}

export interface CreateProposalRequest {
  jobId: string;
  coverLetter: string;
  proposedRate: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly';
  };
  timeline: {
    duration: number;
    unit: 'days' | 'weeks' | 'months';
    startDate?: string;
  };
  experience: string;
  portfolioLinks?: string[];
  attachments?: string[];
}

export interface UpdateProposalStatusRequest {
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'shortlisted';
  clientResponse?: {
    message: string;
  };
}

export const AVALANCHE_NETWORKS: Record<string, NetworkConfig> = {
  mainnet: {
    chainId: 43114,
    chainName: 'Avalanche Mainnet C-Chain',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://snowtrace.io/'],
  },
  fuji: {
    chainId: 43113,
    chainName: 'Avalanche Fuji Testnet',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://testnet.snowtrace.io/'],
  },
};

// Enhanced Escrow Types for Production
export interface EscrowParams {
  amount: string | number;     // Budget amount (not job title!)
  jobId: string;
  clientAddress: string;
  freelancerAddress: string;
  tokenAddress?: string;       // For ERC20 tokens (default: native token)
  deadline: Date;
  jobTitle: string;
  description?: string;
}

export interface EscrowValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedParams?: EscrowParams;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
}

export interface EscrowTransaction {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
  timestamp: Date;
}

export interface EscrowState {
  id: string;
  jobId: string;
  client: string;
  freelancer: string;
  amount: string;
  token: string;
  status: 'created' | 'funded' | 'released' | 'disputed' | 'cancelled';
  createdAt: Date;
  deadline: Date;
  transactions: EscrowTransaction[];
}

export interface EscrowError {
  code: string;
  message: string;
  details?: any;
  userMessage: string;
}

// Supported tokens configuration
export const SUPPORTED_TOKENS: Record<string, TokenInfo> = {
  AVAX: {
    address: '0x0000000000000000000000000000000000000000', // Native token
    symbol: 'AVAX',
    decimals: 18,
    name: 'Avalanche'
  },
  USDC: {
    address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // Avalanche USDC
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin'
  },
  USDT: {
    address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', // Avalanche USDT
    symbol: 'USDT',
    decimals: 6,
    name: 'Tether USD'
  }
};