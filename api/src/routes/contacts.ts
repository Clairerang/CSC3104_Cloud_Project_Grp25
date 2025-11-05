import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { Contact } from '../models/Contact';

const router = Router();

// GET /contacts
router.get('/', authMiddleware, async (req: any, res) => {
  const contacts = await Contact.find({ userId: req.user.userId }).sort({ isFavorite: -1, name: 1 });
  res.json(contacts);
});

// POST /contacts
router.post('/', authMiddleware, async (req: any, res) => {
  const contact = await Contact.create({ ...req.body, userId: req.user.userId });
  res.status(201).json(contact);
});

// PUT /contacts/:id
router.put('/:id', authMiddleware, async (req: any, res) => {
  const { id } = req.params;
  const updated = await Contact.findOneAndUpdate({ _id: id, userId: req.user.userId }, req.body, { new: true });
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

// DELETE /contacts/:id
router.delete('/:id', authMiddleware, async (req: any, res) => {
  const { id } = req.params;
  const deleted = await Contact.findOneAndDelete({ _id: id, userId: req.user.userId });
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// POST /contacts/:id/call
// can prob just store this as a notification

export default router;
