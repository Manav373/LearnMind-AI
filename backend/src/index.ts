import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';

import { connectDB } from './db';
import { seedConcepts } from './seed';
import authRoutes from './routes/auth';
import conceptRoutes from './routes/concepts';
import progressRoutes from './routes/progress';
import aiRoutes from './routes/ai';
import recommendationRoutes from './routes/recommendations';
import courseRoutes from './routes/course';
import externalRoutes from './routes/external';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Routes
app.use('/auth', authRoutes);
app.use('/concepts', conceptRoutes);
app.use('/progress', progressRoutes);
app.use('/ai', aiRoutes);
app.use('/recommendations', recommendationRoutes);
app.use('/courses', courseRoutes);
app.use('/external', externalRoutes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Catch-all 404 for debugging
app.use((req, res) => {
  console.log(`🔍 404 at ${req.method} ${req.url}`);
  res.status(404).json({ error: `Path ${req.url} not found` });
});

// Connect to DB and start server
const start = async () => {
  try {
    await connectDB();
    await seedConcepts(); // auto-seed on first run
    app.listen(PORT, () => {
      console.log(`🚀 LearnMind API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

start();

export default app;
