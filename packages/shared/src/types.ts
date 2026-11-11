import type { MuscleGroup } from './constants.js';

// Response shapes of the API (see docs/03-api.md). Dates are strings in JSON.

export interface Exercise {
  id: number;
  name: string;
  muscleGroup: MuscleGroup;
  description: string | null;
  equipment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Workout {
  id: number;
  name: string;
  description: string | null;
  scheduledDate: string | null; // "YYYY-MM-DD"
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSummary extends Workout {
  exerciseCount: number;
}

export interface WorkoutExercise {
  exerciseId: number;
  sets: number;
  reps: number;
  weightKg: number | null;
  restSeconds: number | null;
  position: number;
  exercise: Pick<Exercise, 'id' | 'name' | 'muscleGroup' | 'equipment'>;
}

export interface WorkoutDetails extends Workout {
  exercises: WorkoutExercise[];
}

// GET /api/exercises/:id/workouts
export interface ExerciseUsage extends Workout {
  sets: number;
  reps: number;
  weightKg: number | null;
  restSeconds: number | null;
}

// Error body shared by every failed response.
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: { fieldErrors?: Record<string, string[]>; [key: string]: unknown };
  };
}
