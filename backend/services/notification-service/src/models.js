const mongoose = require('mongoose');

// Prefer consolidated env name, fallback to legacy
const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://mongodb:27017/senior_care';

let connected = false;

async function connectMongo() {
  if (connected) return;
  await mongoose.connect(MONGO_URL, { autoIndex: true });
  connected = true;
  console.log('🗄️ Connected to MongoDB (models)');
}

// User model for test caretakers / seniors
const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  name: String,
  email: String,
  createdAt: { type: Date, default: Date.now },
  lastCheckInAt: Date,
  lastReminderAt: Date,
});

// CheckIn records
const checkInSchema = new mongoose.Schema({
  userId: String,
  mood: String,
  timestamp: { type: Date, default: Date.now },
});

// Persisted notification events for history/audit
const notificationEventSchema = new mongoose.Schema({
  // use Mongo ObjectId as primary id; provide an eventId string for easy external refs
  eventId: { type: String, default: () => new mongoose.Types.ObjectId().toString(), index: true },
  eventType: String,
  payload: { type: mongoose.Schema.Types.Mixed },
  sourceTopic: String,
  receivedAt: { type: Date, default: Date.now },
  readBy: { type: [String], default: [] }, // Array of userIds who have read this notification
}, { timestamps: true });

// MongoDB Models for Notification Service
// Simple event-driven architecture using MQTT
const processedSchema = new mongoose.Schema({ messageId: { type: String, unique: true }, processedAt: Date }, { timestamps: true });
const retryJobSchema = new mongoose.Schema({ event: { type: mongoose.Schema.Types.Mixed }, attempts: Number, nextAttemptAt: Date, createdAt: { type: Date, default: Date.now } });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const CheckIn = mongoose.models.CheckIn || mongoose.model('CheckIn', checkInSchema);
const ProcessedMessage = mongoose.models.ProcessedMessage || mongoose.model('ProcessedMessage', processedSchema);
const RetryJob = mongoose.models.RetryJob || mongoose.model('RetryJob', retryJobSchema);
const NotificationEvent = mongoose.models.NotificationEvent || mongoose.model('NotificationEvent', notificationEventSchema);

// Device tokens for push (FCM) — can store multiple tokens per user (devices)
const deviceTokenSchema = new mongoose.Schema({
  userId: String,
  token: { type: String, index: true },
  platform: String, // 'android' | 'ios' | 'web'
  createdAt: { type: Date, default: Date.now },
  lastSeenAt: Date,
  revoked: { type: Boolean, default: false }
});

const DeviceToken = mongoose.models.DeviceToken || mongoose.model('DeviceToken', deviceTokenSchema);

// Relationships collection (senior -> family/caregiver links)
const relationshipSchema = new mongoose.Schema({
  seniorId: { type: String, index: true, required: true },
  linkAccId: { type: String, index: true, required: true }, // caregiver/family userId
  relation: { type: String, default: 'family' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'relationships' });

const Relationship = mongoose.models.Relationship || mongoose.model('Relationship', relationshipSchema);

// Verified phone numbers (after OTP verification)
const verifiedPhoneSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  phoneNumber: { 
    type: String, 
    required: true,
    unique: true,
    match: /^\+[1-9]\d{1,14}$/
  },
  verifiedAt: { 
    type: Date, 
    default: Date.now 
  },
  verificationMethod: {
    type: String,
    enum: ['sms', 'voice', 'email'],
    default: 'sms'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  relationship: {
    type: String,
    enum: ['self', 'family', 'caregiver', 'emergency'],
    default: 'self'
  },
  lastSmsAt: Date,
  smsCount: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

verifiedPhoneSchema.index({ userId: 1, phoneNumber: 1 });

const VerifiedPhone = mongoose.models.VerifiedPhone || mongoose.model('VerifiedPhone', verifiedPhoneSchema);

module.exports = {
  connectMongo,
  models: {
    User,
    CheckIn,
    ProcessedMessage,
    RetryJob,
    NotificationEvent,
    DeviceToken,
    Relationship,
    VerifiedPhone,
  }
};
