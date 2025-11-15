import { Box, CircularProgress } from '@mui/material';
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: ('admin' | 'caregiver' | 'senior' | 'family')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  console.log('ProtectedRoute: Checking access', {
    user,
    isAuthenticated,
    loading,
    allowedRoles,
    currentPath: window.location.pathname
  });

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute: User role not allowed', {
      userRole: user.role,
      allowedRoles,
      redirectingTo: user.role === 'admin' ? '/admin/dashboard' : user.role === 'caregiver' ? '/caregiver' : user.role === 'family' ? '/caregiver' : '/senior'
    });
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'caregiver':
      case 'family':
        return <Navigate to="/caregiver" replace />;
      case 'senior':
        return <Navigate to="/senior" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  console.log('ProtectedRoute: Access granted');
  return <Outlet />;
};

export default ProtectedRoute;
