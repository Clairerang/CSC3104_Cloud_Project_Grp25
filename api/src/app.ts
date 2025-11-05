import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Middleware
import { authMiddleware } from './middleware/auth';

// Routes
import authRoutes from './routes/auth';
import checkinRoutes from './routes/checkins';
import contactRoutes from './routes/contacts';
import activityRoutes from './routes/activities';
import gameRoutes from './routes/games';
import invitationRoutes from './routes/invitations';
import gamificationRoutes from './routes/gamification';
import notificationRoutes from './routes/notifications';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Route Mounting
app.use('/auth', authRoutes);
app.use('/checkins', authMiddleware, checkinRoutes);
app.use('/contacts', authMiddleware, contactRoutes);
app.use('/activities', authMiddleware, activityRoutes);
app.use('/games', authMiddleware, gameRoutes);
app.use('/invitations', authMiddleware, invitationRoutes);
app.use('/gamification', authMiddleware, gamificationRoutes);
app.use('/notifications', authMiddleware, notificationRoutes);

export default app;
