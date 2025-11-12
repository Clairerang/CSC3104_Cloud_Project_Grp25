import React from 'react';
import { Box, Typography, DialogTitle } from '@mui/material';
import { CaregiverSeniorCard } from '../types/caregiver';

interface SeniorDetailsHeaderProps {
  senior: CaregiverSeniorCard | null;
}

const SeniorDetailsHeader: React.FC<SeniorDetailsHeaderProps> = ({ senior }) => {
  return (
    <DialogTitle>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              bgcolor: '#1976d2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: 20,
            }}
          >
            {senior?.initials}
          </Box>
          {senior?.isOnline && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 16,
                height: 16,
                bgcolor: '#4caf50',
                borderRadius: '50%',
                border: '2px solid white',
              }}
            />
          )}
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {senior?.name}
          </Typography>
          <Typography sx={{ color: '#6b7280' }}>
            Last check-in: {senior?.lastCheckIn}
          </Typography>
        </Box>
      </Box>
    </DialogTitle>
  );
};

export default SeniorDetailsHeader;

