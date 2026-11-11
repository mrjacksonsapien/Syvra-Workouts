import cors from 'cors';
import express from 'express';
import type { Express } from 'express';
import type { Pool } from 'pg';
import { ExerciseController } from './controllers/ExerciseController.js';
import { HealthController } from './controllers/HealthController.js';
import { WorkoutController } from './controllers/WorkoutController.js';
import { WorkoutExerciseController } from './controllers/WorkoutExerciseController.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { ExerciseRepository } from './repositories/ExerciseRepository.js';
import { HealthRepository } from './repositories/HealthRepository.js';
import { WorkoutExerciseRepository } from './repositories/WorkoutExerciseRepository.js';
import { WorkoutRepository } from './repositories/WorkoutRepository.js';
import { exerciseRoutes } from './routes/exercise.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { workoutRoutes } from './routes/workout.routes.js';
import { ExerciseService } from './services/ExerciseService.js';
import { WorkoutExerciseService } from './services/WorkoutExerciseService.js';
import { WorkoutService } from './services/WorkoutService.js';

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

  const exerciseRepository = new ExerciseRepository(pool);
  const workoutRepository = new WorkoutRepository(pool);
  const workoutExerciseRepository = new WorkoutExerciseRepository(pool);

  const exerciseService = new ExerciseService(
    exerciseRepository,
    workoutExerciseRepository,
    workoutRepository,
  );
  const workoutService = new WorkoutService(workoutRepository, workoutExerciseRepository);
  const workoutExerciseService = new WorkoutExerciseService(
    workoutRepository,
    exerciseRepository,
    workoutExerciseRepository,
  );

  app.use('/api/exercises', exerciseRoutes(new ExerciseController(exerciseService)));
  app.use(
    '/api/workouts',
    workoutRoutes(
      new WorkoutController(workoutService),
      new WorkoutExerciseController(workoutExerciseService),
    ),
  );

  app.use(notFound);
  app.use(errorHandler); // must be last

  return app;
}
