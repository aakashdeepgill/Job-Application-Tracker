import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';
import jobRoutes from './routes/jobs.js';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', database: mongoose.connection.readyState === 1 });
});

app.use('/api/jobs', jobRoutes);

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

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job_application_tracker';

try {
  await mongoose.connect(mongoUri, { dbName: process.env.MONGODB_DB || 'job_application_tracker' });
  app.listen(port, () => {
    console.log(`Job tracker API listening on http://localhost:${port}`);
  });
} catch (error) {
  console.error('Could not connect to MongoDB:', error.message);
  process.exit(1);
}