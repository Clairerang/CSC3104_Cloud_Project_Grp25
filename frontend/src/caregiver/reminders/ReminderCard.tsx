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
  AccessTime,
} from '@mui/icons-material';
import { ReminderItem } from '../api/mockData';

interface ReminderCardProps {
  reminder: ReminderItem;
  isActive: boolean;
  onDelete: (id: number) => void;
  formatTime: (time: string) => string;
  frequencyLabels: Record<string, string>;
}

const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  isActive,
  onDelete,
  formatTime,
  frequencyLabels,
}) => {
  return (
    <Paper
      sx={{
        p: 3,
        bgcolor: isActive ? '#ffffff' : '#f5f5f5',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        opacity: isActive ? 1 : 0.7,
        ...(isActive && {
          '&:hover': { boxShadow: 2 },
          transition: 'all 0.2s',
        }),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          {/* Elderly Name Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box
              sx={{
                width: isActive ? 32 : 28,
                height: isActive ? 32 : 28,
                bgcolor: isActive ? '#1976d2' : '#9ca3af',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
                fontSize: isActive ? 14 : 12,
              }}
            >
              {reminder.seniorInitials}
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: isActive ? '#1976d2' : '#6b7280',
              }}
            >
              {reminder.senior}
            </Typography>
            <Chip
              label="Elderly"
              size="small"
              sx={{
                bgcolor: isActive ? '#e3f2fd' : '#f3f4f6',
                color: isActive ? '#1976d2' : '#6b7280',
                border: isActive ? '1px solid #bbdefb' : '1px solid #d1d5db',
                fontSize: 10,
                height: isActive ? 20 : 18,
              }}
            />
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 1,
              color: isActive ? '#111827' : '#424242',
            }}
          >
            {reminder.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime
                sx={{
                  color: isActive ? '#6b7280' : '#757575',
                  fontSize: 16,
                }}
              />
              <Typography
                sx={{
                  color: isActive ? '#6b7280' : '#757575',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {formatTime(reminder.time)}
              </Typography>
            </Box>
            <Chip
              label={frequencyLabels[reminder.frequency]}
              size="small"
              sx={{
                bgcolor: '#f3f4f6',
                color: '#6b7280',
                border: '1px solid #d1d5db',
              }}
            />
          </Box>

          {reminder.description && (
            <Typography
              sx={{
                color: isActive ? '#6b7280' : '#757575',
                fontSize: 14,
                mt: 1,
              }}
            >
              {reminder.description}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => onDelete(reminder.id)}
            sx={{
              color: '#f44336',
              '&:hover': { bgcolor: '#ffebee' },
            }}
          >
            <Delete />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default ReminderCard;

