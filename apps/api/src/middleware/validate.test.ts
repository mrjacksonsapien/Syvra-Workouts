import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { errorHandler } from './errorHandler.js';
import { validate } from './validate.js';

const bodySchema = z.object({ name: z.string().trim().min(2) });
const paramsSchema = z.object({ id: z.coerce.number().int().positive() });

function buildApp() {
  const app = express();
  app.use(express.json());
  app.post('/items/:id', validate({ params: paramsSchema, body: bodySchema }), (req, res) => {
    res.json({ params: res.locals.params, body: req.body });
  });
  app.use(errorHandler);
  return app;
}

describe('validate', () => {
  it('passes parsed values (trimmed, converted) to the handler', async () => {
    const res = await request(buildApp()).post('/items/4').send({ name: '  Squat  ' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ params: { id: 4 }, body: { name: 'Squat' } });
  });

  it('returns 400 with fieldErrors for a bad body', async () => {
    const res = await request(buildApp()).post('/items/4').send({ name: 'a' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.fieldErrors.name).toHaveLength(1);
  });

  it('returns 400 for a bad id param', async () => {
    const res = await request(buildApp()).post('/items/abc').send({ name: 'Squat' });
    expect(res.status).toBe(400);
    expect(res.body.error.details.fieldErrors.id).toBeDefined();
  });
});
