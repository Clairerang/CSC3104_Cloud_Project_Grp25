import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: ('admin' | 'caregiver' | 'senior')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'caregiver':
        return <Navigate to="/caregiver" replace />;
      case 'senior':
        return <Navigate to="/senior" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
