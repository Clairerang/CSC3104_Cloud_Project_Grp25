import mongoose, { Schema } from 'mongoose';

const ContactSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phoneNumber: String,
    isFavorite: { type: Boolean, default: false },
    lastCall: Date,
  },
  { timestamps: true }
);

export const Contact = mongoose.model('Contact', ContactSchema);
