import type { Request, Response } from 'express';
import type { WorkoutExerciseService } from '../services/WorkoutExerciseService.js';

export class WorkoutExerciseController {
  constructor(private readonly service: WorkoutExerciseService) {}

  add = async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(await this.service.add(res.locals.params.id, req.body));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id, exerciseId } = res.locals.params;
    res.json(await this.service.update(id, exerciseId, req.body));
  };

  remove = async (_req: Request, res: Response): Promise<void> => {
    const { id, exerciseId } = res.locals.params;
    await this.service.remove(id, exerciseId);
    res.status(204).end();
  };
}
