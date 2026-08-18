import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/error.js';
import checkinsRouter from './routes/checkins.js';
import analyticsRouter from './routes/analytics.js';
import usersRouter from './routes/users.js';
import documentsRouter from './routes/documents.js';
import aiRouter from './routes/ai.js';
import adminRouter from './routes/admin.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(authMiddleware);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/checkins', checkinsRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/documents', documentsRouter);

  app.use((req, res) => res.status(404).json({ error: 'Not found' }));
  app.use(errorHandler);
  return app;
}
