import type { Pool } from 'pg';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkoutExerciseRepository } from './WorkoutExerciseRepository.js';

const pool = { query: vi.fn() };
const repo = new WorkoutExerciseRepository(pool as unknown as Pool);

const row = {
  exercise_id: 7,
  sets: 3,
  reps: 10,
  weight_kg: '60.50',
  rest_seconds: 90,
  position: 2,
  exercise_name: 'Romanian Deadlift',
  exercise_muscle_group: 'legs',
  exercise_equipment: 'Barbell',
};

beforeEach(() => pool.query.mockReset());

describe('WorkoutExerciseRepository', () => {
  it('findByWorkoutId maps the nested exercise and converts weight_kg to a number', async () => {
    pool.query.mockResolvedValue({ rows: [row, { ...row, exercise_id: 8, weight_kg: null }] });
    const result = await repo.findByWorkoutId(1);
    const [sql, params] = pool.query.mock.calls[0]!;
    expect(sql).toMatch(/ORDER BY we\.position, we\.id/);
    expect(params).toEqual([1]);
    expect(result[0]).toEqual({
      exerciseId: 7,
      sets: 3,
      reps: 10,
      weightKg: 60.5,
      restSeconds: 90,
      position: 2,
      exercise: { id: 7, name: 'Romanian Deadlift', muscleGroup: 'legs', equipment: 'Barbell' },
    });
    expect(result[1]!.weightKg).toBeNull();
  });

  it('find uses both ids and returns null when missing', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    expect(await repo.find(1, 7)).toBeNull();
    expect(pool.query.mock.calls[0]![1]).toEqual([1, 7]);
  });

  it('add computes the position in SQL and returns the joined row', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 }).mockResolvedValueOnce({ rows: [row] });
    const result = await repo.add(1, { exerciseId: 7, sets: 3, reps: 10, weightKg: 60.5 });
    const [sql, params] = pool.query.mock.calls[0]!;
    expect(sql).toMatch(/COALESCE\(MAX\(position\), 0\) \+ 1/);
    expect(params).toEqual([1, 7, 3, 10, 60.5, null]);
    expect(result.exerciseId).toBe(7);
  });

  it('update uses both ids and returns null when no row matched', async () => {
    pool.query.mockResolvedValue({ rowCount: 0 });
    const input = { sets: 4, reps: 8, weightKg: null, restSeconds: 60, position: 1 };
    expect(await repo.update(1, 7, input)).toBeNull();
    expect(pool.query.mock.calls[0]![1]).toEqual([1, 7, 4, 8, null, 60, 1]);
    expect(pool.query).toHaveBeenCalledTimes(1); // no re-read when nothing was updated
  });

  it('update returns the re-read row on success', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 }).mockResolvedValueOnce({ rows: [row] });
    const result = await repo.update(1, 7, { sets: 3, reps: 10, position: 2 });
    expect(result?.position).toBe(2);
  });

  it('remove uses both ids and returns true or false', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    expect(await repo.remove(1, 7)).toBe(true);
    expect(pool.query.mock.calls[0]![1]).toEqual([1, 7]);
    pool.query.mockResolvedValueOnce({ rowCount: 0 });
    expect(await repo.remove(1, 8)).toBe(false);
  });

  it('countByExerciseId returns a number', async () => {
    pool.query.mockResolvedValue({ rows: [{ count: '3' }] });
    expect(await repo.countByExerciseId(7)).toBe(3);
    expect(pool.query.mock.calls[0]![1]).toEqual([7]);
  });
});
