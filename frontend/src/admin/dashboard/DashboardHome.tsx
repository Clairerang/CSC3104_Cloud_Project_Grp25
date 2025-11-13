import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People,
  CheckCircle,
  Warning,
  TrendingUp,
  Elderly,
  FamilyRestroom,
  Celebration,
  NotificationsActive,
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../services/api';
import { DashboardStats } from '../../types/index';
import SystemHealth from './SystemHealth';
import RecentActivity from './RecentActivity';

const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch real data from backend APIs
      const [userCountResponse, todayStatsResponse] = await Promise.all([
        api.users.getStats(),
        api.engagement.getStats(),
      ]);

      const userCount = userCountResponse.data;
      const todayStats = todayStatsResponse.data;

      const dashboardStats: DashboardStats = {
        totalUsers: userCount.total || 0,
        activeUsers: todayStats.activeUsers || 0,
        totalCheckIns: todayStats.totalCheckIns || 0,
        systemHealth: 'healthy',
        users: {
          totalSeniors: userCount.seniors || 0,
          totalFamilies: userCount.family || 0,
          totalAdmins: userCount.admins || 0,
          activeToday: todayStats.activeUsers || 0,
        },
        engagement: {
          checkInsToday: todayStats.checkIns || 0,
        },
        alerts: {
          unresolved: 0,
        },
      };

      setStats(dashboardStats);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      // Fallback to default data if API fails
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalCheckIns: 0,
        systemHealth: 'healthy',
        users: {
          totalSeniors: 0,
          totalFamilies: 0,
          totalAdmins: 0,
          activeToday: 0,
        },
        engagement: {
          checkInsToday: 0,
        },
        alerts: {
          unresolved: 0,
        },
      });
      setError('Failed to load dashboard data. Showing empty state.');
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts (replace with real data from API)
  const engagementData = [
    { name: 'Mon', checkIns: 65, active: 80 },
    { name: 'Tue', checkIns: 72, active: 85 },
    { name: 'Wed', checkIns: 68, active: 82 },
    { name: 'Thu', checkIns: 75, active: 88 },
    { name: 'Fri', checkIns: 80, active: 92 },
    { name: 'Sat', checkIns: 58, active: 75 },
    { name: 'Sun', checkIns: 55, active: 70 },
  ];

  const userDistributionData = [
    { name: 'Seniors', value: stats?.users.totalSeniors || 150, color: '#1976d2' },
    { name: 'Families', value: stats?.users.totalFamilies || 300, color: '#dc004e' },
    { name: 'Admins', value: stats?.users.totalAdmins || 10, color: '#2e7d32' },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const statCards = [
    {
      title: 'Total Seniors',
      value: stats?.users.totalSeniors || 0,
      icon: <Elderly fontSize="large" />,
      color: '#1976d2',
      trend: '+12%',
    },
    {
      title: 'Active Today',
      value: stats?.users.activeToday || 0,
      icon: <CheckCircle fontSize="large" />,
      color: '#2e7d32',
      trend: '+8%',
    },
    {
      title: 'Check-ins Today',
      value: stats?.engagement.checkInsToday || 0,
      icon: <Celebration fontSize="large" />,
      color: '#9c27b0',
      trend: '+15%',
    },
    {
      title: 'Active Alerts',
      value: stats?.alerts.unresolved || 0,
      icon: <Warning fontSize="large" />,
      color: '#ed6c02',
      trend: stats?.alerts.unresolved ? '-5%' : '0%',
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Welcome back! Here's what's happening today.
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="caption" color={card.trend.startsWith('+') ? 'success.main' : 'error.main'}>
                      {card.trend} from last week
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: card.color,
                      borderRadius: 2,
                      p: 1.5,
                      color: 'white',
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Engagement Trends */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Weekly Engagement Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="checkIns" stroke="#1976d2" strokeWidth={2} name="Check-ins" />
                <Line type="monotone" dataKey="active" stroke="#2e7d32" strokeWidth={2} name="Active Users" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* User Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              User Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* System Health & Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <SystemHealth />
        </Grid>
        <Grid item xs={12} lg={4}>
          <RecentActivity />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;