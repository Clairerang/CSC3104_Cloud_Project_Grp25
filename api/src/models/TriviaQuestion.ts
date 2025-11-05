import mongoose from 'mongoose';

const triviaQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (arr: string[]) => arr.length >= 2,
      message: 'At least two options are required',
    },
  },
  correctAnswer: {
    type: Number, // index of the correct option
    required: true,
  },
}, { timestamps: true });

export const TriviaQuestion = mongoose.model('TriviaQuestion', triviaQuestionSchema);
