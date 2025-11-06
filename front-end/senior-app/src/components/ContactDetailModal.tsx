import React from "react";
import { Box, Typography, Button, Modal } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import VideocamIcon from "@mui/icons-material/Videocam";
import type { Contact } from "../types";

interface Props {
  open: boolean;
  contact: Contact | null;
  onClose: () => void;
  onVoiceCall: (contact: Contact) => void;
  onVideoCall: (contact: Contact) => void;
}

const ContactDetailModal: React.FC<Props> = ({ 
  open, 
  contact, 
  onClose, 
  onVoiceCall, 
  onVideoCall 
}) => {
  if (!contact) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box sx={{
        bgcolor: '#f3f4f6',
        borderRadius: 4,
        p: 8,
        width: '90%',
        maxWidth: 500,
        outline: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Profile Circle */}
        <Box sx={{
          width: 160,
          height: 160,
          bgcolor: '#e5e7eb',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 56,
          fontWeight: 600,
          color: '#000000',
          mb: 4,
          border: '6px solid white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}>
          {contact.initials}
        </Box>

        {/* Contact Info */}
        <Typography sx={{ 
          fontSize: 28, 
          fontWeight: 600, 
          mb: 1,
          color: '#111827',
        }}>
          {contact.name}
        </Typography>
        <Typography sx={{ 
          fontSize: 18, 
          color: '#6b7280',
          mb: 6,
        }}>
          {contact.relationship}
        </Typography>

        {/* Voice Call Button */}
        <Button
          onClick={() => onVoiceCall(contact)}
          sx={{
            width: '100%',
            bgcolor: '#22c55e',
            color: 'white',
            py: 3,
            borderRadius: 3,
            fontSize: 18,
            fontWeight: 600,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            '&:hover': { bgcolor: '#16a34a' },
          }}
        >
          <PhoneIcon sx={{ width: 24, height: 24 }} />
          Voice Call
        </Button>

        {/* Video Call Button */}
        <Button
          onClick={() => onVideoCall(contact)}
          sx={{
            width: '100%',
            bgcolor: '#3b82f6',
            color: 'white',
            py: 3,
            borderRadius: 3,
            fontSize: 18,
            fontWeight: 600,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            '&:hover': { bgcolor: '#2563eb' },
          }}
        >
          <VideocamIcon sx={{ width: 24, height: 24 }} />
          Video Call
        </Button>

        {/* Back Button */}
        <Button
          onClick={onClose}
          sx={{
            width: '100%',
            bgcolor: '#e5e7eb',
            color: '#374151',
            py: 3,
            borderRadius: 3,
            fontSize: 18,
            fontWeight: 600,
            '&:hover': { bgcolor: '#d1d5db' },
          }}
        >
          Back
        </Button>
      </Box>
    </Modal>
  );
};

export default ContactDetailModal;