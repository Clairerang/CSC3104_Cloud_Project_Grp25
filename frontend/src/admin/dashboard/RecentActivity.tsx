import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle,
  EmojiEvents,
  Person,
  Notifications,
} from '@mui/icons-material';
import { api } from '../services/api';
import { ActivityLog } from '../../types/index';

const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      // Use mock data for demonstration
      const mockActivities: ActivityLog[] = [
        {
          id: '1',
          userId: 'user1',
          user: 'Mary Johnson',
          userName: 'Mary Johnson',
          action: 'Completed daily check-in',
          type: 'checkin',
          description: 'Daily wellness check completed',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        },
        {
          id: '2',
          userId: 'user2',
          user: 'Robert Chen',
          userName: 'Robert Chen',
          action: 'Earned "7-Day Streak" badge',
          type: 'badge',
          description: 'Achievement unlocked',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        },
        {
          id: '3',
          userId: 'user3',
          user: 'Sarah Williams',
          userName: 'Sarah Williams',
          action: 'Completed memory quiz',
          type: 'task',
          description: 'Cognitive activity completed',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        },
        {
          id: '4',
          userId: 'user4',
          user: 'John Davis',
          userName: 'John Davis',
          action: 'Made voice call to family',
          type: 'social',
          description: 'Social connection made',
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        },
        {
          id: '5',
          userId: 'user5',
          user: 'Linda Martinez',
          userName: 'Linda Martinez',
          action: 'Completed daily check-in',
          type: 'checkin',
          description: 'Daily wellness check completed',
          timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
        },
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      setActivities(mockActivities);
      setLoading(false);
    } catch (error) {
      console.error('Error loading recent activity:', error);
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'checkin':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'badge':
        return <EmojiEvents sx={{ color: 'warning.main' }} />;
      case 'task':
        return <Notifications sx={{ color: 'info.main' }} />;
      case 'social':
        return <Person sx={{ color: 'primary.main' }} />;
      default:
        return <CheckCircle />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'checkin':
        return 'success.light';
      case 'badge':
        return 'warning.light';
      case 'task':
        return 'info.light';
      case 'social':
        return 'primary.light';
      default:
        return 'grey.300';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="600" gutterBottom>
        Recent Activity
      </Typography>
      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {activities.map((activity) => (
          <ListItem
            key={activity.id}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: getActivityColor(activity.type) }}>
                {getActivityIcon(activity.type)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight="500">
                  {activity.userName}
                </Typography>
              }
              secondary={
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    {activity.action}
                  </Typography>
                  <Typography variant="caption" display="block" color="textSecondary">
                    {formatTimestamp(activity.timestamp)}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default RecentActivity;