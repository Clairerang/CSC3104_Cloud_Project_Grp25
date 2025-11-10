import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Paper, Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Divider } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ActivityIcon from "@mui/icons-material/EventNote";
import ReminderIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../components/auth/AuthContext";

import Dashboard from "./dashboard/Dashboard";
import Analytics from "./analytics/Analytics";
import Activities from "./activities/Activities";
import Reminders from "./reminders/Reminders";
import Settings from "./settings/Settings";

type Tab = "dashboard" | "analytics" | "activities" | "reminders" | "settings";

const CaregiverApp: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, color: '#7c3aed' },
    { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon />, color: '#8b5cf6' },
    { id: 'activities', label: 'Activities', icon: <ActivityIcon />, color: '#a78bfa' },
    { id: 'reminders', label: 'Reminders', icon: <ReminderIcon />, color: '#6d28d9' },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon />, color: '#5b21b6' },
  ];

  return (
    <Box sx={{ height: '100vh', bgcolor: '#f9fafb', display: 'flex' }}>
      {/* Sidebar Navigation */}
      <Paper
        sx={{
          width: 280,
          height: '100vh',
          borderRight: '1px solid #e5e7eb',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
        elevation={0}
      >
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component="img"
            src="/app-icon.jpg"
            alt="Senior Care Logo"
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              objectFit: 'cover',
            }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
              Senior Care
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              Caregiver Portal
            </Typography>
          </Box>
        </Box>

        {/* Navigation Items */}
        <List sx={{ flex: 1, pt: 2 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ px: 2, mb: 1 }}>
              <ListItemButton
                onClick={() => setActiveTab(item.id as Tab)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  backgroundColor: activeTab === item.id ? `${item.color}15` : 'transparent',
                  color: activeTab === item.id ? item.color : '#6b7280',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: activeTab === item.id ? `${item.color}20` : '#f3f4f6',
                    color: activeTab === item.id ? item.color : '#374151',
                  },
                  '& .MuiListItemIcon-root': {
                    color: activeTab === item.id ? item.color : '#9ca3af',
                    minWidth: 40,
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: activeTab === item.id ? 600 : 500,
                    fontSize: 15,
                  }
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Logout Button */}
        <Box sx={{ p: 2, borderTop: '1px solid #e5e7eb' }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              py: 1.5,
              px: 2,
              color: '#dc2626',
              '&:hover': {
                backgroundColor: '#fee2e2',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#dc2626', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </Box>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "analytics" && <Analytics />}
        {activeTab === "activities" && <Activities />}
        {activeTab === "reminders" && <Reminders />}
        {activeTab === "settings" && <Settings />}
      </Box>
    </Box>
  );
};

export default CaregiverApp;
