import type { RequestHandler } from 'express';
import { NotFoundError } from '../errors/index.js';

// Runs only when no route matched.
export const notFound: RequestHandler = (req) => {
  throw new NotFoundError(`Route ${req.method} ${req.path} not found`);
};
