// MongoDB model for verified phone numbers
const mongoose = require('mongoose');

const VerifiedPhoneSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  phoneNumber: { 
    type: String, 
    required: true,
    unique: true,  // One phone per user
    match: /^\+[1-9]\d{1,14}$/  // E.164 format
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
  // For emergency contacts - link to family members
  relationship: {
    type: String,
    enum: ['self', 'family', 'caregiver', 'emergency'],
    default: 'self'
  },
  // Track when we last sent SMS to this number
  lastSmsAt: Date,
  // Count of SMS sent (for monitoring)
  smsCount: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

// Index for quick lookups
VerifiedPhoneSchema.index({ userId: 1, phoneNumber: 1 });
VerifiedPhoneSchema.index({ phoneNumber: 1 });

module.exports = mongoose.model('VerifiedPhone', VerifiedPhoneSchema);
