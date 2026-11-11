import { describe, expect, it } from 'vitest';
import {
  addWorkoutExerciseSchema,
  exerciseInputSchema,
  exerciseListQuerySchema,
  idParamsSchema,
  updateWorkoutExerciseSchema,
  workoutExerciseParamsSchema,
  workoutInputSchema,
} from './schemas.js';

describe('exerciseInputSchema', () => {
  it('accepts a valid exercise and trims the name', () => {
    const result = exerciseInputSchema.parse({ name: '  Goblet Squat ', muscleGroup: 'legs' });
    expect(result.name).toBe('Goblet Squat');
  });

  it('accepts null description and equipment', () => {
    expect(
      exerciseInputSchema.safeParse({
        name: 'Plank',
        muscleGroup: 'core',
        description: null,
        equipment: null,
      }).success,
    ).toBe(true);
  });

  it.each([
    ['name too short', { name: 'A', muscleGroup: 'legs' }],
    ['name only spaces', { name: '   ', muscleGroup: 'legs' }],
    ['name too long', { name: 'x'.repeat(81), muscleGroup: 'legs' }],
    ['unknown muscle group', { name: 'Plank', muscleGroup: 'neck' }],
    ['missing muscle group', { name: 'Plank' }],
    ['description too long', { name: 'Plank', muscleGroup: 'core', description: 'x'.repeat(501) }],
    ['equipment too long', { name: 'Plank', muscleGroup: 'core', equipment: 'x'.repeat(51) }],
  ])('rejects %s', (_label, input) => {
    expect(exerciseInputSchema.safeParse(input).success).toBe(false);
  });
});

describe('workoutInputSchema', () => {
  it('accepts a name only, or with a valid date', () => {
    expect(workoutInputSchema.safeParse({ name: 'Leg Day' }).success).toBe(true);
    expect(
      workoutInputSchema.safeParse({ name: 'Leg Day', scheduledDate: '2026-11-20' }).success,
    ).toBe(true);
    expect(workoutInputSchema.safeParse({ name: 'Leg Day', scheduledDate: null }).success).toBe(
      true,
    );
  });

  it.each(['2026-02-30', '2026-13-01', '20-11-2026', '2026-1-5', 'tomorrow'])(
    'rejects scheduledDate %s',
    (scheduledDate) => {
      expect(workoutInputSchema.safeParse({ name: 'Leg Day', scheduledDate }).success).toBe(false);
    },
  );

  it('rejects a short name', () => {
    expect(workoutInputSchema.safeParse({ name: 'L' }).success).toBe(false);
  });
});

describe('addWorkoutExerciseSchema', () => {
  const valid = { exerciseId: 7, sets: 3, reps: 10, weightKg: 60, restSeconds: 90 };

  it('accepts a valid body, with optional fields omitted or null', () => {
    expect(addWorkoutExerciseSchema.safeParse(valid).success).toBe(true);
    expect(addWorkoutExerciseSchema.safeParse({ exerciseId: 7, sets: 3, reps: 10 }).success).toBe(
      true,
    );
    expect(
      addWorkoutExerciseSchema.safeParse({ ...valid, weightKg: null, restSeconds: null }).success,
    ).toBe(true);
  });

  it.each([
    ['sets 0', { sets: 0 }],
    ['sets 21', { sets: 21 }],
    ['sets 2.5', { sets: 2.5 }],
    ['reps 0', { reps: 0 }],
    ['reps 101', { reps: 101 }],
    ['negative weight', { weightKg: -1 }],
    ['weight with 3 decimals', { weightKg: 10.123 }],
    ['weight above numeric(6,2)', { weightKg: 10000 }],
    ['negative rest', { restSeconds: -1 }],
    ['rest 601', { restSeconds: 601 }],
    ['exerciseId 0', { exerciseId: 0 }],
    ['exerciseId as string', { exerciseId: '7' }],
  ])('rejects %s', (_label, override) => {
    expect(addWorkoutExerciseSchema.safeParse({ ...valid, ...override }).success).toBe(false);
  });

  it('accepts 2-decimal weights and boundary values', () => {
    expect(addWorkoutExerciseSchema.safeParse({ ...valid, weightKg: 62.5 }).success).toBe(true);
    expect(addWorkoutExerciseSchema.safeParse({ ...valid, weightKg: 0.1 }).success).toBe(true);
    expect(
      addWorkoutExerciseSchema.safeParse({ ...valid, sets: 20, reps: 100, restSeconds: 600 })
        .success,
    ).toBe(true);
  });

  it('reports field errors by field name', () => {
    const result = addWorkoutExerciseSchema.safeParse({ ...valid, sets: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.sets).toEqual(['Must be at least 1']);
    }
  });
});

describe('updateWorkoutExerciseSchema', () => {
  const valid = { sets: 4, reps: 8, weightKg: 65, restSeconds: 120, position: 1 };

  it('accepts a valid body', () => {
    expect(updateWorkoutExerciseSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects position 0 and a missing position', () => {
    expect(updateWorkoutExerciseSchema.safeParse({ ...valid, position: 0 }).success).toBe(false);
    expect(updateWorkoutExerciseSchema.safeParse({ sets: 4, reps: 8 }).success).toBe(false);
  });
});

describe('params and query schemas', () => {
  it('coerces numeric ids from strings', () => {
    expect(idParamsSchema.parse({ id: '12' })).toEqual({ id: 12 });
    expect(workoutExerciseParamsSchema.parse({ id: '1', exerciseId: '2' })).toEqual({
      id: 1,
      exerciseId: 2,
    });
  });

  it.each(['abc', '0', '-3', '1.5', ''])('rejects id %j', (id) => {
    expect(idParamsSchema.safeParse({ id }).success).toBe(false);
  });

  it('accepts a known muscleGroup filter or none, rejects others', () => {
    expect(exerciseListQuerySchema.safeParse({}).success).toBe(true);
    expect(exerciseListQuerySchema.safeParse({ muscleGroup: 'legs' }).success).toBe(true);
    expect(exerciseListQuerySchema.safeParse({ muscleGroup: 'neck' }).success).toBe(false);
  });
});
