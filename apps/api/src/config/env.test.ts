import { describe, expect, it } from 'vitest';
import { loadEnv } from './env.js';

describe('loadEnv', () => {
  it('applies defaults', () => {
    const env = loadEnv({ DATABASE_URL: 'postgres://x' });
    expect(env.PORT).toBe(3000);
    expect(env.CORS_ORIGIN).toBe('http://localhost:5173');
    expect(env.NODE_ENV).toBe('development');
  });

  it('converts PORT to a number', () => {
    expect(loadEnv({ DATABASE_URL: 'postgres://x', PORT: '8080' }).PORT).toBe(8080);
  });

  it('throws a readable error when DATABASE_URL is missing', () => {
    expect(() => loadEnv({})).toThrow(/DATABASE_URL/);
  });
});
