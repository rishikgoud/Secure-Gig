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
