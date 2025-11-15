require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mqtt = require('mqtt');

// Import models
const Game = require('./models/Game');
const TriviaQuestion = require('./models/TriviaQuestion');
const Exercise = require('./models/Exercise');
const MemorySet = require('./models/MemorySet');
const GameSession = require('./models/GameSession');

// Import MQTT handlers
const mqttHandlers = require('./mqtt/handlers');

const app = express();
const PORT = process.env.PORT || 8081;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/senior_care';
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB (Games DB)'))
  .catch(err => console.error('MongoDB connection error:', err));

// Connect to MQTT Broker
const mqttClient = mqtt.connect(MQTT_BROKER_URL, {
  clientId: `games-service-${Math.random().toString(16).slice(2, 10)}`,
  clean: true,
  reconnectPeriod: 1000,
});

mqttClient.on('connect', () => {
  console.log('Connected to MQTT Broker');

  // Subscribe to games topics
  const topics = [
    'games/request/list',
    'games/request/trivia',
    'games/request/memory',
    'games/request/stretch',
    'games/session/start',
    'games/session/complete',
    'games/history/request/#'
  ];

  mqttClient.subscribe(topics, (err) => {
    if (err) {
      console.error('MQTT subscription error:', err);
    } else {
      console.log('Subscribed to games topics:', topics);
    }
  });
});

mqttClient.on('error', (error) => {
  console.error('MQTT connection error:', error);
});

mqttClient.on('message', async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    console.log(`Received message on topic: ${topic}`);

    // Route to appropriate handler
    await mqttHandlers.handleMessage(topic, payload, mqttClient);
  } catch (error) {
    console.error('Error processing MQTT message:', error);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'games-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    mqtt: mqttClient.connected ? 'connected' : 'disconnected'
  });
});

// REST API Endpoints

// Get all available games
app.get('/games', async (req, res) => {
  try {
    const games = await Game.find({ isActive: true }).sort({ name: 1 });
    res.json({
      success: true,
      games
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get trivia questions (random selection)
app.get('/trivia', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 5;
    const questions = await TriviaQuestion.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: count } }
    ]);
    res.json({
      success: true,
      questions
    });
  } catch (error) {
    console.error('Error fetching trivia questions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get memory card sets
app.get('/memory', async (req, res) => {
  try {
    const difficulty = req.query.difficulty || 'easy';
    const memorySets = await MemorySet.find({
      isActive: true,
      difficulty
    });

    // Randomly select one set if multiple available
    const randomSet = memorySets.length > 0
      ? memorySets[Math.floor(Math.random() * memorySets.length)]
      : null;

    res.json({
      success: true,
      memorySet: randomSet,
      allSets: memorySets
    });
  } catch (error) {
    console.error('Error fetching memory sets:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get exercises
app.get('/exercises', async (req, res) => {
  try {
    const exercises = await Exercise.find({ isActive: true })
      .sort({ order: 1 });
    res.json({
      success: true,
      exercises
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start a new game session
app.post('/session/start', async (req, res) => {
  try {
    console.log('[SESSION-START] Request received:', req.body);
    const { userId, gameId, gameType } = req.body;

    if (!userId || !gameId || !gameType) {
      console.log('[SESSION-START] Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'userId, gameId, and gameType are required'
      });
    }

    const sessionId = require('uuid').v4();
    console.log('[SESSION-START] Creating session:', sessionId);

    const session = new GameSession({
      sessionId,
      userId,
      gameId,
      gameType,
      startedAt: new Date()
    });

    console.log('[SESSION-START] Saving to database...');
    await session.save();
    console.log('[SESSION-START] Session saved successfully:', sessionId);

    res.json({
      success: true,
      sessionId: session.sessionId
    });
  } catch (error) {
    console.error('[SESSION-START] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Complete a game session
app.post('/session/complete', async (req, res) => {
  try {
    const {
      sessionId,
      score,
      moves,
      correctAnswers,
      totalQuestions,
      metadata
    } = req.body;

    const session = await GameSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Calculate points based on game type
    let pointsEarned = 0;
    const game = await Game.findOne({ gameId: session.gameId });

    if (game) {
      // Award exact points from game definition
      pointsEarned = game.points;
    }

    // Update session
    session.completedAt = new Date();
    session.isCompleted = true;
    session.score = score;
    session.pointsEarned = pointsEarned;
    session.moves = moves;
    session.correctAnswers = correctAnswers;
    session.totalQuestions = totalQuestions;
    session.metadata = metadata || {};

    await session.save();

    // Integrate with engagement tracking - call API Gateway with retry logic
    let engagementTracked = false;
    let engagementError = null;

    try {
      console.log(`[GAME-COMPLETE] Attempting to track ${pointsEarned} points for user ${session.userId}`);

      const axios = require('axios');
      const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://api-gateway:8080';

      // Determine session based on time of day
      const hour = new Date().getHours();
      let sessionTime = 'afternoon';
      if (hour < 12) sessionTime = 'morning';
      else if (hour >= 18) sessionTime = 'evening';

      const trackingResponse = await axios.post(
        `${API_GATEWAY_URL}/add-task`,
        {
          userId: session.userId, // Required for service auth
          type: session.gameType,
          points: pointsEarned,
          session: sessionTime
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Service-Auth': process.env.SERVICE_AUTH_TOKEN || 'games-service-secret'
          },
          timeout: 5000 // 5 second timeout
        }
      );

      if (trackingResponse.data) {
        engagementTracked = true;
        console.log(`[GAME-COMPLETE] ✓ Successfully tracked points for user ${session.userId}`);
        console.log(`[GAME-COMPLETE] Daily progress: ${trackingResponse.data.dailyProgress?.todayTotal}/${trackingResponse.data.dailyProgress?.dailyCap}`);
      }
    } catch (error) {
      engagementError = error.message;
      console.error(`[GAME-COMPLETE] ✗ Failed to track engagement:`, error.message);

      // Log but don't fail the request - game completion should still succeed
      if (error.response) {
        console.error(`[GAME-COMPLETE] API Response Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error(`[GAME-COMPLETE] No response from API Gateway - service may be down`);
      }

      // TODO: Implement retry queue or dead letter queue for failed point tracking
      console.warn(`[GAME-COMPLETE] Points will need to be manually reconciled for session ${sessionId}`);
    }

    const response = {
      success: true,
      session,
      pointsEarned,
      engagement: {
        tracked: engagementTracked,
        error: engagementError
      }
    };

    if (!engagementTracked) {
      response.warning = 'Game completed successfully but points tracking failed. Points may be reconciled later.';
    }

    res.json(response);
  } catch (error) {
    console.error('Error completing game session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's game history
app.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const history = await GameSession.find({
      userId,
      isCompleted: true
    })
      .sort({ completedAt: -1 })
      .limit(limit);

    // Calculate stats
    const stats = {
      totalGames: history.length,
      totalPoints: history.reduce((sum, s) => sum + s.pointsEarned, 0),
      gamesByType: {
        trivia: history.filter(s => s.gameType === 'trivia').length,
        memory: history.filter(s => s.gameType === 'memory').length,
        stretch: history.filter(s => s.gameType === 'stretch').length
      }
    };

    res.json({
      success: true,
      history,
      stats
    });
  } catch (error) {
    console.error('Error fetching game history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Games Service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  mqttClient.end();
  await mongoose.connection.close();
  process.exit(0);
});
