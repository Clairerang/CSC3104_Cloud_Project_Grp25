import mongoose, { Schema } from 'mongoose';

const MemoryQuizResultSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    moves: Number,
    timeSpent: Number,
    score: Number,
  },
  { timestamps: true }
);

export const MemoryQuizResult = mongoose.model('MemoryQuizResult', MemoryQuizResultSchema);
