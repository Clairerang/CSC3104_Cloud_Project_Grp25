import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { CheckIn } from '../models/CheckIn';

const router = Router();

// POST /checkins
router.post('/', authMiddleware, async (req: any, res) => {
  const { mood, session } = req.body;
  const checkin = await CheckIn.create({ userId: req.user.userId, mood, session });
  res.json(checkin);
});

// GET /checkins/daily
router.get('/daily', authMiddleware, async (req: any, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const checkIns = await CheckIn.find({
    userId: req.user.userId,
    date: { $gte: start, $lte: end },
  });
  res.json({ date: start.toISOString().slice(0, 10), checkIns, totalCheckIns: checkIns.length });
});

export default router;
