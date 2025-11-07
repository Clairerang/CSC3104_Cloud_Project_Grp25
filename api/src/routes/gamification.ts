import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { ActivityCompletion } from '../models/ActivityCompletion';
import { MemoryQuizResult } from '../models/MemoryQuizResult';
import { TriviaResult } from '../models/TriviaResult';
import { CheckIn } from '../models/CheckIn';
import mongoose from 'mongoose';

const router = Router();

// GET /gamification/stats
router.get('/stats', authMiddleware, async (req: any, res) => {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
  
    const [activity, memory, trivia] = await Promise.all([
      ActivityCompletion.aggregate([
        { $match: { userId } },
        { $group: { _id: null, points: { $sum: '$awardedPoints' } } },
      ]),
      MemoryQuizResult.aggregate([
        { $match: { userId } },
        { $group: { _id: null, points: { $sum: '$score' } } },
      ]),
      TriviaResult.aggregate([
        { $match: { userId } },
        { $group: { _id: null, points: { $sum: '$score' } } },
      ]),
    ]);
  
    const totalPoints =
      (activity[0]?.points || 0) +
      (memory[0]?.points || 0) +
      (trivia[0]?.points || 0);
  
    const level = Math.floor(totalPoints / 100) + 1;
    res.json({ totalPoints, currentStreak: 1, level });
  });

export default router;
