import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface MemoryQuizProps {
  onComplete: () => void;
  onBack: () => void;
}

const cards = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍋', '🥝', '🍒'];

export function MemoryQuiz({ onComplete, onBack }: MemoryQuizProps) {
  const [gameCards, setGameCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showingPreview, setShowingPreview] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffled = [...cards, ...cards]
      .sort(() => Math.random() - 0.5)
      .map((card) => card);
    setGameCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setCompleted(false);
    setShowingPreview(false);
  };

  const handleStartGame = () => {
    setStarted(true);
    setShowingPreview(true);
    // Show all cards for 3 seconds, then flip them face down
    setTimeout(() => {
      setShowingPreview(false);
    }, 3000);
  };

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (gameCards[first] === gameCards[second]) {
        setMatched([...matched, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
      setMoves(moves + 1);
    }
  }, [flipped]);

  useEffect(() => {
    if (matched.length === gameCards.length && gameCards.length > 0) {
      setCompleted(true);
    }
  }, [matched, gameCards]);

  const handleCardClick = (index: number) => {
    if (!started || showingPreview || flipped.length === 2 || flipped.includes(index) || matched.includes(index)) {
      return;
    }
    setFlipped([...flipped, index]);
  };

  if (completed) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #e1bee7, #ffffff)',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 120, color: '#9c27b0', mb: 3 }} />
          <Typography variant="h1" gutterBottom sx={{ color: '#7b1fa2' }}>
            Excellent Memory!
          </Typography>
          <Typography variant="h3" color="text.secondary" sx={{ mb: 4 }}>
            You matched all pairs in {moves} moves!
          </Typography>

          <Card sx={{ mb: 3, bgcolor: '#f3e5f5' }}>
            <CardContent>
              <Typography variant="h2" sx={{ color: '#9c27b0', mb: 1 }}>
                +15 Points Earned!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your memory skills are impressive!
              </Typography>
            </CardContent>
          </Card>

          <Stack spacing={2}>
            <Button
              variant="contained"
              size="large"
              onClick={onComplete}
              sx={{ minHeight: 70, bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
            >
              Done
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                initializeGame();
                setStarted(false);
              }}
              sx={{ minHeight: 60 }}
            >
              Play Again
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
          background: 'linear-gradient(to bottom, #e1bee7, #ffffff)',
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

          <Card sx={{ mb: 3, bgcolor: '#f3e5f5' }}>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h3" gutterBottom sx={{ color: '#7b1fa2' }}>
                  Memory Match
                </Typography>
                <Typography variant="h5" color="text.secondary">
                  Find all matching pairs of fruit!
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                How to Play:
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ fontSize: '2rem' }}>1️⃣</Typography>
                  <Typography variant="h5">Tap a card to flip it over</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ fontSize: '2rem' }}>2️⃣</Typography>
                  <Typography variant="h5">Tap another card to find its match</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ fontSize: '2rem' }}>3️⃣</Typography>
                  <Typography variant="h5">Match all pairs to win!</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleStartGame}
            startIcon={<PlayArrowIcon sx={{ fontSize: '40px !important' }} />}
            sx={{
              minHeight: 40,
              bgcolor: '#9c27b0',
              '&:hover': { bgcolor: '#7b1fa2' },
            }}
          >
            <Typography variant="h5" sx={{ color: 'white' }}>
              Start Game
            </Typography>
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #e1bee7, #ffffff)',
        p: 3,
        pb: 130,
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Stats */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: 20 }}>
                  Moves
                </Typography>
                <Typography variant="h3">{moves}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: 20 }}>
                  Matched
                </Typography>
                <Typography variant="h3">
                  {matched.length / 2} / {cards.length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Preview Message */}
        {showingPreview && (
          <Card sx={{ mb: 3, bgcolor: '#f3e5f5', border: 2, borderColor: '#ba68c8' }}>
            <CardContent>
              <Typography variant="h5" sx={{ textAlign: 'center', color: '#7b1fa2' }}>
                Memorize the cards! They'll flip in a moment...
              </Typography>
            </CardContent>
          </Card>
        )}

        {!showingPreview && (
            <Card sx={{ mb: 3, bgcolor: '#f3e5f5', border: 2, borderColor: '#ba68c8' }}>
            <CardContent>
              <Typography variant="h5" sx={{ textAlign: 'center', color: '#883ca9ff' }}>
                Find the pairs now!
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Game Grid - 4x4 using flex */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1, alignItems: 'center' }}>
          {[0, 1, 2, 3].map((row) => (
            <Box key={row} sx={{ display: 'flex', gap: 1, width: '80%' }}>
              {[0, 1, 2, 3].map((col) => {
                const index = row * 4 + col;
                const card = gameCards[index];
                const isFlipped = showingPreview || flipped.includes(index) || matched.includes(index);
                
                return (
                  <Box
                    key={index}
                    onClick={() => handleCardClick(index)}
                    sx={{
                      flex: '1 0',
                      aspectRatio: '1',
                      position: 'relative',
                      cursor: showingPreview ? 'default' : 'pointer',
                      minWidth: 0,
                    }}
                  >
                    <Card
                      sx={{
                        width: '80%',
                        height: '80%',
                        bgcolor: isFlipped ? '#fff' : '#9c27b0',
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        border: 2,
                        borderColor: matched.includes(index) ? '#4caf50' : isFlipped ? '#e1bee7' : 'transparent',
                        boxShadow: 2,
                        transition: 'all 0.3s',
                        cursor: showingPreview ? 'default' : 'pointer',
                        '&:hover': {
                          transform: showingPreview ? 'none' : 'scale(1.05)',
                        },
                        '&:active': {
                          transform: showingPreview ? 'none' : 'scale(0.95)',
                        },
                      }}
                    >
                      {isFlipped ? card : '❔'}
                    </Card>
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>

        {/* Controls */}
        <Stack spacing={2}>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={onBack}
            sx={{ minHeight: 60 }}
          >
            Exit Game
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}