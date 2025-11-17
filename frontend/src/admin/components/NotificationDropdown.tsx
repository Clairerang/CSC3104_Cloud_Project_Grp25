import React, { useState, useEffect } from 'react';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  IconButton,
  Badge,
  CircularProgress,
  Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Notification {
  id: string;
  type: 'alert' | 'info' | 'reminder' | 'achievement';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

const NotificationDropdown: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (!open) {
      fetchNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/notification/dashboard/history?limit=10&page=1', {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Map the response format from notification service
        const mappedNotifications = (data.items || []).map((item: any) => ({
          id: item._id || item.id,
          type: item.payload?.type || 'info',
          title: item.payload?.title || 'Notification',
          message: item.payload?.body || item.payload?.message || '',
          read: false,
          createdAt: item.receivedAt || item.createdAt,
          priority: item.payload?.priority || 'low'
        }));
        setNotifications(mappedNotifications);
      } else {
        throw new Error('Failed to fetch notifications');
      }
    } catch (err: any) {
      console.error('Notification fetch error:', err);
      setError(err.message);
      // Set mock data for demo
      setNotifications([
        {
          id: '1',
          type: 'alert',
          title: 'Senior Check-in Missed',
          message: 'John Doe has not checked in today',
          read: false,
          createdAt: new Date().toISOString(),
          priority: 'high',
        },
        {
          id: '2',
          type: 'info',
          title: 'New User Registered',
          message: 'Mary Smith joined the platform',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          priority: 'low',
        },
        {
          id: '3',
          type: 'achievement',
          title: 'Milestone Reached',
          message: '100 daily check-ins completed!',
          read: true,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          priority: 'medium',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`http://localhost:4002/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationColor = (type: string, priority?: string) => {
    if (priority === 'urgent') return '#ef4444';
    if (priority === 'high') return '#f97316';
    if (type === 'achievement') return '#10b981';
    return '#6b7280';
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ mr: 2 }}
        aria-label="notifications"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600,
            mt: 1,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Box sx={{ p: 2 }}>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Showing demo data instead
            </Typography>
          </Box>
        )}

        {/* Notifications List */}
        {!loading && notifications.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No notifications
            </Typography>
          </Box>
        )}

        {!loading && notifications.length > 0 && (
          <List sx={{ p: 0, maxHeight: 450, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    bgcolor: notification.read ? 'white' : '#f0f9ff',
                    '&:hover': {
                      bgcolor: '#e0f2fe',
                    },
                  }}
                  disablePadding
                >
                  <ListItemButton
                    onClick={() => markAsRead(notification.id)}
                    sx={{ py: 2 }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: notification.read ? 400 : 600,
                            color: getNotificationColor(notification.type, notification.priority),
                          }}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: '#3b82f6',
                              ml: 1,
                              mt: 0.5,
                            }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        {formatTime(notification.createdAt)}
                      </Typography>
                    </Box>
                  </ListItemButton>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1.5, textAlign: 'center' }}>
              <Button size="small" onClick={handleClose}>
                View All
              </Button>
            </Box>
          </>
        )}
      </Popover>
    </>
  );
};

export default NotificationDropdown;
