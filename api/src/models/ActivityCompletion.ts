import mongoose, { Schema } from 'mongoose';

const ActivityCompletionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    activityId: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
    score: Number,
    duration: Number,
    awardedPoints: Number,
  },
  { timestamps: true }
);

export const ActivityCompletion = mongoose.model('ActivityCompletion', ActivityCompletionSchema);
