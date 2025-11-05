import mongoose, { Schema } from 'mongoose';

const InvitationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    from: String,
    title: String,
    date: String,
    time: String,
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  },
  { timestamps: true }
);

export const Invitation = mongoose.model('Invitation', InvitationSchema);
