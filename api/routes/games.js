const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sendRequest } = require('../mqtt/client');

const router = express.Router();

/**
 * Middleware to authenticate token (reusing from main app)
 * This should be passed from app.js
 */
let authenticateToken;

function setAuthMiddleware(middleware) {
  authenticateToken = middleware;
}

// Wrapper middleware that calls authenticateToken at runtime
const authMiddleware = (req, res, next) => {
  if (authenticateToken) {
    return authenticateToken(req, res, next);
  }
  return res.status(401).json({ error: 'Authentication not configured' });
};

/**
 * GET /api/games - Get list of all available games
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const correlationId = uuidv4();

    const response = await sendRequest('games/request/list', {
      correlationId,
      userId: req.user.userId
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching games list:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch games'
    });
  }
});

/**
 * GET /api/games/trivia - Get trivia questions
 */
router.get('/trivia', authMiddleware, async (req, res) => {
  try {
    const correlationId = uuidv4();
    const count = parseInt(req.query.count) || 3;

    const response = await sendRequest('games/request/trivia', {
      correlationId,
      userId: req.user.userId,
      count
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching trivia:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch trivia questions'
    });
  }
});

/**
 * GET /api/games/memory - Get memory card set
 */
router.get('/memory', authMiddleware, async (req, res) => {
  try {
    const correlationId = uuidv4();
    const difficulty = req.query.difficulty || 'easy';

    const response = await sendRequest('games/request/memory', {
      correlationId,
      userId: req.user.userId,
      difficulty
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching memory game:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch memory game'
    });
  }
});

/**
 * GET /api/games/stretch - Get stretch exercises
 */
router.get('/stretch', authMiddleware, async (req, res) => {
  try {
    const correlationId = uuidv4();

    const response = await sendRequest('games/request/stretch', {
      correlationId,
      userId: req.user.userId
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching stretch exercises:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch stretch exercises'
    });
  }
});

/**
 * POST /api/games/session/start - Start a new game session
 * Body: { gameId, gameType }
 */
router.post('/session/start', authMiddleware, async (req, res) => {
  try {
    const correlationId = uuidv4();
    const { gameId, gameType } = req.body;

    if (!gameId || !gameType) {
      return res.status(400).json({
        success: false,
        error: 'gameId and gameType are required'
      });
    }

    const response = await sendRequest('games/session/start', {
      correlationId,
      userId: req.user.userId,
      gameId,
      gameType
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Error starting game session:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start game session'
    });
  }
});

/**
 * POST /api/games/session/complete - Complete a game session
 * Body: { sessionId, score, moves, correctAnswers, totalQuestions, metadata }
 */
router.post('/session/complete', authMiddleware, async (req, res) => {
  try {
    const correlationId = uuidv4();
    const {
      sessionId,
      score,
      moves,
      correctAnswers,
      totalQuestions,
      metadata
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId is required'
      });
    }

    const response = await sendRequest('games/session/complete', {
      correlationId,
      sessionId,
      score,
      moves,
      correctAnswers,
      totalQuestions,
      metadata
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Error completing game session:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete game session'
    });
  }
});

/**
 * GET /api/games/history - Get user's game history
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const correlationId = uuidv4();
    const limit = parseInt(req.query.limit) || 10;

    const response = await sendRequest(`games/history/request/${req.user.userId}`, {
      correlationId,
      userId: req.user.userId,
      limit
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching game history:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch game history'
    });
  }
});

module.exports = {
  router,
  setAuthMiddleware
};
