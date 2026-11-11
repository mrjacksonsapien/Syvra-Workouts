import { describe, expect, it, vi } from 'vitest';
import { NotFoundError } from '../errors/index.js';
import { WorkoutService } from './WorkoutService.js';

describe('WorkoutService', () => {
  it('get returns the workout with its exercises', async () => {
    const workouts = { findById: vi.fn().mockResolvedValue({ id: 1, name: 'Push' }) };
    const links = { findByWorkoutId: vi.fn().mockResolvedValue([{ exerciseId: 1 }]) };
    const service = new WorkoutService(workouts as never, links as never);
    expect(await service.get(1)).toEqual({ id: 1, name: 'Push', exercises: [{ exerciseId: 1 }] });
  });

  it('get, update and delete throw NotFoundError for a missing workout', async () => {
    const workouts = {
      findById: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue(null),
      delete: vi.fn().mockResolvedValue(false),
    };
    const service = new WorkoutService(workouts as never, {} as never);
    await expect(service.get(1)).rejects.toBeInstanceOf(NotFoundError);
    await expect(service.update(1, { name: 'Push' })).rejects.toBeInstanceOf(NotFoundError);
    await expect(service.delete(1)).rejects.toBeInstanceOf(NotFoundError);
  });
});
