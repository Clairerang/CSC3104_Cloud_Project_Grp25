import mongoose, { Schema } from "mongoose";

const TriviaResultSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    questionsAnswered: Number,
    correctAnswers: Number,
    score: Number,
  },
  { timestamps: true }
);

export const TriviaResult = mongoose.model("TriviaResult", TriviaResultSchema);
