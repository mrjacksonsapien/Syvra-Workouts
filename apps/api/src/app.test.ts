import type { Pool } from 'pg';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from './app.js';

function buildApp(query = vi.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] })) {
  const pool = { query } as unknown as Pool;
  return createApp({ pool, corsOrigin: 'http://localhost:5173' });
}

describe('GET /health', () => {
  it('returns 200 when the database answers', async () => {
    const res = await request(buildApp()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', database: 'ok' });
  });

  it('returns 503 when the database is unreachable', async () => {
    const app = buildApp(vi.fn().mockRejectedValue(new Error('down')));
    const res = await request(app).get('/health');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: 'degraded', database: 'unreachable' });
  });
});

describe('unknown routes and bad input', () => {
  it('returns the standard 404 error shape', async () => {
    const res = await request(buildApp()).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await request(buildApp())
      .post('/health')
      .set('Content-Type', 'application/json')
      .send('{bad');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('CORS', () => {
  it('allows only the configured origin', async () => {
    const app = buildApp();
    const allowed = await request(app).get('/health').set('Origin', 'http://localhost:5173');
    const other = await request(app).get('/health').set('Origin', 'http://evil.example');
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(other.headers['access-control-allow-origin']).toBeUndefined();
  });
});
