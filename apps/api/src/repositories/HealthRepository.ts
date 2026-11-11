import type { Pool } from 'pg';

export class HealthRepository {
  constructor(private readonly pool: Pool) {}

  // True when the database answers a trivial query.
  async ping(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
