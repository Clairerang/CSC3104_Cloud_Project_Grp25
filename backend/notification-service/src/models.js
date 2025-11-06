const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017/notification';

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
}, { timestamps: true });

// Outbox table for reliable publish (Outbox pattern)
const outboxSchema = new mongoose.Schema({
  messageId: { type: String, default: () => new mongoose.Types.ObjectId().toString(), index: true },
  eventType: String,
  payload: { type: mongoose.Schema.Types.Mixed },
  published: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
  lastError: String,
  createdAt: { type: Date, default: Date.now },
  publishedAt: Date,
  nextAttemptAt: Date
});

const Outbox = mongoose.models.Outbox || mongoose.model('Outbox', outboxSchema);

// Existing models used by kafkaConsumer (idempotency + retry)
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
    Outbox,
    VerifiedPhone,
  }
};
