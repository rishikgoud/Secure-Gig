import { apiClient } from '../api/client';
import { LoginRequest as SchemaLoginRequest, SignupRequest as SchemaSignupRequest } from '../schemas/authSchemas';
import { AuthResponse, LoginRequest, SignupRequest } from '../api/types';

export interface AuthError {
  status: string;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Login user with email and password
 * @param credentials - User login credentials
 * @returns Promise with authentication response
 */
export const loginUser = async (credentials: SchemaLoginRequest): Promise<AuthResponse> => {
  try {
    // Convert schema types to API types
    const apiCredentials: LoginRequest = {
      email: credentials.email,
      password: credentials.password
    };
    
    const response = await apiClient.login(apiCredentials);
    
    // Store token in localStorage for persistence
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    // Handle API errors with proper error formatting
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('Network Error')) {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:4000');
    }
    throw new Error(error.message || 'Network error. Please check your connection.');
  }
};

/**
 * Register new user account
 * @param userData - User registration data
 * @returns Promise with authentication response
 */
export const signupUser = async (userData: SchemaSignupRequest): Promise<AuthResponse> => {
  try {
    // Convert schema types to API types
    const apiUserData: SignupRequest = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      ...(userData.phone && { phone: userData.phone })
    };
    
    const response = await apiClient.signup(apiUserData);
    
    // Store token in localStorage for persistence
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    // Handle API errors with proper error formatting
    if (error.response?.data) {
      const errorMessage = error.response.data.message || 'Signup failed';
      
      // Handle specific validation errors
      if (error.response.status === 409) {
        if (errorMessage.includes('email')) {
          throw new Error('An account with this email already exists');
        }
        if (errorMessage.includes('wallet')) {
          throw new Error('This wallet address is already registered');
        }
      }
      
      throw new Error(errorMessage);
    }
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('Network Error')) {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:4000');
    }
    throw new Error(error.message || 'Network error. Please check your connection.');
  }
};

/**
 * Logout user and clear stored authentication data
 * @returns Promise with logout response
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await apiClient.logout();
  } catch (error) {
    // Continue with logout even if API call fails
    console.warn('Logout API call failed:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

/**
 * Get current user data from API
 * @returns Promise with current user data
 */
export const getCurrentUser = async (): Promise<AuthResponse['data']['user']> => {
  try {
    const response = await apiClient.getCurrentUser();
    return response.data.user;
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw new Error('Session expired. Please login again.');
    }
    throw new Error('Failed to get user data');
  }
};

/**
 * Check if user is authenticated by verifying stored token
 * @returns boolean indicating authentication status
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

/**
 * Get stored user data from localStorage
 * @returns User data or null if not authenticated
 */
export const getStoredUser = (): AuthResponse['data']['user'] | null => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
};

/**
 * Get stored authentication token
 * @returns Token string or null if not authenticated
 */
export const getStoredToken = (): string | null => {
  return localStorage.getItem('authToken');
};
