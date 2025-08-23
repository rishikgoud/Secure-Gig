import axios, { AxiosInstance, AxiosError } from 'axios';
import { ChainInfo, GasSuggestion, WalletBalance, Transaction, TransactionStatus, ApiError, MapFilters, MapEntitiesResponse } from './types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError<ApiError>) => {
        console.error('API Response Error:', error.response?.data || error.message);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError<ApiError>): Error {
    if (error.response?.data) {
      const apiError = error.response.data;
      return new Error(apiError.message || apiError.error || 'API Error');
    }
    
    if (error.code === 'ECONNREFUSED') {
      return new Error('Unable to connect to the backend server. Please ensure it is running.');
    }
    
    return new Error(error.message || 'Network error occurred');
  }

  // Health check
  async healthCheck(): Promise<{ ok: boolean; timestamp: string; environment: string }> {
    const response = await this.client.get('/api/health');
    return response.data;
  }

  // Chain information
  async getChainInfo(): Promise<ChainInfo> {
    const response = await this.client.get('/api/chain/info');
    return response.data;
  }

  // Gas price suggestions
  async getGasSuggestion(): Promise<GasSuggestion> {
    const response = await this.client.get('/api/chain/gas');
    return response.data;
  }

  // Wallet balance
  async getWalletBalance(address: string): Promise<WalletBalance> {
    const response = await this.client.get(`/api/wallet/${address}/balances`);
    return response.data;
  }

  // Wallet activity/transactions
  async getWalletActivity(address: string, limit: number = 20): Promise<Transaction[]> {
    const response = await this.client.get(`/api/wallet/${address}/activity`, {
      params: { limit }
    });
    return response.data;
  }

  // Transaction details
  async getTransaction(hash: string): Promise<any> {
    const response = await this.client.get(`/api/tx/${hash}`);
    return response.data;
  }

  // Transaction status
  async getTransactionStatus(hash: string): Promise<TransactionStatus> {
    const response = await this.client.get(`/api/tx/${hash}/status`);
    return response.data;
  }

  // Wait for transaction confirmation
  async waitForTransaction(hash: string, confirmations: number = 1): Promise<any> {
    const response = await this.client.post(`/api/tx/${hash}/wait`, {
      confirmations
    });
    return response.data;
  }

  // Escrow operations
  async getEscrowQuote(type: 'deposit' | 'release' | 'dispute', data: any): Promise<any> {
    const response = await this.client.post(`/api/escrow/quote/${type}`, data);
    return response.data;
  }

  async getJobState(jobId: number): Promise<any> {
    const response = await this.client.get(`/api/escrow/job/${jobId}`);
    return response.data;
  }

  // Map entities
  async getMapEntities(filters: MapFilters): Promise<MapEntitiesResponse> {
    const response = await this.client.get('/api/map/entities', {
      params: filters
    });
    return response.data;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;
