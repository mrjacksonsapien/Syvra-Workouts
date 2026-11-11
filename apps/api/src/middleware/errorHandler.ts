import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/index.js';

// Safety net for raw PostgreSQL errors (e.g. two requests racing past the service checks).
const PG_ERRORS: Record<string, { status: number; code: string; message: string }> = {
  '23505': { status: 409, code: 'CONFLICT', message: 'This value already exists' },
  '23503': { status: 409, code: 'CONFLICT', message: 'This item is referenced by another item' },
  '23514': { status: 400, code: 'VALIDATION_ERROR', message: 'A value is not allowed' },
};

// Express recognises error middleware by its 4 parameters, so the unused `_next` must stay.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  const pgError = PG_ERRORS[(err as { code?: string }).code ?? ''];
  if (pgError) {
    res.status(pgError.status).json({ error: { code: pgError.code, message: pgError.message } });
    return;
  }

  // Malformed JSON body: body-parser sets status 400.
  if ((err as { type?: string }).type === 'entity.parse.failed') {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON body' } });
    return;
  }

  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
};
