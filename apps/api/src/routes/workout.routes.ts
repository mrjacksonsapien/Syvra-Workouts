import { Router } from 'express';
import {
  addWorkoutExerciseSchema,
  idParamsSchema,
  updateWorkoutExerciseSchema,
  workoutExerciseParamsSchema,
  workoutInputSchema,
} from '@syvra/shared';
import type { WorkoutController } from '../controllers/WorkoutController.js';
import type { WorkoutExerciseController } from '../controllers/WorkoutExerciseController.js';
import { validate } from '../middleware/validate.js';

export function workoutRoutes(
  controller: WorkoutController,
  exerciseController: WorkoutExerciseController,
): Router {
  const router = Router();
  router.get('/', controller.list);
  router.get('/:id', validate({ params: idParamsSchema }), controller.get);
  router.post('/', validate({ body: workoutInputSchema }), controller.create);
  router.put('/:id', validate({ params: idParamsSchema, body: workoutInputSchema }), controller.update);
  router.delete('/:id', validate({ params: idParamsSchema }), controller.delete);

  router.post(
    '/:id/exercises',
    validate({ params: idParamsSchema, body: addWorkoutExerciseSchema }),
    exerciseController.add,
  );
  router.put(
    '/:id/exercises/:exerciseId',
    validate({ params: workoutExerciseParamsSchema, body: updateWorkoutExerciseSchema }),
    exerciseController.update,
  );
  router.delete(
    '/:id/exercises/:exerciseId',
    validate({ params: workoutExerciseParamsSchema }),
    exerciseController.remove,
  );
  return router;
}
