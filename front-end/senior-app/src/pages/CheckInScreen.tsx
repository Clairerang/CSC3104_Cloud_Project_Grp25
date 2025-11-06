import React, { useState, useEffect } from "react";
import { Box, Button, Card, Typography, Stack } from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CoffeeIcon from "@mui/icons-material/Coffee";
import NightlightIcon from "@mui/icons-material/Nightlight";
import MicIcon from "@mui/icons-material/Mic";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { Mood, CheckIn, DailyProgress } from "../types";

interface Props {
  onCheckIn: (mood: Mood) => void;
}

const CheckInScreen: React.FC<Props> = ({ onCheckIn }) => {
  const [selectedMood, setSelectedMood] = useState<Mood>(null);
  
  // Initialize state from localStorage for persistence
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>(() => {
    const stored = localStorage.getItem('dailyProgress');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if it's still the same day
      if (parsed.date === new Date().toDateString()) {
        return parsed;
      }
    }
    // Return fresh state if no data or new day
    return {
      date: new Date().toDateString(),
      checkIns: [],
      totalCheckIns: 0,
    };
  });

  // Save to localStorage whenever dailyProgress changes
  useEffect(() => {
    localStorage.setItem('dailyProgress', JSON.stringify(dailyProgress));
  }, [dailyProgress]);

  // Determine current session based on time
  const getCurrentSession = (): "morning" | "afternoon" | "evening" => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";        // 12 AM - 11:59 AM
    if (hour < 18) return "afternoon";       // 12 PM - 5:59 PM  
    return "evening";                         // 6 PM - 11:59 PM
  };
  
  const currentSession = getCurrentSession();

  // Get greeting and icon based on session
  const getSessionInfo = () => {
    switch (currentSession) {
      case "morning":
        return {
          greeting: "Good Morning!",
          icon: <WbSunnyIcon sx={{ width: 40, height: 40, color: '#f97316' }} />,
          question: "How are you feeling this morning?",
          color: '#f97316'
        };
      case "afternoon":
        return {
          greeting: "Good Afternoon!",
          icon: <CoffeeIcon sx={{ width: 40, height: 40, color: '#ea580c' }} />,
          question: "How are you feeling this afternoon?",
          color: '#ea580c'
        };
      case "evening":
        return {
          greeting: "Good Evening!",
          icon: <NightlightIcon sx={{ width: 40, height: 40, color: '#7c3aed' }} />,
          question: "How are you feeling this evening?",
          color: '#7c3aed'
        };
    }
  };

  const sessionInfo = getSessionInfo();

  // Check if user has already checked in for this session
  const hasCheckedInThisSession = dailyProgress.checkIns.some(
    checkIn => checkIn.session === currentSession
  );

  // Handle check-in
  const handleCheckIn = () => {
    if (!selectedMood) return;

    const newCheckIn: CheckIn = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      mood: selectedMood,
      session: currentSession,
    };

    const updatedProgress: DailyProgress = {
      ...dailyProgress,
      checkIns: [...dailyProgress.checkIns, newCheckIn],
      totalCheckIns: dailyProgress.totalCheckIns + 1,
    };

    setDailyProgress(updatedProgress);
    onCheckIn(selectedMood);
    setSelectedMood(null); // Reset mood selection
  };

  // Get next check-in time
  const getNextCheckInTime = () => {
    if (currentSession === 'morning') return 'this afternoon (after 12 PM)';
    if (currentSession === 'afternoon') return 'this evening (after 6 PM)';
    return 'tomorrow morning (after 12 AM)';
  };

  // Show post-check-in content if user has checked in for this session
  if (hasCheckedInThisSession) {
    const completedCheckIn = dailyProgress.checkIns.find(
      checkIn => checkIn.session === currentSession
    );

    return (
      <Box sx={{ flex: 1, overflowY: 'auto', pb: 20 }}>
        <Box sx={{ p: 6 }}>
          {/* Success Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
            <CheckCircleIcon sx={{ width: 60, height: 60, color: '#16a34a', mr: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#16a34a' }}>
              Check-in Complete!
            </Typography>
          </Box>


          {/* Your Mood Today */}
          <Card sx={{ bgcolor: 'white', borderRadius: 4, boxShadow: 1, p: 4, mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#374151' }}>
              Your Mood Today
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              {['morning', 'afternoon', 'evening'].map((session) => {
                const checkIn = dailyProgress.checkIns.find(c => c.session === session);
                const emoji = checkIn?.mood === 'great' ? '😊' : 
                             checkIn?.mood === 'okay' ? '😐' : 
                             checkIn?.mood === 'not-well' ? '☹️' : '⚪';
                const completed = !!checkIn;
                
                return (
                  <Box key={session} sx={{ textAlign: 'center', flex: 1 }}>
                    <Box sx={{
                      width: 60,
                      height: 60,
                      bgcolor: completed ? '#f0fdf4' : '#f3f4f6',
                      border: completed ? '3px solid #16a34a' : '2px solid #d1d5db',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      mx: 'auto',
                      mb: 2
                    }}>
                      {emoji}
                    </Box>
                    <Typography sx={{ 
                      fontSize: 16, 
                      fontWeight: 600, 
                      color: completed ? '#1f2937' : '#9ca3af',
                      textTransform: 'capitalize'
                    }}>
                      {session}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Card>

          {/* Next Check-in Reminder */}
          {dailyProgress.totalCheckIns < 3 && (
            <Card sx={{ bgcolor: '#f0f9ff', borderRadius: 4, p: 4, mb: 4 }}>
              <Typography sx={{ fontSize: 18, color: '#1e40af', textAlign: 'center', fontWeight: 500 }}>
                ⏰ Next check-in: {getNextCheckInTime()}
              </Typography>
            </Card>
          )}

          {/* Celebration for completing all check-ins */}
          {dailyProgress.totalCheckIns === 3 && (
            <Card sx={{ bgcolor: '#f0fdf4', borderRadius: 4, p: 4, border: '2px solid #16a34a' }}>
              <Typography sx={{ fontSize: 18, color: '#166534', textAlign: 'center', fontWeight: 500 }}>
                🎉 Amazing! You've completed all your check-ins today!
              </Typography>
            </Card>
          )}

        </Box>
      </Box>
    );
  }

  // Show check-in form if user hasn't checked in for this session
  return (
    <Box sx={{ flex: 1, overflowY: 'auto', pb: 20 }}>
      <Box sx={{ p: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {sessionInfo.icon}
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: sessionInfo.color }}>
                {sessionInfo.greeting}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Typography sx={{ color: '#000000ff', fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', mb: 2 }}>
          {sessionInfo.question}
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
          onClick={handleCheckIn}
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
          ✓ Check In
        </Button>
      </Box>
    </Box>
  );
};

export default CheckInScreen;