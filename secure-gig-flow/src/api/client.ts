import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { 
  ChainInfo, 
  GasSuggestion, 
  WalletBalance, 
  Transaction, 
  TransactionStatus, 
  ApiError, 
  MapFilters, 
  MapEntitiesResponse,
  SignupRequest,
  LoginRequest,
  AuthResponse,
  User,
  UserProfile,
  JobPost,
  JobSearchFilters,
  JobSearchResponse,
  ApiResponse,
  UserSearchFilters,
  PortfolioItem,
  ProposalData,
  ProposalSearchFilters,
  ProposalSearchResponse,
  ProposalStats,
  CreateProposalRequest,
  UpdateProposalStatusRequest
} from './types';

class ApiClient {
  private baseURL: string;
  private axiosInstance: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Initialize auth token from localStorage
    this.initializeAuth();

    // Request interceptor to add auth token and handle requests
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log('🔍 API DEBUG: Request interceptor triggered');
        console.log('🔍 API DEBUG: Request URL:', config.url);
        console.log('🔍 API DEBUG: Request method:', config.method);
        
        // Always try to get fresh token from localStorage
        const token = this.getStoredToken();
        console.log('🔍 API DEBUG: Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
        console.log('🔍 API DEBUG: Current authToken property:', this.authToken ? `${this.authToken.substring(0, 20)}...` : 'null');
        
        if (token) {
          this.authToken = token;
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔍 API DEBUG: Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
        } else {
          console.log('❌ API DEBUG: No token found, Authorization header not set');
        }
        
        console.log('🔍 API DEBUG: Final request headers:', config.headers);
        return config;
      },
      (error) => {
        console.error('❌ API DEBUG: Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        console.log('✅ API Response Data:', response.data);
        return response;
      },
      (error: AxiosError<ApiError>) => {
        console.error('❌ API Response Error:', error.response?.status, error.response?.data || error.message);
        console.error('❌ API Error URL:', error.config?.url);
        console.error('❌ API Error Method:', error.config?.method);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  // Set authentication token
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  private initializeAuth(): void {
    const storedToken = this.getStoredToken();
    if (storedToken) {
      this.authToken = storedToken;
    }
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private handleError(error: AxiosError<ApiError>): Error {
    // Handle response errors
    if (error.response?.data) {
      const apiError = error.response.data;
      const message = apiError.message || apiError.error || `HTTP ${error.response.status} Error`;
      return new Error(message);
    }

    // Handle network errors
    if (error.request) {
      return new Error('Network error. Please check your connection.');
    }

    // Handle other errors
    return new Error(error.message || 'An unexpected error occurred');
  }

  // Generic HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ ok: boolean; timestamp: string; environment: string }> {
    const response = await this.axiosInstance.get('/api/health');
    return response.data;
  }

  // Chain information
  async getChainInfo(): Promise<ChainInfo> {
    const response = await this.axiosInstance.get('/api/chain/info');
    return response.data;
  }

  // Gas price suggestions
  async getGasSuggestion(): Promise<GasSuggestion> {
    const response = await this.axiosInstance.get('/api/chain/gas');
    return response.data;
  }

  // Wallet balance
  async getWalletBalance(address: string): Promise<WalletBalance> {
    const response = await this.axiosInstance.get(`/api/wallet/${address}/balances`);
    return response.data;
  }

  // Wallet activity/transactions
  async getWalletActivity(address: string, limit: number = 20): Promise<Transaction[]> {
    const response = await this.axiosInstance.get(`/api/wallet/${address}/activity`, {
      params: { limit }
    });
    return response.data;
  }

  // Transaction details
  async getTransaction(hash: string): Promise<any> {
    const response = await this.axiosInstance.get(`/api/tx/${hash}`);
    return response.data;
  }

  // Transaction status
  async getTransactionStatus(hash: string): Promise<TransactionStatus> {
    const response = await this.axiosInstance.get(`/api/tx/${hash}/status`);
    return response.data;
  }

  // Wait for transaction confirmation
  async waitForTransaction(hash: string, confirmations: number = 1): Promise<any> {
    const response = await this.axiosInstance.post(`/api/tx/${hash}/wait`, {
      confirmations
    });
    return response.data;
  }

  // Escrow operations
  async getEscrowQuote(type: 'deposit' | 'release' | 'dispute', data: any): Promise<any> {
    const response = await this.axiosInstance.post(`/api/escrow/quote/${type}`, data);
    return response.data;
  }

  async getJobState(jobId: number): Promise<any> {
    const response = await this.axiosInstance.get(`/api/escrow/job/${jobId}`);
    return response.data;
  }

  // Map entities
  async getMapEntities(filters: MapFilters): Promise<MapEntitiesResponse> {
    const response = await this.axiosInstance.get('/api/map/entities', {
      params: filters
    });
    return response.data;
  }

  // ===== AUTHENTICATION ENDPOINTS =====
  // Integrates with: POST /api/auth/signup
  async signup(userData: SignupRequest): Promise<AuthResponse> {
    const response = await this.axiosInstance.post('/api/auth/signup', userData);
    return response.data;
  }

  // Integrates with: POST /api/auth/login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.axiosInstance.post('/api/auth/login', credentials);
    return response.data;
  }

  // Integrates with: POST /api/auth/logout
  async logout(): Promise<void> {
    await this.axiosInstance.post('/api/auth/logout');
  }

  // Integrates with: GET /api/auth/me
  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    const response = await this.axiosInstance.get('/api/auth/me');
    return response.data;
  }

