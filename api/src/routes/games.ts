import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { MemoryQuizResult } from '../models/MemoryQuizResult';
import { TriviaResult } from '../models/TriviaResult';
import { Notification } from '../models/Notification';
import { TriviaQuestion } from '../models/TriviaQuestion';

const router = Router();

// Memory Quiz
router.post('/memory-quiz/complete', authMiddleware, async (req: any, res) => {
  const { moves, timeSpent, score } = req.body;
  const result = await MemoryQuizResult.create({ userId: req.user.userId, moves, timeSpent, score });
  res.json(result);
});

// GET /cultural-trivia/questions
router.get('/cultural-trivia/questions', authMiddleware, async (_req, res) => {
    try {
      const questions = await TriviaQuestion.find().sort({ createdAt: 1 });
      res.json(questions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch trivia questions' });
    }
  });
  
router.post('/cultural-trivia/complete', authMiddleware, async (req: any, res) => {
  const { questionsAnswered, correctAnswers, score } = req.body;
  const result = await TriviaResult.create({ userId: req.user.userId, questionsAnswered, correctAnswers, score });
  res.json(result);
});

export default router;
