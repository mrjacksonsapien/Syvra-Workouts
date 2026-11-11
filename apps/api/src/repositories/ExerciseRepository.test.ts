import type { Pool } from 'pg';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExerciseRepository } from './ExerciseRepository.js';

const pool = { query: vi.fn() };
const repo = new ExerciseRepository(pool as unknown as Pool);

const row = {
  id: 1,
  name: 'Back Squat',
  muscle_group: 'legs',
  description: null,
  equipment: 'Barbell',
  created_at: new Date('2026-01-01T10:00:00Z'),
  updated_at: new Date('2026-01-02T10:00:00Z'),
};

const input = { name: 'Back Squat', muscleGroup: 'legs', description: 'Deep', equipment: undefined } as const;

beforeEach(() => pool.query.mockReset());

describe('ExerciseRepository', () => {
  it('findAll without filter sends no parameters', async () => {
    pool.query.mockResolvedValue({ rows: [row] });
    await repo.findAll();
    const [sql, params] = pool.query.mock.calls[0]!;
    expect(sql).not.toMatch(/WHERE/);
    expect(params).toBeUndefined();
  });

  it('findAll with a filter uses a parameterised WHERE', async () => {
    pool.query.mockResolvedValue({ rows: [row] });
    const result = await repo.findAll({ muscleGroup: 'legs' });
    const [sql, params] = pool.query.mock.calls[0]!;
    expect(sql).toMatch(/WHERE muscle_group = \$1/);
    expect(params).toEqual(['legs']);
    expect(result[0]).toEqual({
      id: 1,
      name: 'Back Squat',
      muscleGroup: 'legs',
      description: null,
      equipment: 'Barbell',
      createdAt: '2026-01-01T10:00:00.000Z',
      updatedAt: '2026-01-02T10:00:00.000Z',
    });
  });

  it('findById returns null when there is no row', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    expect(await repo.findById(99)).toBeNull();
    expect(pool.query.mock.calls[0]![1]).toEqual([99]);
  });

  it('findByName passes the name as a parameter', async () => {
    pool.query.mockResolvedValue({ rows: [row] });
    expect((await repo.findByName('Back Squat'))?.id).toBe(1);
    expect(pool.query.mock.calls[0]![1]).toEqual(['Back Squat']);
  });

  it('create passes values in order, turns undefined into null and returns the mapped row', async () => {
    pool.query.mockResolvedValue({ rows: [row] });
    const result = await repo.create(input);
    expect(pool.query.mock.calls[0]![1]).toEqual(['Back Squat', 'legs', 'Deep', null]);
    expect(result.muscleGroup).toBe('legs');
  });

  it('update puts the id first and returns null when nothing matched', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    expect(await repo.update(5, input)).toBeNull();
    expect(pool.query.mock.calls[0]![1]).toEqual([5, 'Back Squat', 'legs', 'Deep', null]);
  });

  it('delete returns true or false from rowCount', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    expect(await repo.delete(1)).toBe(true);
    pool.query.mockResolvedValueOnce({ rowCount: 0 });
    expect(await repo.delete(2)).toBe(false);
  });
});
