import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  let mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    // Strip any accidental enclosing quotes and whitespace
    mongoUri = mongoUri.trim().replace(/^["']|["']$/g, '');
  } else {
    if (process.env.VERCEL) {
      console.error('CRITICAL: MONGODB_URI environment variable is missing in Vercel runtime!');
    }
    mongoUri = 'mongodb://127.0.0.1:27017/job_application_tracker';
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB || 'job_application_tracker',
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose.connect(mongoUri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
