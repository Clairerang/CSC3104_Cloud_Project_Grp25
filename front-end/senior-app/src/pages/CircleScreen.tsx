import React, { useState } from "react";
import { Box, Typography, Card, Stack, Button } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import PhoneIcon from "@mui/icons-material/Phone";
import StarIcon from "@mui/icons-material/Star";
import type { Contact } from "../types";
import ContactDetailModal from "../components/ContactDetailModal";
import CreateNewContactModal from "../components/circle/CreateNewContactModal";
import EditContactModal from "../components/circle/EditContactModal";

interface Props {
  contacts: Contact[];
  onAddContact: (contact: Omit<Contact, "id">) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contact: Contact) => void;
}

const CircleScreen: React.FC<Props> = ({ contacts, onAddContact, onEditContact, onDeleteContact }) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setModalOpen(true);
  };

  const handleDirectCall = (contact: Contact, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent modal from opening
    console.log("Direct calling:", contact.name);
    // Add your direct call logic here
  };

  const handleVoiceCall = (contact: Contact) => {
    console.log("Voice calling:", contact.name);
    setModalOpen(false);
    // Add your voice call logic here
  };

  const handleVideoCall = (contact: Contact) => {
    console.log("Video calling:", contact.name);
    setModalOpen(false);
    // Add your video call logic here
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedContact(null);
  };

  const handleCreateContact = () => {
    setCreateModalOpen(true);
  };

  const handleSaveNewContact = (contact: Omit<Contact, "id">) => {
    onAddContact(contact);
    setCreateModalOpen(false);
  };

  const handleEditContact = (contact: Contact) => {
    setModalOpen(false);
    setEditModalOpen(true);
  };

  const handleSaveEditedContact = (contact: Contact) => {
    onEditContact(contact);
    setEditModalOpen(false);
    setSelectedContact(null);
  };

  const handleDeleteContact = (contact: Contact) => {
    onDeleteContact(contact);
    setEditModalOpen(false);
    setSelectedContact(null);
  };

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', pb: 20 }}>
      <Box sx={{ p: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
          }}>
            ❤️
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#0f766e' }}>
            My Loved Ones
          </Typography>
        </Box>

        {/* <Typography sx={{ color: '#6b7280', mb: 3, fontSize: 20 }}>
          Tap anyone to connect
        </Typography> */}

        {/* Voice Search Card */}
        <Card sx={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #fce7f3 100%)',
          borderRadius: 2,
          p: 6,
          mb: 6,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <Typography sx={{ fontSize: 24 }}>🔍</Typography>
            <Typography sx={{ color: '#6b7280', fontSize: 20 }}>Say a name to call</Typography>
          </Box>
          <Button sx={{
            ml: 'auto',
            width: 56,
            height: 56,
            bgcolor: '#3b82f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': { bgcolor: '#2563eb' },
          }}>
            <MicIcon sx={{ width: 24, height: 24, color: 'white' }} />
          </Button>
        </Card>

        {/* Favorites Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <StarIcon sx={{ width: 24, height: 24, color: '#eab308' }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Favorites
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            {contacts.filter(c => c.isFavorite).map(contact => (
              <Button 
                key={contact.id} 
                onClick={() => handleContactClick(contact)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  p: 0,
                  textTransform: 'none',
                  bgcolor: 'white',
                  boxShadow: 1,
                  '&:hover': { 
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s',
                  },
                }}
              >
                <Box sx={{
                  width: 80,
                  height: 80,
                  bgcolor: '#e5e7eb',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  color: '#000000ff',
                  mt: 3,
                }}>
                  {contact.initials}
                </Box>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 18 }}>
                    {contact.name}
                  </Typography>
                  <Typography sx={{ fontSize: 16, color: '#6b7280' }}>
                    {contact.relationship}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Box>
        </Box>

        {/* All Contacts Section */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              All Contacts
            </Typography>
            <Button
              variant="contained"
              onClick={handleCreateContact}
              sx={{
                bgcolor: '#3b82f6',
                '&:hover': { bgcolor: '#2563eb' },
                textTransform: 'none',
                px: 3,
                py: 1,
                fontSize: 16,
              }}
            >
              Create New Contact
            </Button>
          </Box>
          <Stack spacing={3}>
            {contacts.filter(c => !c.isFavorite).map(contact => (
              <Card 
                key={contact.id} 
                onClick={() => handleContactClick(contact)}
                sx={{
                  bgcolor: 'white',
                  borderRadius: 4,
                  p: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  '&:hover': { 
                    boxShadow: 3,
                    transition: 'all 0.2s',
                  },
                }}
              >
                <Box sx={{
                  width: 56,
                  height: 56,
                  bgcolor: '#e5e7eb',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  color: '#000000ff',
                }}>
                  {contact.initials}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 18 }}>
                    {contact.name}
                  </Typography>
                  <Typography sx={{ fontSize: 16, color: '#6b7280' }}>
                    {contact.relationship}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: '#9ca3af' }}>
                    Last call: {contact.lastCall}
                  </Typography>
                </Box>
                <Button 
                  onClick={(e) => handleDirectCall(contact, e)}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: '#f3f4f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': { bgcolor: '#22c55e' },
                    '&:hover .MuiSvgIcon-root': { color: 'white' },
                  }}
                >
                  <PhoneIcon sx={{ width: 24, height: 24, color: '#6b7280' }} />
                </Button>
              </Card>
            ))}
          </Stack>
        </Box>

        {/* Emergency Button */}
        {/* <Button sx={{
          width: '100%',
          mt: 6,
          bgcolor: '#dc2626',
          color: 'white',
          p: 5,
          borderRadius: 4,
          fontSize: 20,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          '&:hover': { bgcolor: '#b91c1c' },
        }}>
          <PhoneIcon sx={{ width: 24, height: 24 }} />
          Emergency: 911
        </Button> */}
      </Box>

      {/* Contact Detail Modal */}
      <ContactDetailModal
        open={modalOpen}
        contact={selectedContact}
        onClose={handleCloseModal}
        onVoiceCall={handleVoiceCall}
        onVideoCall={handleVideoCall}
        // onDelete={handleDeleteContact} 
        onEdit={handleEditContact}
      />

      {/* Create New Contact Modal */}
      <CreateNewContactModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleSaveNewContact}
      />

      {/* Edit Contact Modal */}
      <EditContactModal
        open={editModalOpen}
        contact={selectedContact}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveEditedContact}
        onDelete={handleDeleteContact}
      />
    </Box>
  );
};

export default CircleScreen;