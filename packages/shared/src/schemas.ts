import { z } from 'zod';
import { MUSCLE_GROUPS } from './constants.js';

// Optional text: may be left out or sent as null to clear it.
const optionalText = (max: number) =>
  z.string().trim().max(max, `Must be at most ${max} characters`).nullable().optional();

const requiredName = z
  .string()
  .trim()
  .min(2, 'Must be at least 2 characters')
  .max(80, 'Must be at most 80 characters');

// "YYYY-MM-DD" that is also a real calendar day (rejects 2026-02-30).
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Not a valid date');

const sets = z.number().int('Must be a whole number').min(1, 'Must be at least 1').max(20);
const reps = z.number().int('Must be a whole number').min(1, 'Must be at least 1').max(100);
// numeric(6,2) in the database: up to 9999.99, two decimals.
const weightKg = z
  .number()
  .min(0, 'Must be 0 or more')
  .max(9999.99, 'Must be at most 9999.99')
  .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6, 'Max 2 decimals')
  .nullable()
  .optional();
const restSeconds = z
  .number()
  .int('Must be a whole number')
  .min(0, 'Must be 0 or more')
  .max(600, 'Must be at most 600')
  .nullable()
  .optional();

// URL params and query strings arrive as strings, so ids are coerced to numbers.
const id = z.coerce.number().int().positive();

export const idParamsSchema = z.object({ id });
export const workoutExerciseParamsSchema = z.object({ id, exerciseId: id });

export const exerciseListQuerySchema = z.object({
  muscleGroup: z.enum(MUSCLE_GROUPS).optional(),
});

export const exerciseInputSchema = z.object({
  name: requiredName,
  muscleGroup: z.enum(MUSCLE_GROUPS),
  description: optionalText(500),
  equipment: optionalText(50),
});

export const workoutInputSchema = z.object({
  name: requiredName,
  description: optionalText(500),
  scheduledDate: isoDate.nullable().optional(),
});

export const addWorkoutExerciseSchema = z.object({
  exerciseId: z.number().int().positive(),
  sets,
  reps,
  weightKg,
  restSeconds,
});

export const updateWorkoutExerciseSchema = z.object({
  sets,
  reps,
  weightKg,
  restSeconds,
  position: z.number().int('Must be a whole number').min(1, 'Must be at least 1'),
});

export type ExerciseInput = z.infer<typeof exerciseInputSchema>;
export type WorkoutInput = z.infer<typeof workoutInputSchema>;
export type AddWorkoutExerciseInput = z.infer<typeof addWorkoutExerciseSchema>;
export type UpdateWorkoutExerciseInput = z.infer<typeof updateWorkoutExerciseSchema>;
