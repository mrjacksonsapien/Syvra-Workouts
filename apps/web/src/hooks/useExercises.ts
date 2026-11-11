import type { MuscleGroup } from '@syvra/shared';
import { getExercise, listExercises, listExerciseWorkouts } from '../api/exercises';
import { useAsync } from './useAsync';

// Exercises list, optionally filtered by muscle group.
export const useExercises = (muscleGroup?: MuscleGroup) =>
  useAsync(() => listExercises(muscleGroup), [muscleGroup]);

export const useExercise = (id: number) => useAsync(() => getExercise(id), [id]);

// Workouts that contain the exercise.
export const useExerciseWorkouts = (id: number) => useAsync(() => listExerciseWorkouts(id), [id]);
