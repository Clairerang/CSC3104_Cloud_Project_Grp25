import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
} from '@mui/material';
import {
  Edit,
  Delete,
  CheckCircle,
  CalendarToday,
  AccessTime,
  Event,
} from '@mui/icons-material';
import { Activity } from '../../api/mockData';

interface ActivityCardProps {
  activity: Activity;
  isCompleted?: boolean;
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
  onMarkCompleted?: (id: number) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  isCompleted = false,
  onEdit,
  onDelete,
  onMarkCompleted,
}) => {
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
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#424242' }}>
              {activity.title}
            </Typography>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {activity.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
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
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {onMarkCompleted && (
                <IconButton
                  size="small"
                  onClick={() => onMarkCompleted(activity.id)}
                  sx={{ color: '#4caf50', '&:hover': { bgcolor: '#e8f5e8' } }}
                >
                  <CheckCircle />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={() => onEdit(activity)}
                sx={{ color: '#1976d2', '&:hover': { bgcolor: '#e3f2fd' } }}
              >
                <Edit />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDelete(activity.id)}
                sx={{ color: '#f44336', '&:hover': { bgcolor: '#ffebee' } }}
              >
                <Delete />
              </IconButton>
            </Box>
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
      </Box>
    </Paper>
  );
};

export default ActivityCard;

