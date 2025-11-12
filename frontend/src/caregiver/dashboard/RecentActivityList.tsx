import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { EmojiEmotions, CheckCircle, Star } from '@mui/icons-material';
import { CaregiverSeniorCard } from '../types/caregiver';

interface RecentActivityListProps {
  senior: CaregiverSeniorCard;
}

const formatMood = (mood?: 'great' | 'okay' | 'not-well') => {
  if (!mood) return 'No mood recorded';
  if (mood === 'great') return 'Feeling great';
  if (mood === 'okay') return 'Doing okay';
  return 'Not feeling well';
};

const RecentActivityList: React.FC<RecentActivityListProps> = ({ senior }) => {
  const engagements = senior.todayEngagements || [];

  return (
    <Paper sx={{ p: 3, bgcolor: '#f5f5f5', mt: 3 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
        Today&apos;s Engagements
      </Typography>
      {engagements.length === 0 ? (
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          No check-ins or tasks recorded today.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {engagements.map((engagement) => {
            const tasks = engagement.tasksCompleted || [];
            const taskPoints = tasks.reduce((total, task) => total + (task.points || 0), 0);

            return (
              <Box
                key={engagement._id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#ffffff',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={engagement.session ? `${engagement.session} session` : 'Session'}
                    size="small"
                  />
                  {engagement.checkIn && <Chip label="Checked in" size="small" color="success" />}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiEmotions sx={{ color: '#f59e0b', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    {formatMood(engagement.mood)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: '#2563eb', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    {tasks.length
                      ? `${tasks.length} task${tasks.length === 1 ? '' : 's'} completed`
                      : 'No tasks completed'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ color: '#fbbf24', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    {taskPoints} pts earned this session
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
};

export default RecentActivityList;

