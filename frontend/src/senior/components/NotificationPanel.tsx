import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Badge, Box, IconButton, Paper, Popover, Typography } from '@mui/material';
import React, { useState } from 'react';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}

interface NotificationPanelProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    // Mark all as read when opening panel
    notifications.filter(n => !n.read).forEach(n => onMarkAsRead(n.id));
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: unreadCount > 0 ? '#ea580c' : '#6b7280',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon sx={{ width: 24, height: 24 }} />
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
      >
        <Paper sx={{ width: 380, maxHeight: 500, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16 }}>
              Notifications
            </Typography>
            {notifications.length > 0 && (
              <IconButton size="small" onClick={onClearAll} sx={{ fontSize: 12, color: '#6b7280' }}>
                <Typography variant="caption" sx={{ mr: 0.5 }}>Clear All</Typography>
                <CloseIcon sx={{ width: 16, height: 16 }} />
              </IconButton>
            )}
          </Box>

          {/* Notification List */}
          <Box sx={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <NotificationsIcon sx={{ width: 48, height: 48, color: '#d1d5db', mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  No notifications yet
                </Typography>
              </Box>
            ) : (
              notifications.map((notif) => (
                <Box
                  key={notif.id}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid #f3f4f6',
                    bgcolor: notif.read ? 'transparent' : '#fef3c7',
                    '&:hover': { bgcolor: notif.read ? '#f9fafb' : '#fde68a' },
                    cursor: 'pointer',
                  }}
                  onClick={() => onMarkAsRead(notif.id)}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 14, mb: 0.5 }}>
                    {notif.title}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: 13, color: '#6b7280', mb: 0.5 }}>
                    {notif.body}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: 11, color: '#9ca3af' }}>
                    {formatTimestamp(notif.timestamp)}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Paper>
      </Popover>
    </>
  );
};

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(timestamp).toLocaleDateString();
}
