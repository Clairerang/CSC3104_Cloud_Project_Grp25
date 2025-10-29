import React, { useState } from "react";
import { ThemeProvider, CssBaseline, Paper, Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ActivityIcon from "@mui/icons-material/EventNote";
import ReminderIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";

import theme from "./theme/theme";
import Dashboard from "./components/dashboard/Dashboard";
import Analytics from "./components/analytics/Analytics";
import Activities from "./components/activities/Activities";
import Reminders from "./components/reminders/Reminders";
import Settings from "./components/settings/Settings";

type Tab = "dashboard" | "analytics" | "activities" | "reminders" | "settings";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, color: '#7c3aed' },
    { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon />, color: '#2563eb' },
    { id: 'activities', label: 'Activities', icon: <ActivityIcon />, color: '#16a34a' },
    { id: 'reminders', label: 'Reminders', icon: <ReminderIcon />, color: '#eab308' },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon />, color: '#ea580c' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
          <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
            Senior Care ❤️
            </Typography>
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
    </ThemeProvider>
  );
};

export default App;