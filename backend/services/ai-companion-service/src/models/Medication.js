// Medication Schema for AI Companion Service
const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  medicationName: {
    type: String,
    required: true,
    trim: true
  },
  
  dosage: {
    type: String,  // e.g., "10mg", "2 tablets", "1 teaspoon"
    required: true
  },
  
  frequency: {
    type: String,  // e.g., "once daily", "twice daily", "every 8 hours"
    required: true
  },
  
  timeOfDay: [{
    type: String,  // e.g., ["08:00", "20:00"] for twice daily
    required: true
  }],
  
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  endDate: {
    type: Date,  // null for ongoing medications
    default: null
  },
  
  reminderEnabled: {
    type: Boolean,
    default: true
  },
  
  lastTakenAt: {
    type: Date,
    default: null
  },
  
  notes: {
    type: String,  // e.g., "Take with food", "For high blood pressure"
    default: ''
  },
  
  isActive: {
    type: Boolean,
    default: true  // false if medication is stopped
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt automatically
});

// Index for efficient querying by userId and active status
MedicationSchema.index({ userId: 1, isActive: 1 });

// Instance method to check if medication is due now
MedicationSchema.methods.isDueNow = function() {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  return this.timeOfDay.some(scheduledTime => {
    const [hour, minute] = scheduledTime.split(':').map(Number);
    const scheduledDate = new Date(now);
    scheduledDate.setHours(hour, minute, 0, 0);
    
    const diffMinutes = Math.abs((now - scheduledDate) / (1000 * 60));
    return diffMinutes <= 30; // Within 30 minutes window
  });
};

// Static method to get today's medications for a user
MedicationSchema.statics.getTodaysMedications = async function(userId) {
  const medications = await this.find({
    userId,
    isActive: true,
    $or: [
      { endDate: null },  // Ongoing medications
      { endDate: { $gte: new Date() } }  // Not yet expired
    ]
  }).sort({ timeOfDay: 1 });
  
  return medications;
};

// Static method to mark medication as taken
MedicationSchema.statics.markAsTaken = async function(medicationId) {
  return await this.findByIdAndUpdate(
    medicationId,
    { lastTakenAt: new Date() },
    { new: true }
  );
};

module.exports = mongoose.model('Medication', MedicationSchema);
