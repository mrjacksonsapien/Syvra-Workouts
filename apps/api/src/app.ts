import cors from 'cors';
import express from 'express';
import type { Express } from 'express';
import type { Pool } from 'pg';
import { HealthController } from './controllers/HealthController.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { HealthRepository } from './repositories/HealthRepository.js';
import { healthRoutes } from './routes/health.routes.js';

interface AppOptions {
  pool: Pool;
  corsOrigin: string; // comma-separated list of allowed origins
}

// Composition root: builds every object and passes dependencies through constructors.
// It never calls listen(), so tests can use the app without opening a port.
export function createApp({ pool, corsOrigin }: AppOptions): Express {
  const app = express();

  app.use(cors({ origin: corsOrigin.split(',').map((o) => o.trim()) }));
  app.use(express.json({ limit: '100kb' }));

  const healthRepository = new HealthRepository(pool);
  const healthController = new HealthController(healthRepository);
  app.use('/health', healthRoutes(healthController));

  // Later milestones mount /api/exercises and /api/workouts here.

  app.use(notFound);
  app.use(errorHandler); // must be last

  return app;
}
