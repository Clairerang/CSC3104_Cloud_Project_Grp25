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
      // Try to fetch real notification data from backend
      const response = await api.engagement.getRecentActivity(10);

      // Check if we got valid data
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Transform notification data to activity log format
        const transformedActivities: ActivityLog[] = response.data.map((item: any) => {
          let activityType = 'checkin';
          let activityAction = '';

          const payload = item.payload || item;

          if (payload.type === 'game_completed') {
            activityType = 'task';
            activityAction = `Completed ${payload.gameName || 'a game'}`;
          } else if (payload.type === 'checkin') {
            activityType = 'checkin';
            activityAction = 'Completed daily check-in';
          } else if (payload.type === 'login' || payload.type === 'senior_login_notification') {
            activityType = 'social';
            activityAction = 'Logged in';
          } else if (payload.type === 'badge_earned') {
            activityType = 'badge';
            activityAction = `Earned "${payload.badgeName || 'a badge'}"`;
          } else {
            activityType = 'checkin';
            activityAction = item.action || 'Activity completed';
          }

          return {
            id: item._id || item.id,
            userId: payload.userId || item.userId,
            user: payload.userName || payload.seniorName || item.userName || 'Unknown User',
            userName: payload.userName || payload.seniorName || item.userName || 'Unknown User',
            action: activityAction,
            type: activityType,
            description: item.description || '',
            timestamp: item.receivedAt || item.timestamp || item.createdAt || new Date().toISOString(),
          };
        });

        setActivities(transformedActivities);
      } else {
        // No data available - show empty state
        setActivities([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading recent activity:', error);
      // Gracefully show empty state on error
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
      {activities.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <Typography variant="body2">No recent activity to display</Typography>
        </Box>
      ) : (
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
      )}
    </Paper>
  );
};

export default RecentActivity;