import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { Notification } from '../models/Notification';

const router = Router();

// GET /notifications
router.get('/', authMiddleware, async (req: any, res) => {
  const items = await Notification.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  res.json(items);
});

// PUT /notifications/:id/read
router.put('/:id/read', authMiddleware, async (req: any, res) => {
  const { id } = req.params;
  const item = await Notification.findOneAndUpdate({ _id: id, userId: req.user.userId }, { isRead: true }, { new: true });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

export default router;
