import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export function getMongoUri() {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL ||
    process.env.MONGODB_URL ||
    process.env.MONGO_URL;

  if (uri) {
    return uri.trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

export async function connectToDatabase() {
  const isServerlessOrProd = Boolean(process.env.VERCEL || process.env.NODE_ENV === 'production');
  let mongoUri = getMongoUri();

  if (!mongoUri) {
    if (isServerlessOrProd) {
      const errMessage =
        'MongoDB connection string is missing. Please set MONGODB_URI in Vercel (Settings > Environment Variables) and Redeploy.';
      console.error(errMessage);
      throw new Error(errMessage);
    }
    // Local development fallback only
    mongoUri = 'mongodb://127.0.0.1:27017/job_application_tracker';
  }

  // If already connected, reuse connection
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose.connection;
    return cached.conn;
  }

  // Reset cached connection and promise if not ready
  cached.conn = null;
  cached.promise = null;

  const opts = {
    bufferCommands: false,
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    dbName: process.env.MONGODB_DB || 'job_application_tracker',
  };

  try {
    cached.promise = mongoose.connect(mongoUri, opts);
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
}