  // Integrates with: PATCH /api/auth/update-password
  async updatePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<AuthResponse> {
    const response = await this.axiosInstance.patch('/api/auth/update-password', passwordData);
    return response.data;
  }

  // Integrates with: GET /api/auth/stats
  async getUserStats(): Promise<ApiResponse<any>> {
    const response = await this.axiosInstance.get('/api/auth/stats');
    return response.data;
  }

  // ===== USER MANAGEMENT ENDPOINTS =====
  // Integrates with: PATCH /api/users/profile
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    const response = await this.axiosInstance.patch('/api/users/profile', profileData);
    return response.data;
  }

  // Integrates with: GET /api/users/profile/:userId
  async getUserProfile(userId: string): Promise<ApiResponse<{ user: User }>> {
    const response = await this.axiosInstance.get(`/api/users/profile/${userId}`);
    return response.data;
  }

  // Integrates with: GET /api/users/search
  async searchUsers(filters: UserSearchFilters): Promise<ApiResponse<{ users: User[] }>> {
    const response = await this.axiosInstance.get('/api/users/search', {
      params: {
        ...filters,
        skills: filters.skills?.join(',') // Convert array to comma-separated string
      }
    });
    return response.data;
  }

  // Integrates with: GET /api/users/dashboard
  async getDashboardData(): Promise<ApiResponse<any>> {
    const response = await this.axiosInstance.get('/api/users/dashboard');
    return response.data;
  }

  // Integrates with: POST /api/users/portfolio
  async addPortfolioItem(portfolioData: Omit<PortfolioItem, '_id'>): Promise<ApiResponse<{ portfolio: PortfolioItem[] }>> {
    const response = await this.axiosInstance.post('/api/users/portfolio', portfolioData);
    return response.data;
  }

  // Integrates with: PATCH /api/users/portfolio/:portfolioId
  async updatePortfolioItem(portfolioId: string, portfolioData: Partial<PortfolioItem>): Promise<ApiResponse<{ portfolio: PortfolioItem[] }>> {
    const response = await this.axiosInstance.patch(`/api/users/portfolio/${portfolioId}`, portfolioData);
    return response.data;
  }

  // Integrates with: DELETE /api/users/portfolio/:portfolioId
  async deletePortfolioItem(portfolioId: string): Promise<void> {
    await this.axiosInstance.delete(`/api/users/portfolio/${portfolioId}`);
  }

  // Integrates with: POST /api/users/experience
  async addExperience(experienceData: any): Promise<ApiResponse<any>> {
    const response = await this.axiosInstance.post('/api/users/experience', experienceData);
    return response.data;
  }

  // Integrates with: POST /api/users/education
  async addEducation(educationData: any): Promise<ApiResponse<any>> {
    const response = await this.axiosInstance.post('/api/users/education', educationData);
    return response.data;
  }

  // Integrates with: POST /api/users/:userId/review
  async addReview(userId: string, reviewData: { rating: number; comment?: string }): Promise<ApiResponse<any>> {
    const response = await this.axiosInstance.post(`/api/users/${userId}/review`, reviewData);
    return response.data;
  }

  // ===== JOB MANAGEMENT ENDPOINTS =====
  // Integrates with: POST /api/jobs
  async createJob(jobData: Omit<JobPost, '_id' | 'clientId' | 'createdAt' | 'updatedAt' | 'views' | 'applications' | 'proposals'>): Promise<ApiResponse<{ jobPost: JobPost }>> {
    const response = await this.axiosInstance.post('/api/jobs', jobData);
    return response.data;
  }

  // Integrates with: GET /api/jobs
  async getJobs(filters?: JobSearchFilters): Promise<JobSearchResponse> {
    const params: any = { ...filters };
    
    // Convert skills array to comma-separated string
    if (filters?.skills && Array.isArray(filters.skills)) {
      params.skills = filters.skills.join(',');
    }
    
    const response = await this.axiosInstance.get('/api/jobs', { params });
    return response.data;
  }

  // Integrates with: GET /api/jobs/:jobId
  async getJob(jobId: string): Promise<ApiResponse<{ jobPost: JobPost }>> {
    const response = await this.axiosInstance.get(`/api/jobs/${jobId}`);
    return response.data;
  }

  // Integrates with: GET /api/jobs/my/posts
  async getMyJobs(filters?: { page?: number; limit?: number; status?: string; sortBy?: string; sortOrder?: string }): Promise<JobSearchResponse> {
    const response = await this.axiosInstance.get('/api/jobs/my/posts', {
      params: filters
    });
    return response.data;
  }

  // Integrates with: PATCH /api/jobs/:jobId
  async updateJob(jobId: string, jobData: Partial<JobPost>): Promise<ApiResponse<{ jobPost: JobPost }>> {
    const response = await this.axiosInstance.patch(`/api/jobs/${jobId}`, jobData);
    return response.data;
  }

  // Integrates with: DELETE /api/jobs/:jobId
  async deleteJob(jobId: string): Promise<void> {
    await this.axiosInstance.delete(`/api/jobs/${jobId}`);
  }

  // Integrates with: PATCH /api/jobs/:jobId/status
  async updateJobStatus(jobId: string, status: string): Promise<ApiResponse<{ jobPost: JobPost }>> {
    const response = await this.axiosInstance.patch(`/api/jobs/${jobId}/status`, { status });
    return response.data;
  }

  // Integrates with: GET /api/jobs/:jobId/stats
  async getJobStats(jobId: string): Promise<ApiResponse<any>> {
    const response = await this.axiosInstance.get(`/api/jobs/${jobId}/stats`);
    return response.data;
  }

  // Integrates with: GET /api/jobs/featured
  async getFeaturedJobs(limit?: number): Promise<ApiResponse<{ jobPosts: JobPost[] }>> {
    const response = await this.axiosInstance.get('/api/jobs/featured', {
      params: { limit }
    });
    return response.data;
  }

  // Integrates with: GET /api/jobs/categories
  async getJobCategories(): Promise<ApiResponse<{ categories: any[] }>> {
    const response = await this.axiosInstance.get('/api/jobs/categories');
    return response.data;
  }

  // Integrates with: GET /api/jobs/skills/popular
  async getPopularSkills(limit?: number): Promise<ApiResponse<{ skills: any[] }>> {
    const response = await this.axiosInstance.get('/api/jobs/skills/popular', {
      params: { limit }
    });
    return response.data;
  }

  // ============================================
  // PROPOSAL API METHODS
  // ============================================

  // Integrates with: POST /api/proposals
  async createProposal(proposalData: CreateProposalRequest): Promise<ApiResponse<ProposalData>> {
    const response = await this.axiosInstance.post('/api/proposals', proposalData);
    return response.data;
  }

  // Integrates with: GET /api/proposals
  async getProposals(filters?: ProposalSearchFilters): Promise<ProposalSearchResponse> {
    const response = await this.axiosInstance.get('/api/proposals', {
      params: filters
    });
    return response.data;
  }

  // Integrates with: GET /api/proposals/:id
  async getProposalById(proposalId: string): Promise<ApiResponse<ProposalData>> {
    const response = await this.axiosInstance.get(`/api/proposals/${proposalId}`);
    return response.data;
  }

  // Integrates with: PATCH /api/proposals/:id/status
  async updateProposalStatus(proposalId: string, statusData: UpdateProposalStatusRequest): Promise<ApiResponse<ProposalData>> {
    const response = await this.axiosInstance.patch(`/api/proposals/${proposalId}/status`, statusData);
    return response.data;
  }

  // Integrates with: PATCH /api/proposals/:id/withdraw
  async withdrawProposal(proposalId: string): Promise<ApiResponse<void>> {
    const response = await this.axiosInstance.patch(`/api/proposals/${proposalId}/withdraw`);
    return response.data;
  }

  // Integrates with: GET /api/proposals/stats
  async getProposalStats(): Promise<ApiResponse<ProposalStats>> {
    const response = await this.axiosInstance.get('/api/proposals/stats');
    return response.data;
  }

  // Get proposals for a specific job (for clients)
  async getJobProposals(jobId: string, filters?: Omit<ProposalSearchFilters, 'jobId'>): Promise<ProposalSearchResponse> {
    console.log('🔍 API: Getting proposals for job:', jobId);
    const response = await this.axiosInstance.get(`/api/proposals/job/${jobId}`, {
      params: filters
    });
    return response.data.data;
  }

  // Get freelancer's own proposals (uses current user from token)
  async getMyProposals(filters?: Omit<ProposalSearchFilters, 'freelancerId'>): Promise<ProposalSearchResponse> {
    console.log('🔍 API: Getting my proposals with filters:', filters);
    const response = await this.axiosInstance.get('/api/proposals', {
      params: filters
    });
    console.log('🔍 API: getMyProposals response:', response.data);
    return response.data.data || response.data;
  }

  // Get proposals by specific user ID
  async getUserProposals(userId: string, filters?: Omit<ProposalSearchFilters, 'freelancerId'>): Promise<ProposalSearchResponse> {
    console.log('🔍 API: Getting proposals for user:', userId);
    const response = await this.axiosInstance.get(`/api/proposals/user/${userId}`, {
      params: filters
    });
    console.log('🔍 API: getUserProposals response:', response.data);
    return response.data.data || response.data;
  }

  // Get proposals by freelancer ID (legacy method)
  async getFreelancerProposals(freelancerId: string, filters?: Omit<ProposalSearchFilters, 'freelancerId'>): Promise<ProposalSearchResponse> {
    console.log('🔍 API: Getting proposals for freelancer:', freelancerId);
    const response = await this.axiosInstance.get(`/api/proposals/freelancer/${freelancerId}`, {
      params: filters
    });
    return response.data.data;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;
