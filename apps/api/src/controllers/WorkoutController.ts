import type { Request, Response } from 'express';
import type { WorkoutService } from '../services/WorkoutService.js';

export class WorkoutController {
  constructor(private readonly service: WorkoutService) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    res.json(await this.service.list());
  };

  get = async (_req: Request, res: Response): Promise<void> => {
    res.json(await this.service.get(res.locals.params.id));
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
