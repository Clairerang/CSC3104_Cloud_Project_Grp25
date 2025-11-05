import mongoose, { Schema } from 'mongoose';

const ActivitySchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    points: { type: Number, default: 10 },
    category: { type: String, enum: ['Exercise', 'Mental', 'Learning', 'Social'], required: true },
  },
  { timestamps: true }
);

export const Activity = mongoose.model('Activity', ActivitySchema);
