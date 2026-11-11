import type { Pool } from 'pg';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkoutRepository } from './WorkoutRepository.js';

const pool = { query: vi.fn() };
const repo = new WorkoutRepository(pool as unknown as Pool);

const row = {
  id: 1,
  name: 'Push Day',
  description: null,
  scheduled_date: '2026-11-16',
  created_at: new Date('2026-01-01T10:00:00Z'),
  updated_at: new Date('2026-01-02T10:00:00Z'),
};

const input = { name: 'Push Day', description: undefined, scheduledDate: '2026-11-16' };

beforeEach(() => pool.query.mockReset());

describe('WorkoutRepository', () => {
  it('findAll maps exercise_count (a string from pg) to a number', async () => {
    pool.query.mockResolvedValue({ rows: [{ ...row, exercise_count: '4' }] });
    const result = await repo.findAll();
    expect(result[0]).toMatchObject({ id: 1, scheduledDate: '2026-11-16', exerciseCount: 4 });
    expect(pool.query.mock.calls[0]![0]).toMatch(/NULLS LAST/);
  });

  it('findById returns null when there is no row', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    expect(await repo.findById(9)).toBeNull();
    expect(pool.query.mock.calls[0]![1]).toEqual([9]);
  });

  it('findById maps a row to a workout', async () => {
    pool.query.mockResolvedValue({ rows: [row] });
    expect(await repo.findById(1)).toEqual({
      id: 1,
      name: 'Push Day',
      description: null,
      scheduledDate: '2026-11-16',
      createdAt: '2026-01-01T10:00:00.000Z',
      updatedAt: '2026-01-02T10:00:00.000Z',
    });
  });

  it('findByExerciseId passes the id and maps the joined fields', async () => {
    pool.query.mockResolvedValue({
      rows: [
        { ...row, sets: 4, reps: 8, weight_kg: '60.00', rest_seconds: 120 },
        { ...row, id: 2, sets: 3, reps: 15, weight_kg: null, rest_seconds: null },
      ],
    });
    const result = await repo.findByExerciseId(7);
    expect(pool.query.mock.calls[0]![1]).toEqual([7]);
    expect(result[0]).toMatchObject({ id: 1, sets: 4, reps: 8, weightKg: 60, restSeconds: 120 });
    expect(result[1]).toMatchObject({ weightKg: null, restSeconds: null });
  });

  it('create turns undefined optionals into null', async () => {
    pool.query.mockResolvedValue({ rows: [row] });
    await repo.create(input);
    expect(pool.query.mock.calls[0]![1]).toEqual(['Push Day', null, '2026-11-16']);
  });

  it('update puts the id first and returns null when nothing matched', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    expect(await repo.update(3, input)).toBeNull();
    expect(pool.query.mock.calls[0]![1]).toEqual([3, 'Push Day', null, '2026-11-16']);
  });

  it('delete returns true or false from rowCount', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    expect(await repo.delete(1)).toBe(true);
    pool.query.mockResolvedValueOnce({ rowCount: 0 });
    expect(await repo.delete(2)).toBe(false);
  });
});
