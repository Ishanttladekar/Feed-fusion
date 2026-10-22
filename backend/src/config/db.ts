import mongoose from 'mongoose';
import { config } from './env';

export async function connectDB(): Promise<void> {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    // Don't crash immediately in dev, retry after 5s
    setTimeout(connectDB, 5000);
  }
}
