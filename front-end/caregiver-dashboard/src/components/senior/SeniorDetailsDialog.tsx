import React from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Phone,
  VideoCall,
  Favorite,
  Medication,
} from '@mui/icons-material';
import { Senior, getSeniorDetails } from '../../api/mockData';
import SeniorDetailsHeader from './SeniorDetailsHeader';
import SeniorInfoCard from './SeniorInfoCard';
import RecentActivityList from './RecentActivityList';

interface SeniorDetailsDialogProps {
  senior: Senior | null;
  open: boolean;
  onClose: () => void;
}

const SeniorDetailsDialog: React.FC<SeniorDetailsDialogProps> = ({ senior, open, onClose }) => {
  const seniorDetails = senior ? getSeniorDetails(senior.id) : undefined;
  const healthStatus = seniorDetails?.healthStatus || 'No data available';
  const medications = seniorDetails?.medications || 'No data available';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <SeniorDetailsHeader senior={senior} />
      <DialogContent>
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
            <SeniorInfoCard
              icon={<Favorite />}
              title="Health Status"
              content={healthStatus}
              iconColor="#f44336"
            />
            <SeniorInfoCard
              icon={<Medication />}
              title="Medications"
              content={medications}
              iconColor="#7b1fa2"
            />
          </Box>

          {senior && <RecentActivityList seniorId={senior.id} />}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button
          variant="contained"
          startIcon={<Phone />}
          sx={{ flex: 1 }}
        >
          Call Now
        </Button>
        <Button
          variant="outlined"
          startIcon={<VideoCall />}
          sx={{ flex: 1 }}
        >
          Send Message
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeniorDetailsDialog;

