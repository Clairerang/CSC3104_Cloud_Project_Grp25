import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stack,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

interface MorningStretchProps {
  onComplete: () => void;
  onBack: () => void;
}

const stretches = [
  {
    id: 1,
    name: 'Neck Rolls',
    description: 'Slowly roll your head in a circle, first clockwise, then counter-clockwise',
    duration: 30,
    image: '🙆',
    videoUrl: '/videos/neck-rolls.mp4',
  },
  {
    id: 2,
    name: 'Shoulder Shrugs',
    description: 'Lift your shoulders up towards your ears, hold for 3 seconds, then release',
    duration: 30,
    image: '💪',
    videoUrl: '/videos/shoulder-shrugs.mp4',
  },
  {
    id: 3,
    name: 'Arm Circles',
    description: 'Extend your arms out to the sides and make small circles',
    duration: 30,
    image: '🤸',
    videoUrl: '/videos/arm-circles.mp4',
  },
  {
    id: 4,
    name: 'Seated Twist',
    description: 'Sit up straight and gently twist your torso to the left, then to the right',
    duration: 30,
    image: '🧘',
    videoUrl: '/videos/seated-twist.mp4',
  },
  {
    id: 5,
    name: 'Ankle Rolls',
    description: 'Lift one foot and rotate your ankle in circles, then switch feet',
    duration: 30,
    image: '🦶',
    videoUrl: '/videos/ankle-rolls.mp4',
  },
];

export function MorningStretch({ onComplete, onBack }: MorningStretchProps) {
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(stretches[0].duration);
  const [isPaused, setIsPaused] = useState(false);
  const [completed, setCompleted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

useEffect(() => {
  if (!started || isPaused || completed) return;

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        if (currentStep < stretches.length - 1) {
          // Move to next step
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          return stretches[nextStep].duration;
        } else {
          setCompleted(true);
          return 0;
        }
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [started, isPaused, currentStep, completed]);

  // Play video when exercise changes or paused state changes
  useEffect(() => {
    if (videoRef.current && started && !completed) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.log('Video play failed:', err);
        });
      }
    }
  }, [currentStep, isPaused, started, completed]);

  const handleStart = () => {
    setStarted(true);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleFinish = () => {
    onComplete();
  };

  const currentStretch = stretches[currentStep];
  const progress = ((currentStep + 1) / stretches.length) * 100;

  if (completed) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #c8e6c9, #ffffff)',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 120, color: '#4caf50', mb: 3 }} />
          <Typography variant="h3" gutterBottom sx={{ color: '#2e7d32' }}>
            Great Job!
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            You completed all stretching exercises!
          </Typography>

          <Card sx={{ mb: 3, bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography variant="h3" sx={{ color: '#4caf50', mb: 1 }}>
                +10 Points Earned!
              </Typography>
              <Typography variant="h5" color="text.secondary">
                Keep up the great work with your daily exercises!
              </Typography>
            </CardContent>
          </Card>

          <Stack spacing={2}>
            <Button
              variant="contained"
              size="large"
              onClick={handleFinish}
              sx={{ minHeight: 50, bgcolor: '#4caf50', fontSize: 20, '&:hover': { bgcolor: '#388e3c' } }}
            >
              Done
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                setStarted(false);
                setCurrentStep(0);
                setTimeLeft(stretches[0].duration);
                setCompleted(false);
              }}
              sx={{ minHeight: 60 }}
            >
              Do It Again
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  }

  if (!started) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #c8e6c9, #ffffff)',
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            size="large"
            sx={{ mb: 3, minHeight: 50 }}
          >
            Back to Activities
          </Button>

          <Card sx={{ mb: 3, bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="h3" gutterBottom sx={{ color: '#2e7d32' }}>
                  Morning Stretch
                </Typography>
                <Typography variant="h5" color="text.secondary">
                  5 gentle exercises to start your day
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                What you'll do:
              </Typography>
              <Stack spacing={2}>
                {stretches.map((stretch, index) => (
                  <Box
                    key={stretch.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1,
                      bgcolor: '#f5f5f5',
                      borderRadius: 2,
                    }}
                  >
                    <Typography sx={{ fontSize: '2rem' }}>{stretch.image}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5">
                        {index + 1}. {stretch.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {stretch.duration} seconds
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleStart}
            startIcon={<PlayArrowIcon sx={{ fontSize: '40px !important' }} />}
            sx={{
              minHeight: 40,
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#388e3c' },
            }}
          >
            <Typography variant="h5" sx={{ color: 'white' }}>
              Start Stretching
            </Typography>
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '120vh',
        background: 'linear-gradient(to bottom, #c8e6c9, #ffffff)',
        p: 3,
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Progress */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" color="text.secondary">
                Exercise {currentStep + 1} of {stretches.length}
              </Typography>
              <Chip
                label={`${Math.floor((currentStep / stretches.length) * 100)}% Complete`}
                color="success"
                size="medium"
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 12, borderRadius: 6 }}
            />
          </CardContent>
        </Card>

        {/* Current Exercise with Video */}
        <Card sx={{ mb: 3, bgcolor: '#e8f5e9', border: 2, borderColor: '#66bb6a' }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" gutterBottom sx={{ color: '#2e7d32' }}>
                {currentStretch.name}
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                {currentStretch.description}
              </Typography>

              {/* Video Player */}
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 400,
                  mx: 'auto',
                  mb: 3,
                  borderRadius: 1,
                  overflow: 'hidden',
                  boxShadow: 3,
                  bgcolor: 'black',
                }}
              >
                <video
                  ref={videoRef}
                  key={currentStretch.id}
                  width="100%"
                  loop
                  muted
                  playsInline
                  autoPlay
                  style={{
                    display: 'block',
                    maxHeight: '300px',
                    objectFit: 'contain',
                  }}
                  onError={(e) => {
                    console.error('Video failed to load:', currentStretch.videoUrl);
                    // Fallback: show emoji if video fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                >
                  <source src={currentStretch.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Fallback emoji if video doesn't load */}
                <Typography 
                  sx={{ 
                    fontSize: '5rem', 
                    py: 4,
                    display: 'none',
                    '.video-error &': { display: 'block' }
                  }}
                >
                  {currentStretch.image}
                </Typography>
              </Box>

              {/* Timer */}
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  bgcolor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  border: 8,
                  borderColor: isPaused ? '#ff9800' : '#4caf50',
                  transition: 'border-color 0.3s',
                }}
              >
                <Typography variant="h1" sx={{ fontSize: '4rem', color: '#2e7d32' }}>
                  {timeLeft}s
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Controls */}
        <Stack spacing={2}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handlePause}
            startIcon={
              isPaused ? (
                <PlayArrowIcon sx={{ fontSize: '40px !important' }} />
              ) : (
                <PauseIcon sx={{ fontSize: '40px !important' }} />
              )
            }
            sx={{
              minHeight: 40,
              bgcolor: isPaused ? '#4caf50' : '#ff9800',
              '&:hover': { bgcolor: isPaused ? '#388e3c' : '#f57c00' },
            }}
          >
            <Typography variant="h5" sx={{ color: 'white' }}>
              {isPaused ? 'Resume' : 'Pause'}
            </Typography>
          </Button>

          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={onBack}
            sx={{ minHeight: 40 }}
          >
            Exit Exercise
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}