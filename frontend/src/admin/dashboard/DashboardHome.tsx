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
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all users to calculate stats
      const usersResponse = await api.users.getAll();
      const allUsers = usersResponse.data || [];

      // Calculate user counts by role
      const seniorCount = allUsers.filter((u: any) => u.role === 'senior').length;
      const familyCount = allUsers.filter((u: any) => u.role === 'family' || u.role === 'caregiver').length;
      const adminCount = allUsers.filter((u: any) => u.role === 'admin').length;
      const totalUsers = allUsers.length;

      // Calculate active users today (users with lastActiveAt within last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const activeToday = allUsers.filter((u: any) => {
        if (!u.lastActiveAt) return false;
        return new Date(u.lastActiveAt) > oneDayAgo;
      }).length;

      const dashboardStats: DashboardStats = {
        totalUsers,
        activeUsers: activeToday,
        totalCheckIns: 0, // Will be calculated from notifications
        systemHealth: 'healthy',
        users: {
          totalSeniors: seniorCount,
          totalFamilies: familyCount,
          totalAdmins: adminCount,
          activeToday,
        },
        engagement: {
          checkInsToday: 0,
        },
        alerts: {
          unresolved: 0,
        },
      };

      setStats(dashboardStats);

      // Set simple engagement data for the week
      const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const simpleEngagementData = daysOfWeek.map(day => ({
        name: day,
        checkIns: 0,
        active: 0,
      }));
      setEngagementData(simpleEngagementData);

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
      setEngagementData([]);
      setError('Failed to load dashboard data. Showing empty state.');
    } finally {
      setLoading(false);
    }
  };

  const userDistributionData = [
    { name: 'Seniors', value: stats?.users.totalSeniors || 0, color: '#1976d2' },
    { name: 'Families', value: stats?.users.totalFamilies || 0, color: '#dc004e' },
    { name: 'Admins', value: stats?.users.totalAdmins || 0, color: '#2e7d32' },
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
    },
    {
      title: 'Active Today',
      value: stats?.users.activeToday || 0,
      icon: <CheckCircle fontSize="large" />,
      color: '#2e7d32',
    },
    {
      title: 'Check-ins Today',
      value: stats?.engagement.checkInsToday || 0,
      icon: <Celebration fontSize="large" />,
      color: '#9c27b0',
    },
    {
      title: 'Active Alerts',
      value: stats?.alerts.unresolved || 0,
      icon: <Warning fontSize="large" />,
      color: '#ed6c02',
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
                    <Typography variant="h4" fontWeight="bold">
                      {card.value}
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