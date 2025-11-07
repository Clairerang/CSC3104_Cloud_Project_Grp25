import React from "react";
import { Box, Typography, Button, Modal, IconButton } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import VideocamIcon from "@mui/icons-material/Videocam";
import EditIcon from "@mui/icons-material/Edit";        
import CloseIcon from "@mui/icons-material/Close";      
import type { Contact } from "../types";                 

interface Props {
  open: boolean;
  contact: Contact | null;
  onClose: () => void;
  onVoiceCall: (contact: Contact) => void;
  onVideoCall: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
}

const ContactDetailModal: React.FC<Props> = ({ 
  open, 
  contact, 
  onClose, 
  onVoiceCall, 
  onVideoCall,
  onEdit,
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
        borderRadius: 6,
        p: 8,
        width: '90%',
        maxWidth: 500,
        outline: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}>
        {/* Close Button - Top Right */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 40,
            top: 40,
            color: '#6b7280',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <CloseIcon sx={{ width: 32, height: 32 }} />
        </IconButton>

        {/* Profile Circle */}
        <Box sx={{
          width: 160,
          height: 160,
          bgcolor: '#e5e7eb',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 46,
          fontWeight: 600,
          color: '#000000',
          mb: 4,
          mt: 2,
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
          fontSize: 20, 
          color: '#6b7280',
          mb: 1,
        }}>
          {contact.relationship}
        </Typography>
        <Typography sx={{ 
          fontSize: 20, 
          color: '#6b7280',
          mb: 4,
        }}>
          {contact.phoneNumber}
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
            fontSize: 22,
            fontWeight: 600,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            '&:hover': { bgcolor: '#16a34a' },
          }}
        >
          <PhoneIcon sx={{ width: 28, height: 28 }} />
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
            fontSize: 22,
            fontWeight: 600,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            '&:hover': { bgcolor: '#2563eb' },
          }}
        >
          <VideocamIcon sx={{ width: 28, height: 28 }} />
          Video Call
        </Button>

        {/* Edit Contact Button */}
        <Button
          onClick={() => onEdit(contact)}
          sx={{
            width: '100%',
            bgcolor: '#939393ff',
            color: 'white',
            py: 3,
            borderRadius: 3,
            fontSize: 22,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            '&:hover': { bgcolor: '#717171ff' },
          }}
        >
          <EditIcon sx={{ width: 28, height: 28 }} />
          Edit Contact
        </Button>
      </Box>
    </Modal>
  );
};

export default ContactDetailModal;