import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { Activity } from '../models/Activity';
import { ActivityCompletion } from '../models/ActivityCompletion';
import { Notification } from '../models/Notification';

const router = Router();

// GET /activities
router.get('/', authMiddleware, async (_req, res) => {
  const items = await Activity.find().sort({ createdAt: -1 });
  res.json(items);
});

// POST /activities/:id/complete
router.post('/:id/complete', authMiddleware, async (req: any, res) => {
  const { id } = req.params;
  const { score, duration } = req.body;

  const activity = await Activity.findById(id);
  if (!activity) return res.status(404).json({ error: 'Activity not found' });

  const awardedPoints = (activity.points || 0) + Math.round((score || 0) / 10);
  const completion = await ActivityCompletion.create({
    userId: req.user.userId,
    activityId: id,
    score,
    duration,
    awardedPoints,
  });

  await Notification.create({
    userId: req.user.userId,
    type: 'achievement',
    title: 'Activity Completed ✅',
    message: `You completed "${activity.title}" and earned ${awardedPoints} points!`,
  });

  res.json(completion);
});

export default router;
