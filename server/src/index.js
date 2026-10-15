import { fileURLToPath } from 'node:url';
import app from './app.js';
import { connectToDatabase } from './db.js';

const port = process.env.PORT || 5000;

// Only connect and listen on a port when run directly in local development
const isDirectRun = Boolean(process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]);

if (isDirectRun && !process.env.VERCEL) {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`Job tracker API listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  }
}

export default app;