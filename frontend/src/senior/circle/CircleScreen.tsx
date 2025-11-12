import React, { useState, useRef } from "react";
import { Box, Typography, Card, Stack, Button, IconButton } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import PhoneIcon from "@mui/icons-material/Phone";
import StarIcon from "@mui/icons-material/Star";
import DialingPlaceholderModal from "./DialingPlaceholderModal";
import type { Contact } from "../../types";
import ContactDetailModal from "./ContactDetailModal";
import CreateNewContactModal from "./CreateNewContactModal";
import EditContactModal from "./EditContactModal";

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

  // Voice recognition for quick call
  const recognitionRef = useRef<any>(null);
  const [recording, setRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');

  // dialing placeholder modal state (used for voice/video calls)
  const [dialingOpen, setDialingOpen] = useState(false);
  const [dialingContact, setDialingContact] = useState<Contact | null>(null);
  const [dialingType, setDialingType] = useState<'voice' | 'video'>('voice');

  const createRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (ev: any) => {
      const text = ev.results[0][0].transcript.toLowerCase();
      setRecognizedText(text);
      // very simple parsing: "call [name]" or "video call [name]"
      if (text.includes('call')) {
        const isVideo = text.includes('video');
        const words = text.split(/\s+/);
        // naive name extraction: take last 2 words after 'call' / 'video call'
        const callIndex = words.lastIndexOf('call');
        const nameParts = words.slice(callIndex + 1);
        const nameQuery = nameParts.join(' ').trim();
        const found = contacts.find(c => c.name.toLowerCase().includes(nameQuery) || c.name.toLowerCase().startsWith(nameQuery));
        if (found) {
          setDialingContact(found);
          setDialingType(isVideo ? 'video' : 'voice');
          setDialingOpen(true);
        } else {
          // fallback: if no name found but single contact, call first
          if (contacts.length === 1) {
            setDialingContact(contacts[0]);
            setDialingType(isVideo ? 'video' : 'voice');
            setDialingOpen(true);
          }
        }
      }
    };
    rec.onerror = () => setRecording(false);
    rec.onend = () => setRecording(false);
    return rec;
  };

  const startRecognition = () => {
    if (recording) return;
    const rec = createRecognition();
    if (!rec) return;
    recognitionRef.current = rec;
    try { rec.start(); setRecording(true); setRecognizedText(''); } catch { setRecording(false); }
  };
  const stopRecognition = () => {
    const rec = recognitionRef.current;
    if (rec) { try { rec.stop(); } catch {} recognitionRef.current = null; }
    setRecording(false);
  };

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
    setDialingContact(contact);
    setDialingType('voice');
    setDialingOpen(true);
  };

  const handleVideoCall = (contact: Contact) => {
    setDialingContact(contact);
    setDialingType('video');
    setDialingOpen(true);
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

  const closeDialing = () => {
    setDialingOpen(false);
    setDialingContact(null);
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

        {/* Voice Search Card */}
        <Card sx={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #fce7f3 100%)',
          borderRadius: 2,
          p: 6,
          mb: 6,
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Typography sx={{ fontSize: 24 }}>🔍</Typography>
              <Typography sx={{ color: '#6b7280', fontSize: 20 }}>Press and hold the microphone and say a name to call</Typography>
            </Box>
            
            {recording && (
                <Box
                  sx={{
                    position: 'absolute',
                    mt: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: '#ff4d4f',
                      borderRadius: '50%',
                      boxShadow: '0 0 8px rgba(255, 77, 79, 0.6)',
                      animation: 'pulse 1s infinite',
                    }}
                  />
                  <Typography sx={{ color: '#ef4444', fontSize: 14 }}>
                    Listening...
                  </Typography>
                </Box>
              )}

            <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative', width: '100%' }}>              

              {/* Centered mic button */}
              <IconButton
                onMouseDown={startRecognition}
                onTouchStart={(e) => { e.preventDefault(); startRecognition(); }}
                onMouseUp={stopRecognition}
                onMouseLeave={() => { if (recording) stopRecognition(); }}
                onTouchEnd={(e) => { e.preventDefault(); stopRecognition(); }}
                sx={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  bgcolor: recording ? '#ef4444' : '#3b82f6',
                  '&:hover': { bgcolor: recording ? '#dc2626' : '#2563eb' },
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MicIcon sx={{ width: 30, height: 30 }} />
              </IconButton>
            </Box>

            {/* Detected text below the button*/}
            {recognizedText && (
              <Typography align="center" sx={{ color: '#6b7280', mt: 4, fontSize: 16 }}>
                Detected: "{recognizedText}"
              </Typography>
            )}
          </Box>
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
                  <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
                    Last call: {contact.lastCall}
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
            {contacts.map(contact => (
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

        <DialingPlaceholderModal
          open={dialingOpen}
          onClose={closeDialing}
          contact={dialingContact}
          type={dialingType}
        />
        
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