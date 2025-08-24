import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { User, SignupRequest, LoginRequest } from '../api/types';
import { useToast } from './use-toast';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Integrates with: GET /api/auth/me
      const response = await apiClient.getCurrentUser();
      
      setAuthState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null, // Don't show error for unauthenticated state
      });
    }
  }, []);

  const signup = useCallback(async (userData: SignupRequest) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Integrates with: POST /api/auth/signup
      const response = await apiClient.signup(userData);
      
      setAuthState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      toast({
        title: "Account created successfully!",
        description: `Welcome to SecureGig, ${response.data.user.name}!`,
      });

      // Navigate based on role
      if (response.data.user.role === 'client') {
        navigate('/client-dashboard');
      } else {
        navigate('/freelancer-dashboard');
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create account';
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  }, [navigate, toast]);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Integrates with: POST /api/auth/login
      const response = await apiClient.login(credentials);
      
      setAuthState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      toast({
        title: "Login successful!",
        description: `Welcome back, ${response.data.user.name}!`,
      });

      // Navigate based on role
      if (response.data.user.role === 'client') {
        navigate('/client-dashboard');
      } else {
        navigate('/freelancer-dashboard');
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to login';
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  }, [navigate, toast]);

  const logout = useCallback(async () => {
    try {
      // Integrates with: POST /api/auth/logout
      await apiClient.logout();
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });

      navigate('/');
    } catch (error: any) {
      // Even if logout fails on server, clear local state
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      navigate('/');
    }
  }, [navigate, toast]);

  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Integrates with: PATCH /api/users/profile
      const response = await apiClient.updateProfile(profileData);
      
      setAuthState(prev => ({
        ...prev,
        user: response.data.user,
        isLoading: false,
        error: null,
      }));

      toast({
        title: "Profile updated successfully!",
        description: "Your profile information has been saved.",
      });

      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile';
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast({
        title: "Profile update failed",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  }, [toast]);

  const updatePassword = useCallback(async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Integrates with: PATCH /api/auth/update-password
      const response = await apiClient.updatePassword(passwordData);
      
      setAuthState(prev => ({
        ...prev,
        user: response.data.user,
        isLoading: false,
        error: null,
      }));

      toast({
        title: "Password updated successfully!",
        description: "Your password has been changed.",
      });

      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update password';
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast({
        title: "Password update failed",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  }, [toast]);

  return {
    ...authState,
    signup,
    login,
    logout,
    updateProfile,
    updatePassword,
    checkAuthStatus,
  };
};
