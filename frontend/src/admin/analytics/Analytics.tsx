import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Download,
  TrendingUp,
  People,
  CheckCircle,
  EmojiEvents,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [stats, setStats] = useState<any>(null);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [userStatsResponse, todayStatsResponse, weeklyEngagementResponse] = await Promise.all([
        api.users.getStats(),
        api.engagement.getStats(),
        api.engagement.getTrends('week'),
      ]);

      const userStats = userStatsResponse.data;
      const todayStats = todayStatsResponse.data;
      const weeklyData = weeklyEngagementResponse.data;

      setStats({
        totalUsers: userStats.total || 0,
        totalSeniors: userStats.seniors || 0,
        totalFamilies: userStats.family || 0,
        checkInsToday: todayStats.checkIns || 0,
        activeUsers: todayStats.activeUsers || 0,
      });

      // Transform weekly engagement data
      const chartData = weeklyData.map((day: any) => ({
        date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
        checkIns: day.checkIns || 0,
        tasks: day.tasksCompleted || 0,
        social: day.socialInteractions || 0,
      }));

      setEngagementData(chartData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Export logic here
    console.log('Exporting data...');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Analytics & Reports
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Comprehensive insights and data visualization
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="day">Last Day</MenuItem>
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<Download />} onClick={handleExport}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.totalUsers || 0}
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Total Seniors
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.totalSeniors || 0}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Check-ins Today
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.checkInsToday || 0}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'info.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Active Users
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.activeUsers || 0}
                  </Typography>
                </Box>
                <EmojiEvents sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Engagement Breakdown */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          Weekly Engagement Breakdown
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={engagementData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="checkIns" fill="#1976d2" name="Check-ins" />
            <Bar dataKey="tasks" fill="#2e7d32" name="Tasks Completed" />
            <Bar dataKey="social" fill="#9c27b0" name="Social Interactions" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default Analytics;