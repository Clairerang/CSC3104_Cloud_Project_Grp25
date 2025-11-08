import React from 'react';
import {
  Box,
  Typography,
  Card,
} from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import { Activity } from '../../api/mockData';
import ActivityCard from './ActivityCard';

interface ActivityListSectionProps {
  title: string;
  activities: Activity[];
  isCompleted?: boolean;
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
  onMarkCompleted?: (id: number) => void;
}

const ActivityListSection: React.FC<ActivityListSectionProps> = ({
  title,
  activities,
  isCompleted = false,
  onEdit,
  onDelete,
  onMarkCompleted,
}) => {
  if (isCompleted && activities.length === 0) {
    return null;
  }

  return (
    <Card sx={{ p: 4, mb: isCompleted ? 0 : 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        {!isCompleted && <CalendarToday sx={{ color: '#1976d2' }} />}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title} ({activities.length})
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {activities.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ color: '#6b7280' }}>
              {isCompleted 
                ? 'No completed activities' 
                : 'No upcoming activities scheduled'
              }
            </Typography>
          </Box>
        ) : (
          activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              isCompleted={isCompleted}
              onEdit={onEdit}
              onDelete={onDelete}
              onMarkCompleted={onMarkCompleted}
            />
          ))
        )}
      </Box>
    </Card>
  );
};

export default ActivityListSection;

