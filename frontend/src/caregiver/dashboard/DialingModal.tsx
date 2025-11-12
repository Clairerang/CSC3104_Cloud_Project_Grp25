import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Fade,
} from '@mui/material';
import {
  Phone,
  CallEnd,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
} from '@mui/icons-material';
import { Senior } from '../api/mockData';

interface DialingModalProps {
  open: boolean;
  onClose: () => void;
  senior: Senior | null;
  callType: 'voice' | 'video'; // 'voice' for call, 'video' for video call
}

const DialingModal: React.FC<DialingModalProps> = ({ open, onClose, senior, callType }) => {
  const [dialingTime, setDialingTime] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');

  // Simulate dialing sequence
  useEffect(() => {
    if (!open) {
      setDialingTime(0);
      setIsConnected(false);
      setCallDuration(0);
      return;
    }

    const dialingTimer = setTimeout(() => {
      setIsConnected(true);
    }, 3000); // Simulate 3 seconds of dialing

    return () => clearTimeout(dialingTimer);
  }, [open]);

  // Simulate call duration
  useEffect(() => {
    if (!isConnected || !open) return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, open]);

  // Simulate dialing ring sound effect
  useEffect(() => {
    if (!open || isConnected) return;

    const ringTimer = setInterval(() => {
      setDialingTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(ringTimer);
  }, [open, isConnected]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setIsConnected(false);
    onClose();
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  return (
    <Dialog
      open={open}
      onClose={handleEndCall}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          backgroundColor: isConnected ? '#1a1a1a' : '#0f0f0f',
          borderRadius: 2,
        },
      }}
    >
      <DialogContent
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '500px',
          background: isConnected
            ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
          color: 'white',
        }}
      >
        {/* Profile Avatar */}
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            fontWeight: 700,
            mb: 3,
            boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
          }}
        >
          {senior?.initials}
        </Box>

        {/* Senior Name */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            textAlign: 'center',
            color: 'white',
          }}
        >
          {senior?.name}
        </Typography>

        {/* Call Type */}
        <Typography
          sx={{
            fontSize: 14,
            color: '#90caf9',
            mb: 3,
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontWeight: 600,
          }}
        >
          {callType === 'video' ? '📹 Video Call' : '☎️ Voice Call'}
        </Typography>

        {/* Status or Duration */}
        <Box sx={{ mb: 4, textAlign: 'center', minHeight: 60 }}>
          {!isConnected ? (
            <Fade in={!isConnected}>
              <Box>
                <CircularProgress
                  size={40}
                  sx={{
                    color: '#90caf9',
                    mb: 2,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 18,
                    color: '#90caf9',
                    fontWeight: 600,
                  }}
                >
                  Dialing...
                </Typography>
              </Box>
            </Fade>
          ) : (
            <Fade in={isConnected}>
              <Box>
                <Typography
                  sx={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: '#4caf50',
                    fontFamily: 'monospace',
                    letterSpacing: 2,
                  }}
                >
                  {formatTime(callDuration)}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    color: '#4caf50',
                    mt: 1,
                    fontWeight: 600,
                  }}
                >
                  Connected
                </Typography>
              </Box>
            </Fade>
          )}
        </Box>

        {/* Control Buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
            mb: 3,
          }}
        >
          {/* Mute Button */}
          <IconButton
            onClick={handleToggleMute}
            disabled={!isConnected}
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: isMuted ? '#f44336' : '#424242',
              color: 'white',
              '&:hover': {
                backgroundColor: isMuted ? '#d32f2f' : '#616161',
              },
              '&:disabled': {
                backgroundColor: '#757575',
                color: '#bdbdbd',
              },
              transition: 'all 0.2s',
            }}
          >
            {isMuted ? <MicOff /> : <Mic />}
          </IconButton>

          {/* Video Button (only for video calls) */}
          {callType === 'video' && (
            <IconButton
              onClick={handleToggleVideo}
              disabled={!isConnected}
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: isVideoOn ? '#1976d2' : '#f44336',
                color: 'white',
                '&:hover': {
                  backgroundColor: isVideoOn ? '#1565c0' : '#d32f2f',
                },
                '&:disabled': {
                  backgroundColor: '#757575',
                  color: '#bdbdbd',
                },
                transition: 'all 0.2s',
              }}
            >
              {isVideoOn ? <Videocam /> : <VideocamOff />}
            </IconButton>
          )}

          {/* End Call Button */}
          <IconButton
            onClick={handleEndCall}
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: '#f44336',
              color: 'white',
              '&:hover': {
                backgroundColor: '#d32f2f',
              },
              transition: 'all 0.2s',
            }}
          >
            <CallEnd />
          </IconButton>
        </Box>

        {/* Connection Status */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            justify: 'center',
            mt: 2,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isConnected ? '#4caf50' : '#ff9800',
              animation: isConnected
                ? 'none'
                : 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.5 },
                '100%': { opacity: 1 },
              },
            }}
          />
          <Typography sx={{ fontSize: 12, color: '#90caf9' }}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DialingModal;
