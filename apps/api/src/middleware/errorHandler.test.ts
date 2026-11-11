import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConflictError, NotFoundError } from '../errors/index.js';
import { errorHandler } from './errorHandler.js';

// Builds a tiny app whose only route throws the given error.
function appThrowing(error: unknown) {
  const app = express();
  app.get('/', () => {
    throw error;
  });
  app.use(errorHandler);
  return app;
}

afterEach(() => vi.restoreAllMocks());

describe('errorHandler', () => {
  it('sends AppError status, code, message and details', async () => {
    const res = await request(
      appThrowing(new ConflictError('EXERCISE_IN_USE', 'In use', { workoutCount: 3 })),
    ).get('/');
    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      error: { code: 'EXERCISE_IN_USE', message: 'In use', details: { workoutCount: 3 } },
    });
  });

  it('uses the subclass status', async () => {
    const res = await request(appThrowing(new NotFoundError('Exercise 4 not found'))).get('/');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it.each([
    ['23505', 409],
    ['23503', 409],
    ['23514', 400],
  ])('maps Postgres code %s to %i', async (code, status) => {
    const res = await request(appThrowing(Object.assign(new Error('pg'), { code }))).get('/');
    expect(res.status).toBe(status);
  });

  it('hides unknown errors behind a generic 500', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(appThrowing(new Error('secret SQL detail'))).get('/');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(res.body)).not.toContain('secret');
  });
});
