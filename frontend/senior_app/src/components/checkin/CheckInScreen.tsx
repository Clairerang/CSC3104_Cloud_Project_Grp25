import React, { useState } from "react";
import { Box, Button, Card, Typography, Stack } from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CoffeeIcon from "@mui/icons-material/Coffee";
import MicIcon from "@mui/icons-material/Mic";
import type { Mood } from "../../types";

interface Props {
  onCheckIn: (mood: Mood) => void;
}

const CheckInScreen: React.FC<Props> = ({ onCheckIn }) => {
  const [selectedMood, setSelectedMood] = useState<Mood>(null);

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', pb: 20 }}>
      <Box sx={{ p: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <WbSunnyIcon sx={{ width: 40, height: 40, color: '#f97316' }} />
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#ea580c' }}>
                Good Morning!
              </Typography>
            </Box>
          </Box>
          {/* <CoffeeIcon sx={{ width: 40, height: 40, color: '#f97316' }} /> */}
        </Box>
        
        <Typography sx={{ color: '#000000ff', fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', mb: 2 }}>
          How are you feeling today?
        </Typography>

        {/* Microphone Card */}
        <Card sx={{ bgcolor: 'white', borderRadius: 4, boxShadow: 1, p: 8, mb: 6 }}>
          <Typography align="center" sx={{ color: '#6b7280', mb: 6, fontSize: 20 }}>
            Press and hold the microphone and tell me how you're doing
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              sx={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                bgcolor: '#3b82f6',
                '&:hover': { bgcolor: '#2563eb' },
                transition: 'background-color 0.2s',
              }}
            >
              <MicIcon sx={{ width: 40, height: 40, color: 'white' }} />
            </Button>
          </Box>
        </Card>

        <Typography align="center" sx={{ color: '#6b7280', mb: 4, fontSize: 20 }}>
          Or tap one below:
        </Typography>

        {/* Mood Buttons */}
        <Stack spacing={3}>
          <Button
            onClick={() => setSelectedMood('great')}
            sx={{
              width: '100%',
              p: 4,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s',
              bgcolor: selectedMood === 'great' ? '#abfec8ff' : '#b1f8c7ff',
              border: selectedMood === 'great' ? '2px solid #16a34a' : 'none',
              '&:hover': {
                bgcolor: selectedMood === 'great' ? '#abfec8ff' : '#e1fae9ff',
              },
            }}
          >
            <Box sx={{
              width: 48,
              height: 48,
              bgcolor: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}>
              😊
            </Box>
            <Typography sx={{ fontSize: 20, fontWeight: 600 }}>
              Great!
            </Typography>
          </Button>

          <Button
            onClick={() => setSelectedMood('okay')}
            sx={{
              width: '100%',
              p: 4,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s',
              bgcolor: selectedMood === 'okay' ? '#fee478ff' : '#fdeca8ff',
              border: selectedMood === 'okay' ? '2px solid #eab308' : 'none',
              '&:hover': {
                bgcolor: selectedMood === 'okay' ? '#fee478ff' : '#fff8dbff',
              },
            }}
          >
            <Box sx={{
              width: 48,
              height: 48,
              bgcolor: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}>
              😐
            </Box>
            <Typography sx={{ fontSize: 20, fontWeight: 600 }}>
              Okay
            </Typography>
          </Button>

          <Button
            onClick={() => setSelectedMood('not-well')}
            sx={{
              width: '100%',
              p: 4,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s',
              bgcolor: selectedMood === 'not-well' ? '#fdcdcdff' : '#ffb0b0ff',
              border: selectedMood === 'not-well' ? '2px solid #ea0c0cff' : 'none',
              '&:hover': {
                bgcolor: selectedMood === 'not-well' ? '#fdcdcdff' : '#ffe4e4ff',
              },
            }}
          >
            <Box sx={{
              width: 48,
              height: 48,
              bgcolor: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}>
              ☹️
            </Box>
            <Typography sx={{ fontSize: 20, fontWeight: 600 }}>
              Not Well
            </Typography>
          </Button>
        </Stack>

        <Button
          onClick={() => onCheckIn(selectedMood)}
          disabled={!selectedMood}
          sx={{
            width: '100%',
            mt: 6,
            p: 4,
            borderRadius: 4,
            color: 'white',
            fontSize: 18,
            fontWeight: 600,
            transition: 'all 0.2s',
            bgcolor: selectedMood ? '#16a34a' : '#d1d5db',
            '&:hover': {
              bgcolor: selectedMood ? '#15803d' : '#d1d5db',
            },
            '&:disabled': {
              bgcolor: '#d1d5db',
              cursor: 'not-allowed',
            },
          }}
        >
          ✓ I'm Okay - Check In
        </Button>
      </Box>
    </Box>
  );
};

export default CheckInScreen;