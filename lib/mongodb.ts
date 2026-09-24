import mongoose, { type Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

// Holds the active connection and any in-flight connection attempt.
type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

// In development, Next.js hot reloading re-runs this module on every change.
// Storing the cache on `globalThis` lets it survive reloads, so we reuse one
// connection instead of opening a new one each time.
declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongooseCache ?? { conn: null, promise: null };
globalThis.mongooseCache = cached;

/**
 * Returns a shared Mongoose connection, creating it on the first call.
 * Concurrent callers wait on the same promise rather than opening duplicates.
 */
async function connectDB(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string, {
      // Fail fast instead of queueing model calls while disconnected.
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Clear the failed promise so the next call can retry the connection.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
