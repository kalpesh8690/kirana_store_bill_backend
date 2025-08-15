import mongoose from 'mongoose';
import { logger } from './logger.js';

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { autoIndex: true });
  logger.info('MongoDB connected');
}
