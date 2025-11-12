import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";
import type { Contact } from "../../types";
import EndCallIcon from "@mui/icons-material/CallEnd";

interface Props {
  open: boolean;
  onClose: () => void;
  contact: Contact | null;
  type: 'voice' | 'video';
}

const DialingPlaceholderModal: React.FC<Props> = ({ open, onClose, contact, type }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 600,
          height: 420,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
        }
      }}
    >
      <DialogTitle sx={{ fontSize: 24, textAlign: 'center', width: '100%' }}>
        {type === 'voice' ? 'Calling...' : 'Video Calling...'}
      </DialogTitle>

      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          width: '100%',
          px: 4,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ mb: 2, fontSize: 20 }}>
            {contact ? `Dialing ${contact.name} (${type === 'voice' ? 'voice' : 'video'})` : 'Preparing call...'}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            onClick={onClose}
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              bgcolor: '#ef4444',
              '&:hover': { bgcolor: '#dc2626' },
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EndCallIcon sx={{ width: 30, height: 30 }} />
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default DialingPlaceholderModal;