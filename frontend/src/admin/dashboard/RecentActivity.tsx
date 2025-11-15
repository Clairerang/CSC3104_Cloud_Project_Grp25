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
      // Fetch real notification data from backend
      const response = await api.engagement.getRecentActivity(10);

      // Transform notification data to activity log format
      const transformedActivities: ActivityLog[] = response.data.map((item: any) => {
        let activityType = 'checkin';
        let activityAction = '';

        if (item.type === 'game_completed') {
          activityType = 'task';
          activityAction = `Completed ${item.gameName || 'a game'}`;
        } else if (item.type === 'checkin') {
          activityType = 'checkin';
          activityAction = 'Completed daily check-in';
        } else if (item.type === 'login' || item.type === 'senior_login_notification') {
          activityType = 'social';
          activityAction = 'Logged in';
        } else if (item.type === 'badge_earned') {
          activityType = 'badge';
          activityAction = `Earned "${item.badgeName || 'a badge'}"`;
        } else {
          activityType = 'checkin';
          activityAction = item.action || 'Activity completed';
        }

        return {
          id: item._id || item.id,
          userId: item.userId,
          user: item.userName || item.seniorName || 'Unknown User',
          userName: item.userName || item.seniorName || 'Unknown User',
          action: activityAction,
          type: activityType,
          description: item.description || '',
          timestamp: item.timestamp || item.createdAt || new Date().toISOString(),
        };
      });

      setActivities(transformedActivities);
      setLoading(false);
    } catch (error) {
      console.error('Error loading recent activity:', error);
      setActivities([]);
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