import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Email,
  Phone,
  CalendarToday,
  CheckCircle,
  EmojiEvents,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { User, UserEngagement } from '../../types/index';

const UserDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [engagement, setEngagement] = useState<UserEngagement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchUserData(id);
    }
  }, [id]);

  const fetchUserData = async (userId: string) => {
    try {
      const [userResponse, engagementResponse] = await Promise.all([
        api.users.getById(userId),
        api.engagement.getByUser(userId),
      ]);
      setUser(userResponse.data);
      setEngagement(engagementResponse.data);
    } catch (error) {
      // Mock data
      setUser({
        id: userId,
        name: 'Mary Johnson',
        email: 'mary.j@email.com',
        role: 'senior',
        status: 'active',
        createdAt: '2024-01-15',
        lastActive: new Date().toISOString(),
        phoneNumber: '+65 9123 4567',
      });
      setEngagement({
        userId: userId,
        userName: 'Mary Johnson',
        totalCheckIns: 45,
        currentStreak: 7,
        longestStreak: 15,
        engagementScore: 85,
        lastCheckIn: new Date().toISOString(),
        missedCheckIns: 3,
        tasksCompleted: 32,
        socialInteractions: 18,
      });
    } finally {
      setLoading(false);
    }
  };

  const engagementData = [
    { date: 'Mon', score: 75 },
    { date: 'Tue', score: 82 },
    { date: 'Wed', score: 78 },
    { date: 'Thu', score: 85 },
    { date: 'Fri', score: 90 },
    { date: 'Sat', score: 88 },
    { date: 'Sun', score: 85 },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Typography>User not found</Typography>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/users')}
        sx={{ mb: 2 }}
      >
        Back to Users
      </Button>

      <Grid container spacing={3}>
        {/* User Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: 48,
              }}
            >
              {user.name.charAt(0)}
            </Avatar>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {user.name}
            </Typography>
            <Chip
              label={user.role}
              color="primary"
              sx={{ mb: 2, textTransform: 'capitalize' }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Email sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">{user.email}</Typography>
              </Box>
              {user.phoneNumber && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{user.phoneNumber}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<Edit />}
              fullWidth
              sx={{ mt: 2 }}
            >
              Edit Profile
            </Button>
          </Paper>
        </Grid>

        {/* Engagement Stats */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" variant="body2">
                    Check-ins
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {engagement?.totalCheckIns || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" variant="body2">
                    Current Streak
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {engagement?.currentStreak || 0} days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" variant="body2">
                    Tasks Done
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {engagement?.tasksCompleted || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" variant="body2">
                    Engagement
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="secondary">
                    {engagement?.engagementScore || 0}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Weekly Engagement Trend
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#1976d2"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Activity Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Total Check-ins
                    </Typography>
                    <Typography variant="h6">{engagement?.totalCheckIns || 0}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmojiEvents sx={{ mr: 1, color: 'warning.main' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Longest Streak
                    </Typography>
                    <Typography variant="h6">{engagement?.longestStreak || 0} days</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDetail;