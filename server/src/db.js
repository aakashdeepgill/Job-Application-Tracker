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
        'CRITICAL: MongoDB connection string is missing. Please add MONGODB_URI in Vercel (Settings > Environment Variables) and click Redeploy.';
      console.error(errMessage);
      throw new Error(errMessage);
    }
    // Local development fallback only
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
