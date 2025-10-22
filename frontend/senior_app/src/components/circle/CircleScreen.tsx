import React from "react";
import { Box, Typography, Card, Stack, Button } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import PhoneIcon from "@mui/icons-material/Phone";
import StarIcon from "@mui/icons-material/Star";
import type { Contact } from "../../types";

interface Props {
  contacts: Contact[];
}

const CircleScreen: React.FC<Props> = ({ contacts }) => {
  return (
    <Box sx={{ flex: 1, overflowY: 'auto', pb: 20 }}>
      <Box sx={{ p: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 6 }}>
          <Box sx={{
            width: 48,
            height: 48,
            bgcolor: '#ec4899',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}>
            ❤️
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#0f766e' }}>
            My Loved Ones
          </Typography>
        </Box>

        <Typography sx={{ color: '#6b7280', mb: 6 }}>
          Tap anyone to connect
        </Typography>

        {/* Voice Search Card */}
        <Card sx={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #fce7f3 100%)',
          borderRadius: 4,
          p: 6,
          mb: 6,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <Typography sx={{ fontSize: 24 }}>🔍</Typography>
            <Typography sx={{ color: '#6b7280' }}>Say a name to call</Typography>
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
              <Button key={contact.id} sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                p: 0,
                textTransform: 'none',
              }}>
                <Box sx={{
                  width: 80,
                  height: 80,
                  bgcolor: '#e5e7eb',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  color: '#9ca3af',
                }}>
                  {contact.initials}
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 600 }}>
                    {contact.name}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
                    {contact.relationship}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Box>
        </Box>

        {/* All Contacts Section */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 4 }}>
            All Contacts
          </Typography>
          <Stack spacing={3}>
            {contacts.filter(c => !c.isFavorite).map(contact => (
              <Card key={contact.id} sx={{
                bgcolor: 'white',
                borderRadius: 4,
                p: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <Box sx={{
                  width: 56,
                  height: 56,
                  bgcolor: '#e5e7eb',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  color: '#9ca3af',
                }}>
                  {contact.initials}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 18 }}>
                    {contact.name}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
                    {contact.relationship}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: '#9ca3af' }}>
                    Last call: {contact.lastCall}
                  </Typography>
                </Box>
                <Button sx={{
                  width: 48,
                  height: 48,
                  bgcolor: '#f3f4f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': { bgcolor: '#e5e7eb' },
                }}>
                  <PhoneIcon sx={{ width: 24, height: 24, color: '#6b7280' }} />
                </Button>
              </Card>
            ))}
          </Stack>
        </Box>

        {/* Emergency Button */}
        <Button sx={{
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
        </Button>
      </Box>
    </Box>
  );
};

export default CircleScreen;