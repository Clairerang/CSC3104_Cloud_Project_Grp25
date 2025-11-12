import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Card, Typography, Stack, CircularProgress, Alert, IconButton } from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CoffeeIcon from "@mui/icons-material/Coffee";
import NightlightIcon from "@mui/icons-material/Nightlight";
import MicIcon from "@mui/icons-material/Mic";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { Mood, CheckIn, DailyProgress } from "../../types";
import VoiceConfirmModal from "./VoiceConfirmModal";

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

  // Voice states
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [detectedMood, setDetectedMood] = useState<Mood | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const recognitionRef = useRef<any>(null);

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

  // Voice recognition helper
  const getSpeechRecognition = () => {
    const win = window as any;
    return win.webkitSpeechRecognition || win.SpeechRecognition || null;
  };

  const parseMoodFromText = (text: string): Mood | null => {
    if (!text) return null;
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("great")) {
      return "great";
    }
    if (lowerText.includes("okay")) {
      return "okay";
    }
    if (lowerText.includes("not well")) {
      return "not-well";
    }
    
    return null;
  };

  const startRecognition = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    setTranscript("");
    setDetectedMood(null);

    try {
      const recognition = new SpeechRecognition();
      // attach a helper field on the instance to keep the latest transcript accessible across handlers
      recognition.latestTranscript = "";
      recognitionRef.current = recognition;
      
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setRecognizing(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const currentTranscript = (finalTranscript || interimTranscript).trim();
        // store latest transcript on the recognition instance to avoid stale state in onend
        if (recognitionRef.current) recognitionRef.current.latestTranscript = currentTranscript;
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event);
        setError("Voice recognition error. Please try again.");
        setRecognizing(false);
      };

      recognition.onend = () => {
        setRecognizing(false);
        const finalText = (recognitionRef.current?.latestTranscript || "").trim();
        setTranscript(finalText);
        const mood = parseMoodFromText(finalText);
        setDetectedMood(mood);
        setModalOpen(true);
      };

      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setError("Could not start voice recording");
      setRecognizing(false);
    }
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("Error stopping recognition:", err);
        setRecognizing(false);
        const latest = recognitionRef.current?.latestTranscript || transcript;
        const mood = parseMoodFromText(latest);
        setDetectedMood(mood);
        setTranscript(latest);
        setModalOpen(true);
      }
    } else {
      const mood = parseMoodFromText(transcript);
      setDetectedMood(mood);
      setModalOpen(true);
    }
  };

  // submit check in
  const submitCheckIn = async (mood: Mood) => {
    if (!mood) {
      setError("Could not detect mood. Please record again or select manually.");
      return;
    }

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
          mood,
          session: currentSession,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check in');
      }

      const data = await response.json();
      console.log('Check-in successful:', data);

      // update local daily progress to mark session as checked in
      const newCheckIn: CheckIn = {
        id: data.engagementId || Math.random().toString(36).slice(2),
        timestamp: new Date().toISOString(),
        mood,
        session: currentSession,
      };

      setDailyProgress(prev => {
        const already = prev.checkIns.some(c => c.session === currentSession);
        if (already) return { ...prev };
        const updated = [...prev.checkIns, newCheckIn];
        return {
          ...prev,
          checkIns: updated,
          totalCheckIns: updated.length,
        };
      });

      onCheckIn(mood);
      setSelectedMood(null);
      setError(null);
    } catch (err: any) {
      console.error('Error during check-in:', err);
      setError(err.message || 'Failed to check in');
    } finally {
      setSubmitting(false);
    }
  };

  // existing handleCheckIn now delegates to submitCheckIn
  const handleCheckIn = async () => {
    if (!selectedMood) return;
    await submitCheckIn(selectedMood);
  };

  // Handlers for modal actions
  const handleModalRecordAgain = () => {
    setModalOpen(false);
    setTranscript("");
    setDetectedMood(null);
    // Optionally restart recognition immediately
    // setTimeout(() => startRecognition(), 100);
  };

  const handleModalConfirm = async () => {
    setModalOpen(false);
    if (detectedMood) {
      // local update so UI reflects checked-in immediately
      setSelectedMood(detectedMood);

      const newCheckIn: CheckIn = {
        id: 'local-' + Math.random().toString(36).slice(2),
        timestamp: new Date().toISOString(),
        mood: detectedMood,
        session: currentSession,
      };

      setDailyProgress(prev => {
        const already = prev.checkIns.some(c => c.session === currentSession);
        if (already) return prev;
        const updated = [...prev.checkIns, newCheckIn];
        return {
          ...prev,
          checkIns: updated,
          totalCheckIns: updated.length,
        };
      });

      onCheckIn(detectedMood);

      // attempt to persist in background; submitCheckIn will detect already present and avoid duplicate
      submitCheckIn(detectedMood).catch(() => {
        // error handled inside submitCheckIn; keep optimistic state
      });
    } else {
      setError("Could not detect mood. Please try again or select manually.");
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
      <VoiceConfirmModal
        open={modalOpen}
        mood={detectedMood}
        transcript={transcript}
        onClose={() => setModalOpen(false)}
        onRecordAgain={handleModalRecordAgain}
        onConfirm={handleModalConfirm}
      />

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
          
          <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            {recognizing && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '-32px',
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

            <IconButton
              onMouseDown={startRecognition}
              onMouseUp={stopRecognition}
              onMouseLeave={() => {
                if (recognizing) stopRecognition();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                startRecognition();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                stopRecognition();
              }}
              sx={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                bgcolor: recognizing ? '#ef4444' : '#3b82f6',
                '&:hover': {
                  bgcolor: recognizing ? '#dc2626' : '#2563eb',
                },
                transition: 'background-color 0.2s',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MicIcon sx={{ width: 40, height: 40 }} />
            </IconButton>
          </Box>

          {transcript && (
            <Typography align="center" sx={{ color: '#6b7280', mt: 4, fontSize: 16 }}>
              Detected: "{transcript}"
            </Typography>
          )}
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
