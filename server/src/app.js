import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';
import jobRoutes from './routes/jobs.js';
import { connectToDatabase, getMongoUri } from './db.js';

try {
  dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });
} catch {
  // Ignore in production or environments where .env is absent
}

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health checks (available immediately, never blocked by database connection)
const healthHandler = (_request, response) => {
  response.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1,
    hasMongoUri: Boolean(getMongoUri()),
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Middleware to ensure DB connection is established for API routes
app.use(async (_request, response, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error:', error.message);
    response.status(500).json({
      message: `Could not connect to database: ${error.message}`,
      hasMongoUri: Boolean(getMongoUri()),
      error: error.message,
    });
  }
});

app.use('/api/jobs', jobRoutes);
app.use('/jobs', jobRoutes);

app.use((error, _request, response, _next) => {
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return response.status(400).json({ message: error.message });
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return response.status(400).json({ message: 'Request body must contain valid JSON.' });
  }

  console.error(error);
  response.status(500).json({ message: 'Something went wrong on the server.' });
});

export default app;
