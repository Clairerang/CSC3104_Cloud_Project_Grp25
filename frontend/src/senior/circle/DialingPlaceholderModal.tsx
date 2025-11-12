import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import type { Contact } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  contact: Contact | null;
  type: 'voice' | 'video';
}

const DialingPlaceholderModal: React.FC<Props> = ({ open, onClose, contact, type }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{type === 'voice' ? 'Calling...' : 'Video Calling...'}</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          {contact ? `Dialing ${contact.name} (${type === 'voice' ? 'voice' : 'video'})` : 'Preparing call...'}
        </Typography>
        <Typography color="text.secondary">This is a placeholder dialing modal. Integrate real call flow here.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>End</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialingPlaceholderModal;