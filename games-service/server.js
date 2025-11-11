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
app.use(express.json());

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
    const { userId, gameId, gameType } = req.body;

    if (!userId || !gameId || !gameType) {
      return res.status(400).json({
        success: false,
        error: 'userId, gameId, and gameType are required'
      });
    }

    const session = new GameSession({
      sessionId: require('uuid').v4(),
      userId,
      gameId,
      gameType,
      startedAt: new Date()
    });

    await session.save();

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error starting game session:', error);
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
      pointsEarned = game.points;

      // Bonus points for excellent performance
      if (session.gameType === 'trivia' && correctAnswers === totalQuestions) {
        pointsEarned += 5; // Perfect score bonus
      } else if (session.gameType === 'memory' && moves <= 15) {
        pointsEarned += 5; // Efficient completion bonus
      }
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

    res.json({
      success: true,
      session,
      pointsEarned
    });
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
