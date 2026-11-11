import type { Request, Response } from 'express';
import type { HealthRepository } from '../repositories/HealthRepository.js';

export class HealthController {
  constructor(private readonly healthRepository: HealthRepository) {}

  // Arrow function so `this` still works when the method is passed to the router.
  check = async (_req: Request, res: Response): Promise<void> => {
    const databaseUp = await this.healthRepository.ping();
    if (databaseUp) {
      res.json({ status: 'ok', database: 'ok' });
    } else {
      res.status(503).json({ status: 'degraded', database: 'unreachable' });
    }
  };
}
