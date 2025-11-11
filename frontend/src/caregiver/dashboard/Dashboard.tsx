import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  IconButton, 
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Close,
  Timeline,
} from '@mui/icons-material';
import { mockApi, Senior, Alert } from '../api/mockData';
import SeniorDetailsDialog from './SeniorDetailsDialog';

const Dashboard: React.FC = () => {
  const [seniors, setSeniors] = useState<Senior[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const [selectedSenior, setSelectedSenior] = useState<Senior | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [seniorsData, alertsData] = await Promise.all([
          mockApi.getSeniors(),
          mockApi.getAlerts(),
        ]);
        setSeniors(seniorsData);
        setAlerts(alertsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadData();
  }, []);

  const dismissAlert = async (id: string) => {
    try {
      await mockApi.dismissAlert(id);
      setAlerts(alerts.filter(alert => alert.id !== id));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const handleSeniorClick = (senior: Senior) => {
    setSelectedSenior(senior);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Missed Check-In':
        return 'warning';
      case 'Inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 80) return '#4caf50';
    if (engagement >= 50) return '#ff9800';
    return '#f44336';
  };

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', bgcolor: '#f9fafb' }}>
      <Box sx={{ p: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>
            Senior Care Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280' }}>
            Monitor and manage care for your loved ones
          </Typography>
        </Box>

        {/* Senior Overview Cards */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 4, color: '#111827' }}>
            Senior Overview
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            {seniors.map((senior) => (
              <Box key={senior.id}>
                <Card
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => handleSeniorClick(senior)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ position: 'relative' }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: '#1976d2',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: 16,
                          }}
                        >
                          {senior.initials}
                        </Box>
                        {senior.isOnline && (
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: 12,
                              height: 12,
                              bgcolor: '#4caf50',
                              borderRadius: '50%',
                              border: '2px solid white',
                            }}
                          />
                        )}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 0.5 }}>
                          {senior.name}
                        </Typography>
                        <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
                          Last check-in: {senior.lastCheckIn}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Chip
                    label={senior.status}
                    color={getStatusColor(senior.status) as any}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Card>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Engagement Chart */}
        <Card sx={{ p: 4, mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Timeline sx={{ color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Weekly Engagement Overview
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {seniors.map((senior) => (
              <Box key={senior.id}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    {senior.name}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {senior.engagement}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={senior.engagement}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#e5e7eb',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getEngagementColor(senior.engagement),
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Card>


        {/* Alerts */}
        <Card sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Alerts & Notifications
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {alerts.map((alert) => (
              <Box
                key={alert.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: getSeverityColor(alert.severity) === 'error' ? '#f44336' : 
                               getSeverityColor(alert.severity) === 'warning' ? '#ff9800' : '#2196f3',
                  bgcolor: getSeverityColor(alert.severity) === 'error' ? '#ffebee' : 
                           getSeverityColor(alert.severity) === 'warning' ? '#fff3e0' : '#e3f2fd',
                  position: 'relative',
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => dismissAlert(alert.id)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: '#6b7280',
                  }}
                >
                  <Close sx={{ fontSize: 16 }} />
                </IconButton>
                <Typography sx={{ fontSize: 14, pr: 3 }}>
                  {alert.message}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>

        {/* Senior Detail Dialog */}
        <SeniorDetailsDialog
          senior={selectedSenior}
          open={isDialogOpen}
          onClose={handleCloseDialog}
        />
      </Box>
    </Box>
  );
};

export default Dashboard;