import { Router } from 'express';
import { exerciseInputSchema, exerciseListQuerySchema, idParamsSchema } from '@syvra/shared';
import type { ExerciseController } from '../controllers/ExerciseController.js';
import { validate } from '../middleware/validate.js';

export function exerciseRoutes(controller: ExerciseController): Router {
  const router = Router();
  router.get('/', validate({ query: exerciseListQuerySchema }), controller.list);
  router.get('/:id', validate({ params: idParamsSchema }), controller.get);
  router.get('/:id/workouts', validate({ params: idParamsSchema }), controller.listWorkouts);
  router.post('/', validate({ body: exerciseInputSchema }), controller.create);
  router.put('/:id', validate({ params: idParamsSchema, body: exerciseInputSchema }), controller.update);
  router.delete('/:id', validate({ params: idParamsSchema }), controller.delete);
  return router;
}
