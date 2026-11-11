import { Router } from 'express';
import type { HealthController } from '../controllers/HealthController.js';

export function healthRoutes(controller: HealthController): Router {
  const router = Router();
  router.get('/', controller.check);
  return router;
}
