import { describe, expect, it } from 'vitest';
import { createPool } from './pool.js';

describe('createPool', () => {
  it('handles idle connection errors so they cannot crash the process', async () => {
    const pool = createPool('postgres://user:pass@localhost:5432/db');
    expect(pool.listenerCount('error')).toBeGreaterThan(0);
    await pool.end();
  });
});
