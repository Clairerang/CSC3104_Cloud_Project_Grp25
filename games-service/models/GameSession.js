const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  gameId: {
    type: String,
    required: true
  },
  gameType: {
    type: String,
    required: true,
    enum: ['trivia', 'memory', 'stretch', 'stacktower']
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  score: {
    type: Number,
    default: 0
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  moves: {
    type: Number
  },
  correctAnswers: {
    type: Number
  },
  totalQuestions: {
    type: Number
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  blocksStacked: {
    type: Number
  },
  highScore: {
    type: Number
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Create compound index for querying user's game history
gameSessionSchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.model('GameSession', gameSessionSchema);
