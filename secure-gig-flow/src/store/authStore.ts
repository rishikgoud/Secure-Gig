import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthResponse } from '../services/authService';

/**
 * Authentication store using Zustand for global state management
 * Persists authentication state across browser sessions
 */

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'client' | 'freelancer';
  walletAddress?: string;
  profile: {
    bio?: string;
    skills?: string[];
    hourlyRate?: number;
    location?: string;
    website?: string;
    avatar?: string;
  };
  ratings: {
    average: number;
    count: number;
  };
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  
  // Actions
  setUser: (user: User) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setToken: (token: string | null) => void;
  login: (response: AuthResponse) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  clearAuth: () => void;
}

/**
 * Zustand store for authentication state management
 * Automatically persists to localStorage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,

      // Actions
      setUser: (user: User) => {
        set({ user });
      },

      setIsAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated });
      },

      setIsLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setToken: (token: string | null) => {
        set({ token });
      },

      /**
       * Handle successful login/signup
       */
      login: (response: AuthResponse) => {
        set({
          user: response.data.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false
        });
      },

      /**
       * Handle user logout
       */
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
        
        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      },

      /**
       * Update user profile data
       */
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates };
          set({ user: updatedUser });
          
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      },

      /**
       * Clear all authentication state
       */
      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
        
        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

/**
 * Initialize auth store from localStorage on app start
 * This ensures authentication state persists across browser sessions
 */
export const initializeAuthStore = () => {
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      useAuthStore.getState().setToken(token);
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setIsAuthenticated(true);
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      useAuthStore.getState().clearAuth();
    }
  }
};
