const mongoose = require('mongoose');

const memorySetSchema = new mongoose.Schema({
  setId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  cards: {
    type: [String],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length >= 4 && arr.length <= 12;
      },
      message: 'Memory set must have between 4 and 12 unique cards'
    }
  },
  theme: {
    type: String,
    default: 'fruits'
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

module.exports = mongoose.model('MemorySet', memorySetSchema);
