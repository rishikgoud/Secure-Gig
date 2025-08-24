import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface WalletGuardProps {
  children: React.ReactNode;
}

/**
 * Authentication guard for wallet connection
 * Ensures users are logged in before accessing wallet features
 */
export const WalletGuard: React.FC<WalletGuardProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // If user is not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user doesn't have a role (shouldn't happen with new flow), redirect to signup
  if (!user.role) {
    return <Navigate to="/signup" replace />;
  }

  // User is authenticated with role, allow access to wallet connection
  return <>{children}</>;
};
