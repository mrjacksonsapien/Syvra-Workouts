import { describe, expect, it, vi } from 'vitest';
import { NotFoundError } from '../errors/index.js';
import { WorkoutExerciseService } from './WorkoutExerciseService.js';

const input = { exerciseId: 7, sets: 3, reps: 10 };

function build(opts: { workout?: boolean; exercise?: boolean; link?: boolean } = {}) {
  const { workout = true, exercise = true, link = false } = opts;
  const workouts = { findById: vi.fn().mockResolvedValue(workout ? { id: 1 } : null) };
  const exercises = { findById: vi.fn().mockResolvedValue(exercise ? { id: 7 } : null) };
  const links = {
    find: vi.fn().mockResolvedValue(link ? {} : null),
    add: vi.fn().mockResolvedValue({ exerciseId: 7 }),
    update: vi.fn().mockResolvedValue(null),
    remove: vi.fn().mockResolvedValue(false),
  };
  const service = new WorkoutExerciseService(workouts as never, exercises as never, links as never);
  return { service, links };
}

describe('WorkoutExerciseService', () => {
  it('add throws NotFoundError when the workout is missing', async () => {
    await expect(build({ workout: false }).service.add(1, input)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('add throws NotFoundError when the exercise is missing', async () => {
    await expect(build({ exercise: false }).service.add(1, input)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('add throws EXERCISE_ALREADY_IN_WORKOUT when linked', async () => {
    await expect(build({ link: true }).service.add(1, input)).rejects.toMatchObject({
      code: 'EXERCISE_ALREADY_IN_WORKOUT',
    });
  });

  it('add inserts when everything is fine', async () => {
    const { service, links } = build();
    await service.add(1, input);
    expect(links.add).toHaveBeenCalledWith(1, input);
  });

  it('update and remove throw NotFoundError when the link is missing', async () => {
    const { service } = build();
    await expect(service.update(1, 7, { sets: 1, reps: 1, position: 1 })).rejects.toBeInstanceOf(NotFoundError);
    await expect(service.remove(1, 7)).rejects.toBeInstanceOf(NotFoundError);
  });
});
