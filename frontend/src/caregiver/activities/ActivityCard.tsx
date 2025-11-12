import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Delete,
  CheckCircle,
  CalendarToday,
  AccessTime,
  Event,
  Check,
  Close,
  Schedule,
} from '@mui/icons-material';
import { Activity } from '../api/mockData';

interface ActivityCardProps {
  activity: Activity;
  isCompleted?: boolean;
  onDelete: (id: number) => void;
  onMarkCompleted?: (id: number) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  isCompleted = false,
  onDelete,
  onMarkCompleted,
}) => {
  const getStatusColor = () => {
    switch (activity.status) {
      case 'pending':
        return '#fbbf24'; // amber
      case 'accepted':
        return '#60a5fa'; // blue
      case 'rejected':
        return '#ef4444'; // red
      case 'completed':
        return '#10b981'; // green
      case 'cancelled':
        return '#6b7280'; // gray
      default:
        return '#9ca3af'; // default gray
    }
  };

  const getStatusLabel = () => {
    switch (activity.status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return activity.status;
    }
  };

  const getStatusIcon = () => {
    switch (activity.status) {
      case 'pending':
        return <Schedule sx={{ fontSize: 16 }} />;
      case 'accepted':
        return <Check sx={{ fontSize: 16 }} />;
      case 'rejected':
        return <Close sx={{ fontSize: 16 }} />;
      case 'completed':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'cancelled':
        return <Close sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };
  if (isCompleted) {
    return (
      <Paper
        sx={{
          p: 3,
          bgcolor: '#f5f5f5',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          opacity: 0.8,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
          <Box
            sx={{
              p: 2,
              bgcolor: '#e0e0e0',
              border: '1px solid #bdbdbd',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Event sx={{ color: '#757575', fontSize: 24 }} />
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#424242' }}>
                {activity.title}
              </Typography>
              <Chip
                icon={getStatusIcon()}
                label={getStatusLabel()}
                size="medium"
                sx={{
                  bgcolor: getStatusColor(),
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  height: 'auto',
                  padding: '8px 12px',
                  '& .MuiChip-icon': {
                    color: 'white',
                    fontSize: '1.3rem !important',
                  },
                  '& .MuiChip-label': {
                    paddingLeft: '8px',
                    paddingRight: '12px',
                  },
                }}
              />
            </Box>
            <Typography sx={{ color: '#757575', mb: 2 }}>
              {activity.senior}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday sx={{ color: '#757575', fontSize: 16 }} />
                <Typography sx={{ color: '#757575', fontSize: 14 }}>
                  {new Date(activity.date).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime sx={{ color: '#757575', fontSize: 16 }} />
                <Typography sx={{ color: '#757575', fontSize: 14 }}>
                  {activity.time}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 3,
        bgcolor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        '&:hover': { boxShadow: 2 },
        transition: 'all 0.2s',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
        <Box
          sx={{
            p: 2,
            bgcolor: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Event sx={{ color: '#1976d2', fontSize: 24 }} />
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {activity.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                bgcolor: '#1976d2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
                color: 'white',
              }}
            >
              {activity.seniorInitials}
            </Box>
            <Typography sx={{ color: '#111827', fontWeight: 500 }}>
              {activity.senior}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday sx={{ color: '#6b7280', fontSize: 16 }} />
              <Typography sx={{ color: '#6b7280', fontSize: 14 }}>
                {new Date(activity.date).toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime sx={{ color: '#6b7280', fontSize: 16 }} />
              <Typography sx={{ color: '#6b7280', fontSize: 14 }}>
                {activity.time}
              </Typography>
            </Box>
          </Box>
          
          {activity.description && (
            <Typography sx={{ color: '#6b7280', fontSize: 14 }}>
              {activity.description}
            </Typography>
          )}
        </Box>

        {/* Status and Action Buttons - Right Column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
          <Chip
            icon={getStatusIcon()}
            label={getStatusLabel()}
            size="medium"
            sx={{
              bgcolor: getStatusColor(),
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              height: 'auto',
              padding: '8px 12px',
              '& .MuiChip-icon': {
                color: 'white',
                fontSize: '1.3rem !important',
              },
              '& .MuiChip-label': {
                paddingLeft: '8px',
                paddingRight: '12px',
              },
            }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onMarkCompleted && (
              <IconButton
                size="large"
                onClick={() => onMarkCompleted(activity.id)}
                sx={{ 
                  color: '#4caf50', 
                  '&:hover': { bgcolor: '#e8f5e8' },
                  width: 48,
                  height: 48,
                }}
              >
                <CheckCircle sx={{ fontSize: 32 }} />
              </IconButton>
            )}
            <IconButton
              size="large"
              onClick={() => onDelete(activity.id)}
              sx={{ 
                color: '#f44336', 
                '&:hover': { bgcolor: '#ffebee' },
                width: 48,
                height: 48,
              }}
            >
              <Delete sx={{ fontSize: 32 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ActivityCard;

