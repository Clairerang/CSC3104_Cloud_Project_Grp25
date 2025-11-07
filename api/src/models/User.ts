import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['senior', 'family', 'admin'], default: 'senior' },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', UserSchema);
