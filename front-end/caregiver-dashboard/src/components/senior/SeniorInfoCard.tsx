import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Favorite, Medication } from '@mui/icons-material';

interface SeniorInfoCardProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  iconColor: string;
}

const SeniorInfoCard: React.FC<SeniorInfoCardProps> = ({ icon, title, content, iconColor }) => {
  return (
    <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box sx={{ color: iconColor }}>
          {icon}
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#6b7280' }}>
        {content}
      </Typography>
    </Paper>
  );
};

export default SeniorInfoCard;

