import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { signToken, authMiddleware } from '../middleware/auth';

const router = Router();

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role });
    const token = signToken({ userId: user._id.toString(), role: user.role });
    res.json({ token, user });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken({ userId: user._id.toString(), role: user.role });
  res.json({ token, user });
});

// GET /auth/verify
router.get('/verify', authMiddleware, async (req: any, res) => {
  const user = await User.findById(req.user.userId).select('name email role');
  res.json({ user });
});

// POST /auth/logout
router.post('/logout', authMiddleware, (_req, res) => {
  res.json({ ok: true });
});

export default router;
