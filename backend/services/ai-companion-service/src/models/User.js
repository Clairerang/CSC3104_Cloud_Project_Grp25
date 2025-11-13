const mongoose = require('mongoose');

// Profile Schema (embedded document)
const ProfileSchema = new mongoose.Schema({
  name: { type: String },
  age: { type: Number },
  email: { type: String },
  contact: { type: String },
  address: { type: String },
  phoneNumber: { type: String }, // For elderly/caretaker, starts with +
  emailContact: { type: String } // For caretaker email notifications
}, { _id: false });

// User Schema
const UserSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    required: true, 
    enum: ['senior', 'family', 'admin'] 
  },
  profile: ProfileSchema,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Update the updatedAt timestamp on save
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
