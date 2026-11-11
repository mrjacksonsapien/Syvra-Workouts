// Must match the CHECK constraint on exercises.muscle_group in db/schema.sql.
export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'arms',
  'core',
  'full_body',
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];
