const mongoose = require('mongoose');

const stackTowerSchema = new mongoose.Schema({
  towerId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  targetBlocks: {
    type: Number,
    required: true,
    default: 5,
    min: 3,
    max: 20
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  settings: {
    initialSpeed: {
      type: Number,
      default: 2
    },
    speedIncrement: {
      type: Number,
      default: 0.2
    },
    initialWidth: {
      type: Number,
      default: 100
    }
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

module.exports = mongoose.model('StackTower', stackTowerSchema);