import type { Request, Response } from 'express';
import type { ExerciseService } from '../services/ExerciseService.js';

// HTTP only: reads validated input, calls the service, sends the response.
export class ExerciseController {
  constructor(private readonly service: ExerciseService) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    res.json(await this.service.list(res.locals.query.muscleGroup));
  };

  get = async (_req: Request, res: Response): Promise<void> => {
    res.json(await this.service.get(res.locals.params.id));
  };

  listWorkouts = async (_req: Request, res: Response): Promise<void> => {
    res.json(await this.service.listWorkouts(res.locals.params.id));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(await this.service.create(req.body));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.service.update(res.locals.params.id, req.body));
  };

  delete = async (_req: Request, res: Response): Promise<void> => {
    await this.service.delete(res.locals.params.id);
    res.status(204).end();
  };
}
