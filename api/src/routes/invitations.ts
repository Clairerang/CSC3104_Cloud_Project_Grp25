import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { Invitation } from '../models/Invitation';
import { Notification } from '../models/Notification';

const router = Router();

// GET /invitations
router.get('/', authMiddleware, async (req: any, res) => {
  const items = await Invitation.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  res.json(items);
});

// POST /invitations/:id/respond
router.post('/:id/respond', authMiddleware, async (req: any, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated = await Invitation.findOneAndUpdate({ _id: id, userId: req.user.userId }, { status }, { new: true });
  if (!updated) return res.status(404).json({ error: 'Invitation not found' });

  await Notification.create({
    userId: req.user.userId,
    type: 'invitation',
    title: 'Invitation Updated',
    message: `Invitation "${updated.title}" was ${updated.status}`,
  });

  res.json(updated);
});

export default router;
