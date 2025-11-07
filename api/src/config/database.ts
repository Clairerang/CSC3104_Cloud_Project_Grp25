import mongoose from 'mongoose';
import { MONGODB_URI } from './env';

export async function connectMongo() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Mongo connection error', err);
    process.exit(1);
  }
}
