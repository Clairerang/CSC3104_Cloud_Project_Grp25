const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['senior', 'family', 'admin'], required: true },
  profile: {
    name: String,
    age: Number,
    email: String,
    contact: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Relationship Schema
const relationshipSchema = new mongoose.Schema({
  seniorId: { type: String, required: true },
  linkAccId: { type: String, required: true },
  relation: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

relationshipSchema.index({ seniorId: 1, linkAccId: 1 }, { unique: true });

const Relationship = mongoose.model('Relationship', relationshipSchema);

// Engagement Schema
const engagementSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true },
  checkIn: { type: Boolean, default: false },
  mood: {
    type: String,
    enum: ['great', 'okay', 'not-well']
  },
  session: {
    type: String,
    enum: ['morning', 'afternoon', 'evening']
  },
  tasksCompleted: [
    {
      type: { type: String },
      points: { type: Number, default: 0 }
    }
  ],
  totalScore: { type: Number, default: 0 },
  lastActiveAt: { type: Date, default: Date.now }
}, { timestamps: true });

engagementSchema.index({ userId: 1, date: 1, session: 1 }, { unique: true });

const Engagement = mongoose.model('Engagement', engagementSchema);

module.exports = {
  User,
  Relationship,
  Engagement
};
