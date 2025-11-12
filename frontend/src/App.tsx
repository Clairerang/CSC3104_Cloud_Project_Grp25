import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider } from './components/auth/AuthContext';

// Unified Auth Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Admin Portal Components
import AdminLayout from './admin/common/Layout';
import DashboardHome from './admin/dashboard/DashboardHome';
import UserList from './admin/users/UserList';
import UserDetail from './admin/users/UserDetail';
import ServiceMonitor from './admin/services/ServiceMonitor';
import AdminAnalytics from './admin/analytics/Analytics';
import AdminSettings from './admin/settings/Settings';

// Caregiver Dashboard
import CaregiverApp from './caregiver/CaregiverApp';

// Senior App
import SeniorApp from './senior/SeniorApp';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Root redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Senior App Routes - Protected */}
            <Route element={<ProtectedRoute allowedRoles={['senior']} />}>
              <Route path="/senior/*" element={<SeniorApp />} />
            </Route>

            {/* Caregiver Dashboard Routes - Protected */}
            <Route element={<ProtectedRoute allowedRoles={['caregiver']} />}>
              <Route path="/caregiver/*" element={<CaregiverApp />} />
            </Route>

            {/* Admin Portal Routes - Protected */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardHome />} />
                <Route path="users" element={<UserList />} />
                <Route path="users/:id" element={<UserDetail />} />
                <Route path="services" element={<ServiceMonitor />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
