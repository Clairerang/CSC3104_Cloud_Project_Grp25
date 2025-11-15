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
  CircularProgress,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface CulturalTriviaProps {
  userId: string;
  gameId: string;
  onComplete: () => void;
  onBack: () => void;
}

interface TriviaQuestion {
  questionId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  fact: string;
  category: string;
  difficulty: string;
}

export function CulturalTrivia({ userId, gameId, onComplete, onBack }: CulturalTriviaProps) {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Award points directly - simplified approach
  const awardGamePoints = async () => {
    try {
      const token = sessionStorage.getItem('token');
      console.log(`[GAME-POINTS] Awarding 10 points for trivia completion`);

      const response = await fetch('/api/add-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'trivia',
          points: 10,
          session: 'afternoon'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[GAME-POINTS] Points awarded successfully`);
      } else {
        console.error('[GAME-POINTS] Failed to award points');
      }
    } catch (error) {
      console.error('[GAME-POINTS] Error awarding points:', error);
    } finally {
      onComplete();
    }
  };

  // Fetch trivia questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/games/trivia?count=5');
        const data = await response.json();

        if (data.success && data.questions.length > 0) {
          setQuestions(data.questions);
          setError(null);
        } else {
          setError('No trivia questions available. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching trivia questions:', err);
        setError('Failed to load trivia questions. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Loading state
  if (loading) {
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
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#ff9800', mb: 3 }} />
          <Typography variant="h5" color="text.secondary">
            Loading trivia questions...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error || questions.length === 0) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #ffe0b2, #ffffff)',
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            size="large"
            sx={{ mb: 3, minHeight: 50 }}
          >
            Back to Activities
          </Button>
          <Alert severity="error" sx={{ fontSize: 16 }}>
            {error || 'No trivia questions available.'}
          </Alert>
        </Box>
      </Box>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
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
      setCompleted(true);
    }
  };

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100);
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
                +10 Points Earned!
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
              onClick={awardGamePoints}
              sx={{ minHeight: 50, bgcolor: '#ff9800', fontSize: 20, '&:hover': { bgcolor: '#f57c00' } }}
            >
              Done
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                // Refetch questions for a new game
                setLoading(true);
                fetch('/api/games/trivia?count=5')
                  .then(res => res.json())
                  .then(data => {
                    if (data.success && data.questions.length > 0) {
                      setQuestions(data.questions);
                      setStarted(false);
                      setCurrentQuestion(0);
                      setSelectedAnswer(null);
                      setShowResult(false);
                      setScore(0);
                      setCompleted(false);
                    }
                  })
                  .catch(err => {
                    console.error('Error refetching questions:', err);
                    setError('Failed to load new questions.');
                  })
                  .finally(() => setLoading(false));
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
                  <Typography variant="h5">{questions.length} Questions</Typography>
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
            onClick={() => setStarted(true)}
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
                  backgroundColor: '#f57c00', // progress color
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
                    // make correct/wrong/options with any selection render as contained so bgcolor is applied consistently
                    variant={showCorrect || showWrong || isSelected ? 'contained' : 'outlined'}
                    fullWidth
                    size="large"
                    onClick={() => handleAnswerSelect(index)}
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
                      pointerEvents: showResult ? 'none' : 'auto',
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
          {/* hide Exit Quiz when showing results for the last question */}
          {!(showResult && currentQuestion === questions.length - 1) && (
            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={onBack}
              sx={{ minHeight: 60 }}
            >
              Exit Quiz
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
