import React, { useState } from 'react';
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
import { Senior, getSeniorDetails } from '../api/mockData';
import SeniorDetailsHeader from './SeniorDetailsHeader';
import SeniorInfoCard from './SeniorInfoCard';
import RecentActivityList from './RecentActivityList';
import DialingModal from './DialingModal';

interface SeniorDetailsDialogProps {
  senior: Senior | null;
  open: boolean;
  onClose: () => void;
}

const SeniorDetailsDialog: React.FC<SeniorDetailsDialogProps> = ({ senior, open, onClose }) => {
  const [dialingOpen, setDialingOpen] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');

  const seniorDetails = senior ? getSeniorDetails(senior.id) : undefined;
  const healthStatus = seniorDetails?.healthStatus || 'No data available';
  const medications = seniorDetails?.medications || 'No data available';

  const handleVideoCall = () => {
    setCallType('video');
    setDialingOpen(true);
  };

  const handleVoiceCall = () => { 
    setCallType('voice');
    setDialingOpen(true);
  };

  const handleCloseDialing = () => {
    setDialingOpen(false);
  };

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
          startIcon={<VideoCall />}
          sx={{ flex: 1 }}
          onClick={handleVideoCall}
        >
          Video Call
        </Button>
        <Button
          variant="contained"
          startIcon={<Phone />}
          sx={{ flex: 1 }}
          onClick={handleVoiceCall}
        >
          Call Now
        </Button>
      </DialogActions>

      {/* Dialing Modal */}
      <DialingModal
        open={dialingOpen}
        onClose={handleCloseDialing}
        senior={senior}
        callType={callType}
      />
    </Dialog>
  );
};

export default SeniorDetailsDialog;

