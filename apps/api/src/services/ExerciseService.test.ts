import { describe, expect, it, vi } from 'vitest';
import { ConflictError, NotFoundError } from '../errors/index.js';
import { ExerciseService } from './ExerciseService.js';

const exercise = { id: 1, name: 'Squat', muscleGroup: 'legs' } as never;

function build(overrides: { found?: unknown; count?: number; byName?: unknown } = {}) {
  const exercises = {
    findById: vi.fn().mockResolvedValue('found' in overrides ? overrides.found : exercise),
    findByName: vi.fn().mockResolvedValue(overrides.byName ?? null),
    create: vi.fn().mockResolvedValue(exercise),
    update: vi.fn().mockResolvedValue(exercise),
    delete: vi.fn().mockResolvedValue(true),
    findAll: vi.fn(),
  };
  const workoutExercises = { countByExerciseId: vi.fn().mockResolvedValue(overrides.count ?? 0) };
  const workouts = { findByExerciseId: vi.fn().mockResolvedValue([]) };
  const service = new ExerciseService(exercises as never, workoutExercises as never, workouts as never);
  return { service, exercises };
}

describe('ExerciseService', () => {
  it('delete throws EXERCISE_IN_USE when workouts use it', async () => {
    const { service, exercises } = build({ count: 3 });
    await expect(service.delete(1)).rejects.toMatchObject({
      code: 'EXERCISE_IN_USE',
      details: { workoutCount: 3 },
    });
    expect(exercises.delete).not.toHaveBeenCalled();
  });

  it('delete throws NotFoundError when missing', async () => {
    const { service } = build({ found: null });
    await expect(service.delete(1)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('delete calls the repository when unused', async () => {
    const { service, exercises } = build();
    await service.delete(1);
    expect(exercises.delete).toHaveBeenCalledWith(1);
  });

  it('create rejects a duplicate name', async () => {
    const { service } = build({ byName: { id: 2 } });
    await expect(service.create({ name: 'Squat', muscleGroup: 'legs' })).rejects.toBeInstanceOf(ConflictError);
  });

  it('update lets an exercise keep its own name', async () => {
    const { service, exercises } = build({ byName: { id: 1 } });
    await service.update(1, { name: 'Squat', muscleGroup: 'legs' });
    expect(exercises.update).toHaveBeenCalled();
  });
});
