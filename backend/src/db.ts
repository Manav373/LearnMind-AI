import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer | null = null;

/**
 * Connects to MongoDB. Uses an in-memory server for development
 * if MONGODB_URI is not set or connection fails.
 */
export const connectDB = async (): Promise<string> => {
  const uri = process.env.MONGODB_URI;

  // Try connecting to the provided URI first
  if (uri) {
    try {
      await mongoose.connect(uri);
      console.log('✅ Connected to MongoDB (external)');
      return uri;
    } catch (err) {
      console.log('⚠️ External MongoDB unavailable, falling back to in-memory...');
    }
  }

  // Fall back to in-memory MongoDB
  mongod = await MongoMemoryServer.create();
  const memUri = mongod.getUri();
  await mongoose.connect(memUri);
  console.log('✅ Connected to in-memory MongoDB');
  console.log('   ℹ️  Data will be lost on restart. Set MONGODB_URI for persistence.');
  return memUri;
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
};
