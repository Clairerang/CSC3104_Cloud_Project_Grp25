import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 4000;
export const JWT_SECRET = process.env.JWT_SECRET || 'secret1234@';
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/senior_app';
