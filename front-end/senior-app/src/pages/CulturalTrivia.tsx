import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import axios from 'axios';

interface CulturalTriviaProps {
  onComplete: () => void;
  onBack: () => void;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  fact: string;
}

const API_BASE_URL = process.env.REACT_APP_API_GATEWAY || 'http://localhost:8080';

export function CulturalTrivia({ onComplete, onBack }: CulturalTriviaProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_BASE_URL}/api/games/trivia?count=3`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success && response.data.questions) {
          setQuestions(response.data.questions);
        }
      } catch (err) {
        console.error('Error fetching trivia:', err);
      }
    };

    fetchQuestions();
  }, []);

  // Start game session
  const handleStartGame = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_BASE_URL}/api/games/session/start`,
        { gameId: '3', gameType: 'trivia' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.session) {
        setSessionId(response.data.session.sessionId);
      }
    } catch (err) {
      console.error('Error starting session:', err);
    }
    setStarted(true);
  };

  const question = questions[currentQuestion];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const handleAnswerSelect = (index: number) => {
    if (showResult || !question) return;
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === question.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      handleComplete();
    }
  };

  // Complete game session
  const handleComplete = async () => {
    setCompleted(true);
    
    // Track session completion
    if (sessionId) {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          await axios.post(
            `${API_BASE_URL}/api/games/session/complete`,
            {
              sessionId,
              score,
              correctAnswers: score,
              totalQuestions: questions.length,
              metadata: { gameType: 'trivia' }
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } catch (err) {
        console.error('Error completing session:', err);
        // Continue anyway
      }
    }
  };


  if (completed) {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #ffe0b2, #ffffff)',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 120, color: '#ff9800', mb: 3 }} />
          <Typography variant="h3" gutterBottom sx={{ color: '#e65100' }}>
            Quiz Complete!
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            You got {score} out of {questions.length} correct!
          </Typography>

          <Card sx={{ mb: 3, bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="h3" sx={{ color: '#ff9800', mb: 1 }}>
                +15 Points Earned!
              </Typography>
              <Typography variant="h5" color="text.secondary">
                {percentage >= 70
                  ? 'Excellent work! You really know your history!'
                  : 'Good effort! Keep learning and try again!'}
              </Typography>
            </CardContent>
          </Card>

          <Stack spacing={2}>
            <Button
              variant="contained"
              size="large"
              onClick={onComplete}
              sx={{ minHeight: 50, bgcolor: '#ff9800', fontSize: 20, '&:hover': { bgcolor: '#f57c00' } }}
            >
              Done
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                setStarted(false);
                setCurrentQuestion(0);
                setSelectedAnswer(null);
                setShowResult(false);
                setScore(0);
                setCompleted(false);
                setSessionId(null);
              }}
              sx={{ minHeight: 60 }}
            >
              Try Again
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
          background: 'linear-gradient(to bottom, #ffe0b2, #ffffff)',
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

          <Card sx={{ mb: 3, bgcolor: '#fff3e0' }}>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h3" gutterBottom sx={{ color: '#ff9800' }}>
                  Cultural Trivia
                </Typography>
                <Typography variant="h5" color="text.secondary">
                  Test your knowledge of history!
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Quiz Details:
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ fontSize: '2rem' }}>❓</Typography>
                  <Typography variant="h5">{questions.length || 3} Questions</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ fontSize: '2rem' }}>🎯</Typography>
                  <Typography variant="h5">Multiple choice format</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ fontSize: '2rem' }}>💡</Typography>
                  <Typography variant="h5">Learn fun facts after each question</Typography>
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
              bgcolor: '#ff9800',
              '&:hover': { bgcolor: '#f57c00' },
            }}
          >
            <Typography variant="h5" sx={{ color: 'white' }}>
              Start Quiz
            </Typography>
          </Button>
        </Box>
      </Box>
    );
  }

  if (!question || questions.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading questions...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #ffe0b2, #ffffff)',
        p: 3,
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Progress */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" color="text.secondary">
                Question {currentQuestion + 1} of {questions.length}
              </Typography>
              <Chip label={`Score: ${score}`} color="primary" size="medium" sx={{ bgcolor: '#f57c00' }}/>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 12, borderRadius: 6, bgcolor: '#ffdab6ff',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#f57c00',
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Question */}
        <Card sx={{ mb: 3, bgcolor: '#fdefdaff', border: 2, borderColor: '#ffc368ff' }}>
          <CardContent>
            <Typography variant="body1" sx={{ color: '#ce861aff', mb: 3, fontSize: 32 }}>
              {question.question}
            </Typography>

            <Stack spacing={2}>
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === question.correctAnswer;
                const showCorrect = showResult && isCorrect;
                const showWrong = showResult && isSelected && !isCorrect;

                return (
                  <Button
                    key={index}
                    variant={isSelected ? 'contained' : 'outlined'}
                    fullWidth
                    size="large"
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    sx={{
                      minHeight: 70,
                      justifyContent: 'flex-start',
                      bgcolor: showCorrect
                        ? '#4caf50'
                        : showWrong
                        ? '#f44336'
                        : isSelected
                        ? '#fba21dff'
                        : 'white',
                      color: showResult && (showCorrect || showWrong) ? 'white' : 'inherit',
                      '&:hover': {
                        bgcolor: showCorrect
                          ? '#4caf50'
                          : showWrong
                          ? '#f44336'
                          : isSelected
                          ? '#fba21dff'
                          : '#f5f5f5',
                      },
                    }}
                    startIcon={
                      showCorrect ? (
                        <CheckCircleIcon sx={{ fontSize: '32px !important' }} />
                      ) : showWrong ? (
                        <CancelIcon sx={{ fontSize: '32px !important' }} />
                      ) : null
                    }
                  >
                    <Typography variant="h5">{option}</Typography>
                  </Button>
                );
              })}
            </Stack>
          </CardContent>
        </Card>

        {/* Result Feedback */}
        {showResult && (
          <Card sx={{ mb: 3, bgcolor: selectedAnswer === question.correctAnswer ? '#e8f5e9' : '#ffebee' }}>
            <CardContent>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ color: selectedAnswer === question.correctAnswer ? '#2e7d32' : '#c62828' }}
              >
                {selectedAnswer === question.correctAnswer ? '✓ Correct!' : '✗ Not quite!'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                💡 {question.fact}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <Stack spacing={2}>
          {showResult && (
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleNext}
              sx={{ minHeight: 50, bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
            >
              <Typography variant="h5" sx={{ color: 'white' }}>
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
              </Typography>
            </Button>
          )}
          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={onBack}
            sx={{ minHeight: 60 }}
          >
            Exit Quiz
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
