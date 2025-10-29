const { v4: uuidv4 } = require('uuid');
const Game = require('../models/Game');
const TriviaQuestion = require('../models/TriviaQuestion');
const Exercise = require('../models/Exercise');
const MemorySet = require('../models/MemorySet');
const GameSession = require('../models/GameSession');

/**
 * Main message handler that routes to specific handlers
 */
async function handleMessage(topic, payload, mqttClient) {
  const { correlationId } = payload;

  try {
    let response;

    switch (topic) {
      case 'games/request/list':
        response = await handleGamesList(payload);
        mqttClient.publish(
          `games/response/list/${correlationId}`,
          JSON.stringify(response)
        );
        break;

      case 'games/request/trivia':
        response = await handleTriviaRequest(payload);
        mqttClient.publish(
          `games/response/trivia/${correlationId}`,
          JSON.stringify(response)
        );
        break;

      case 'games/request/memory':
        response = await handleMemoryRequest(payload);
        mqttClient.publish(
          `games/response/memory/${correlationId}`,
          JSON.stringify(response)
        );
        break;

      case 'games/request/stretch':
        response = await handleStretchRequest(payload);
        mqttClient.publish(
          `games/response/stretch/${correlationId}`,
          JSON.stringify(response)
        );
        break;

      case 'games/session/start':
        response = await handleSessionStart(payload);
        mqttClient.publish(
          `games/response/session/start/${correlationId}`,
          JSON.stringify(response)
        );
        break;

      case 'games/session/complete':
        response = await handleSessionComplete(payload);
        mqttClient.publish(
          `games/response/session/complete/${correlationId}`,
          JSON.stringify(response)
        );
        break;

      default:
        if (topic.startsWith('games/history/request/')) {
          response = await handleHistoryRequest(payload);
          mqttClient.publish(
            `games/response/history/${correlationId}`,
            JSON.stringify(response)
          );
        }
    }
  } catch (error) {
    console.error(`Error handling topic ${topic}:`, error);
    mqttClient.publish(
      `games/response/error/${correlationId}`,
      JSON.stringify({
        success: false,
        error: error.message
      })
    );
  }
}

/**
 * Get list of all available games
 */
async function handleGamesList(payload) {
  const games = await Game.find({ isActive: true }).sort({ name: 1 });
  return {
    success: true,
    games
  };
}

/**
 * Get trivia questions (random 3)
 */
async function handleTriviaRequest(payload) {
  const { count = 3 } = payload;

  const questions = await TriviaQuestion.aggregate([
    { $match: { isActive: true } },
    { $sample: { size: count } }
  ]);

  return {
    success: true,
    questions
  };
}

/**
 * Get memory card set
 */
async function handleMemoryRequest(payload) {
  const { difficulty = 'easy' } = payload;

  const memorySets = await MemorySet.find({
    isActive: true,
    difficulty
  });

  // Randomly select one set
  const randomSet = memorySets[Math.floor(Math.random() * memorySets.length)];

  return {
    success: true,
    memorySet: randomSet || null
  };
}

/**
 * Get stretch exercises
 */
async function handleStretchRequest(payload) {
  const exercises = await Exercise.find({ isActive: true })
    .sort({ order: 1 });

  return {
    success: true,
    exercises
  };
}

/**
 * Start a new game session
 */
async function handleSessionStart(payload) {
  const { userId, gameId, gameType } = payload;

  const session = new GameSession({
    sessionId: uuidv4(),
    userId,
    gameId,
    gameType,
    startedAt: new Date()
  });

  await session.save();

  return {
    success: true,
    session
  };
}

/**
 * Complete a game session and calculate points
 */
async function handleSessionComplete(payload) {
  const {
    sessionId,
    score,
    moves,
    correctAnswers,
    totalQuestions,
    metadata
  } = payload;

  const session = await GameSession.findOne({ sessionId });

  if (!session) {
    throw new Error('Session not found');
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

  return {
    success: true,
    session,
    pointsEarned
  };
}

/**
 * Get user's game history
 */
async function handleHistoryRequest(payload) {
  const { userId, limit = 10 } = payload;

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
    gamesbyType: {
      trivia: history.filter(s => s.gameType === 'trivia').length,
      memory: history.filter(s => s.gameType === 'memory').length,
      stretch: history.filter(s => s.gameType === 'stretch').length
    }
  };

  return {
    success: true,
    history,
    stats
  };
}

module.exports = {
  handleMessage,
  handleGamesList,
  handleTriviaRequest,
  handleMemoryRequest,
  handleStretchRequest,
  handleSessionStart,
  handleSessionComplete,
  handleHistoryRequest
};
