import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Schedule, Phone, Medication } from '@mui/icons-material';
import { getRecentActivitiesBySeniorId, RecentActivity } from '../../api/mockData';

interface RecentActivityListProps {
  seniorId: string;
}

const RecentActivityList: React.FC<RecentActivityListProps> = ({ seniorId }) => {
  const activities = getRecentActivitiesBySeniorId(seniorId);

  const getIcon = (iconType: RecentActivity['iconType']) => {
    const iconStyle = { color: '#6b7280', fontSize: 16 };
    switch (iconType) {
      case 'schedule':
        return <Schedule sx={iconStyle} />;
      case 'phone':
        return <Phone sx={iconStyle} />;
      case 'medication':
        return <Medication sx={iconStyle} />;
      default:
        return <Schedule sx={iconStyle} />;
    }
  };

  return (
    <Paper sx={{ p: 3, bgcolor: '#f5f5f5', mt: 3 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
        Recent Activity
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {activities.map((activity) => (
          <Box key={activity.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getIcon(activity.iconType)}
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              {activity.text}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default RecentActivityList;

