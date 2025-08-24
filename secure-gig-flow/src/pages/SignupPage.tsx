import React from 'react';
import { Navigate } from 'react-router-dom';
import { SignupForm } from '../components/auth/SignupForm';
import { useAuthStore } from '../store/authStore';
import { isAuthenticated } from '../services/authService';

/**
 * Signup page component
 * Redirects authenticated users to appropriate dashboard
 */
export const SignupPage: React.FC = () => {
  const { user, isAuthenticated: storeAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  if (storeAuthenticated && user) {
    const dashboardPath = user.role === 'client' ? '/client-dashboard' : '/freelancer-dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  // Also check localStorage for existing auth
  if (isAuthenticated()) {
    return <Navigate to="/wallet-connection" replace />;
  }

  return <SignupForm />;
};
