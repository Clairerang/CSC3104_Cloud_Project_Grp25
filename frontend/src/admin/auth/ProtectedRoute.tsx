import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const isAuthenticated = () => {
    const token = sessionStorage.getItem('adminToken');
    const user = sessionStorage.getItem('adminUser');

    if (!token || !user) {
      return false;
    }

    try {
      const userData = JSON.parse(user);
      return userData.role === 'admin';
    } catch {
      return false;
    }
  };

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;