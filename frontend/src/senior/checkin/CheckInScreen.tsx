import React, { useState, useEffect } from "react";
import { Box, Button, Card, Typography, Stack, CircularProgress, Alert } from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CoffeeIcon from "@mui/icons-material/Coffee";
import NightlightIcon from "@mui/icons-material/Nightlight";
import MicIcon from "@mui/icons-material/Mic";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { Mood, CheckIn, DailyProgress } from "../../types";

interface Props {
  onCheckIn: (mood: Mood) => void;
}

const CheckInScreen: React.FC<Props> = ({ onCheckIn }) => {
  const [selectedMood, setSelectedMood] = useState<Mood>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
    date: new Date().toDateString(),
    checkIns: [],
    totalCheckIns: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch check-in status from backend
  useEffect(() => {
    fetchCheckInStatus();
  }, []);

  const fetchCheckInStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/engagements/today', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch check-in status');
      }

      const data = await response.json();

      if (data.success) {
        // Convert backend engagements to CheckIn format
        const checkIns: CheckIn[] = data.engagements.map((eng: any) => ({
          id: eng._id,
          timestamp: eng.lastActiveAt,
          mood: eng.mood as Mood,
          session: eng.session as "morning" | "afternoon" | "evening",
        }));

        setDailyProgress({
          date: new Date().toDateString(),
          checkIns: checkIns,
          totalCheckIns: checkIns.length,
        });
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching check-in status:', err);
      setError('Failed to load check-in status');
    } finally {
      setLoading(false);
    }
  };

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
    (checkIn: CheckIn) => checkIn.session === currentSession
  );

  // Handle check-in
  const handleCheckIn = async () => {
    if (!selectedMood) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood: selectedMood,
          session: currentSession,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check in');
      }

      const data = await response.json();
      console.log('Check-in successful:', data);

      // Refresh check-in status from backend
      await fetchCheckInStatus();

      onCheckIn(selectedMood);
      setSelectedMood(null);
      setError(null);
    } catch (err: any) {
      console.error('Error during check-in:', err);
      setError(err.message || 'Failed to check in');
    } finally {
      setSubmitting(false);
    }
  };

  // Get next check-in time
  const getNextCheckInTime = () => {
    if (currentSession === 'morning') return 'this afternoon (after 12 PM)';
    if (currentSession === 'afternoon') return 'this evening (after 6 PM)';
    return 'tomorrow morning (after 12 AM)';
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error && !hasCheckedInThisSession) {
    return (
      <Box sx={{ flex: 1, p: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Show post-check-in content if user has checked in for this session
  if (hasCheckedInThisSession) {
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
                const checkIn = dailyProgress.checkIns.find((c: CheckIn) => c.session === session);
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

        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

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
            disabled={submitting}
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
            disabled={submitting}
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
            disabled={submitting}
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
          disabled={!selectedMood || submitting}
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
          {submitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : '✓ Check In'}
        </Button>
      </Box>
    </Box>
  );
};

export default CheckInScreen;
