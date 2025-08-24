import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { isAuthenticated, getStoredUser } from '../../services/authService';

/**
 * Protected route component that guards against unauthenticated access
 * Redirects to login page if user is not authenticated
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'freelancer';
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/login'
}) => {
  const { user, isAuthenticated: storeAuthenticated, setUser, setIsAuthenticated } = useAuthStore();
  const location = useLocation();

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    if (!storeAuthenticated && isAuthenticated()) {
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
    }
  }, [storeAuthenticated, setUser, setIsAuthenticated]);

  // Check if user is authenticated
  if (!storeAuthenticated || !user) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access if required
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const dashboardPath = user.role === 'client' ? '/client-dashboard' : '/freelancer-dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  // Check if user account is active
  if (!user.isActive) {
    return <Navigate to="/account-suspended" replace />;
  }

  return <>{children}</>;
};
