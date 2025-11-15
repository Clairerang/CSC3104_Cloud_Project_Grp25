const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['senior', 'family', 'caregiver', 'admin'], required: true },
  profile: {
    name: String,
    age: Number,
    email: String,
    contact: String
  },
  lastActiveAt: { type: Date, default: Date.now },
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
  lastActiveAt: { type: Date, default: Date.now },
  streak: { type: Number, default: 0 }
}, { timestamps: true });

engagementSchema.index({ userId: 1, date: 1, session: 1 }, { unique: true });

const Engagement = mongoose.model('Engagement', engagementSchema);

// Invitations Schema
const invitationSchema = new mongoose.Schema({
  invitationId: {
    type: String,
    required: true,
    unique: true
  },
  seniorId: {
    type: String,
    required: true
  },
  familyId: {
    type: String,
    default: null
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  dateTime: {            
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  }
}, { timestamps: true });

const Invitation = mongoose.model('Invitation', invitationSchema);

// Activity Schema
const activitySchema = new mongoose.Schema({
  activityId: {
    type: String,
    required: true,
    unique: true
  },
  seniorId: {
    type: String,
    required: true
  },
  familyId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['video-call', 'phone-call', 'visit', 'exercise', 'hobby', 'social'],
    default: 'visit'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

const Activity = mongoose.model('Activity', activitySchema);

// Reminder Schema
const reminderSchema = new mongoose.Schema({
  reminderId: {
    type: String,
    required: true,
    unique: true
  },
  seniorId: {
    type: String,
    required: true
  },
  familyId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  time: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['call', 'task', 'medication'],
    required: true
  },
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly'],
    default: 'once'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Reminder = mongoose.model('Reminder', reminderSchema);


module.exports = {
  User,
  Relationship,
  Engagement,
  Invitation,
  Activity,
  Reminder
};
