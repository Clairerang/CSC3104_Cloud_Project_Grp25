import mongoose, { Schema } from 'mongoose';

const CheckInSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mood: { type: String, enum: ['great', 'okay', 'not-well'], required: true },
    session: { type: String, enum: ['morning', 'afternoon', 'evening'], required: true },
    date: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

export const CheckIn = mongoose.model('CheckIn', CheckInSchema);
