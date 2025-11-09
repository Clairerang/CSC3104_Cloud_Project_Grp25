import React, { useState } from 'react';
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

  const userGrowthData = [
    { month: 'Jan', seniors: 120, families: 240, total: 360 },
    { month: 'Feb', seniors: 135, families: 270, total: 405 },
    { month: 'Mar', seniors: 150, families: 300, total: 450 },
    { month: 'Apr', seniors: 165, families: 330, total: 495 },
    { month: 'May', seniors: 180, families: 360, total: 540 },
    { month: 'Jun', seniors: 195, families: 390, total: 585 },
  ];

  const engagementData = [
    { date: 'Mon', checkIns: 145, tasks: 120, social: 89 },
    { date: 'Tue', checkIns: 152, tasks: 130, social: 95 },
    { date: 'Wed', checkIns: 148, tasks: 125, social: 92 },
    { date: 'Thu', checkIns: 160, tasks: 135, social: 98 },
    { date: 'Fri', checkIns: 155, tasks: 128, social: 94 },
    { date: 'Sat', checkIns: 138, tasks: 115, social: 85 },
    { date: 'Sun', checkIns: 142, tasks: 118, social: 87 },
  ];

  const retentionData = [
    { week: 'Week 1', rate: 95 },
    { week: 'Week 2', rate: 88 },
    { week: 'Week 3', rate: 82 },
    { week: 'Week 4', rate: 78 },
    { week: 'Week 5', rate: 75 },
    { week: 'Week 6', rate: 72 },
  ];

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
                    585
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    +12.5% from last month
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
                    Avg Engagement
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    85%
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    +3.2% from last week
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
                    152
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    +8.1% from yesterday
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
                    Badges Earned
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    248
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    +15.3% this week
                  </Typography>
                </Box>
                <EmojiEvents sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User Growth Chart */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              User Growth Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="seniors"
                  stackId="1"
                  stroke="#1976d2"
                  fill="#1976d2"
                  name="Seniors"
                />
                <Area
                  type="monotone"
                  dataKey="families"
                  stackId="1"
                  stroke="#dc004e"
                  fill="#dc004e"
                  name="Families"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              User Retention Rate
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#2e7d32"
                  strokeWidth={3}
                  name="Retention %"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
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