const mongoose = require('mongoose');

const triviaQuestionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true
  },
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length === 4;
      },
      message: 'Options must have exactly 4 choices'
    }
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  fact: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'general'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TriviaQuestion', triviaQuestionSchema);
