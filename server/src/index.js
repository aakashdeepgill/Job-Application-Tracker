import app from './app.js';
import { connectToDatabase } from './db.js';

const port = process.env.PORT || 5000;

try {
  await connectToDatabase();
  app.listen(port, () => {
    console.log(`Job tracker API listening on http://localhost:${port}`);
  });
} catch (error) {
  console.error('Could not connect to MongoDB:', error.message);
  process.exit(1);
}

export default app;