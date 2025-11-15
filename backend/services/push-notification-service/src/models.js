const mongoose = require('mongoose');

// Use consolidated senior_care database (prefer MONGODB_URI)
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://mongodb:27017/senior_care';

let _connected = false;

async function connectMongo() {
  if (_connected) return;
  try {
    await mongoose.connect(MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('🗄️ MongoDB connected for push notifications');
    _connected = true;
  } catch (e) {
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }
}

// Device Token Schema
const deviceTokenSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  token: { type: String, required: true, unique: true },
  platform: { type: String, default: 'unknown' },
  revoked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now }
});

const DeviceToken = mongoose.model('DeviceToken', deviceTokenSchema);

module.exports = {
  connectMongo,
  models: {
    DeviceToken
  }
};
