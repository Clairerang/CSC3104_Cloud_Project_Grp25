import { useState } from 'react';
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

interface CulturalTriviaProps {
  onComplete: () => void;
  onBack: () => void;
}

const questions = [
  {
    id: 1,
    question: 'What year did the first person land on the moon?',
    options: ['1965', '1969', '1972', '1975'],
    correctAnswer: 1,
    fact: 'Neil Armstrong and Buzz Aldrin landed on the moon on July 20, 1969!',
  },
  {
    id: 2,
    question: 'Which famous ship sank in 1912?',
    options: ['Lusitania', 'Titanic', 'Britannic', 'Olympic'],
    correctAnswer: 1,
    fact: 'The RMS Titanic sank on its maiden voyage after hitting an iceberg.',
  },
  {
    id: 3,
    question: 'Who was the first president of the United States?',
    options: ['Thomas Jefferson', 'John Adams', 'George Washington', 'Benjamin Franklin'],
    correctAnswer: 2,
    fact: 'George Washington served as the first U.S. President from 1789 to 1797.',
  },
];

export function CulturalTrivia({ onComplete, onBack }: CulturalTriviaProps) {
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

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
          background: 'linear-gradient(to bottom, #bbdefb, #ffffff)',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 120, color: '#2196f3', mb: 3 }} />
          <Typography variant="h3" gutterBottom sx={{ color: '#1976d2' }}>
            Quiz Complete!
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            You got {score} out of {questions.length} correct!
          </Typography>

          <Card sx={{ mb: 3, bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="h3" sx={{ color: '#2196f3', mb: 1 }}>
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
              sx={{ minHeight: 50, bgcolor: '#2196f3', fontSize: 20, '&:hover': { bgcolor: '#1976d2' } }}
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
          background: 'linear-gradient(to bottom, #bbdefb, #ffffff)',
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

          <Card sx={{ mb: 3, bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h3" gutterBottom sx={{ color: '#1976d2' }}>
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
              bgcolor: '#2196f3',
              '&:hover': { bgcolor: '#1976d2' },
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
        background: 'linear-gradient(to bottom, #bbdefb, #ffffff)',
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
              <Chip label={`Score: ${score}`} color="primary" size="medium" />
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 12, borderRadius: 6 }}
            />
          </CardContent>
        </Card>

        {/* Question */}
        <Card sx={{ mb: 3, bgcolor: '#e3f2fd', border: 2, borderColor: '#64b5f6' }}>
          <CardContent>
            <Typography variant="body1" sx={{ color: '#1976d2', mb: 3, fontSize: 32 }}>
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
                        ? '#2196f3'
                        : 'white',
                      color: showResult && (showCorrect || showWrong) ? 'white' : 'inherit',
                      '&:hover': {
                        bgcolor: showCorrect
                          ? '#4caf50'
                          : showWrong
                          ? '#f44336'
                          : isSelected
                          ? '#2196f3'
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
              sx={{ minHeight: 50, bgcolor: '#2196f3', '&:hover': { bgcolor: '#1976d2' } }}
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
