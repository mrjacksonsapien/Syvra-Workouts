import type { Exercise, ExerciseInput, ExerciseUsage, MuscleGroup } from '@syvra/shared';
import { request } from './client';

export const listExercises = (muscleGroup?: MuscleGroup) =>
  request<Exercise[]>('/exercises', { query: { muscleGroup } });

export const getExercise = (id: number) => request<Exercise>(`/exercises/${id}`);

export const listExerciseWorkouts = (id: number) =>
  request<ExerciseUsage[]>(`/exercises/${id}/workouts`);

export const createExercise = (input: ExerciseInput) =>
  request<Exercise>('/exercises', { method: 'POST', body: input });

export const updateExercise = (id: number, input: ExerciseInput) =>
  request<Exercise>(`/exercises/${id}`, { method: 'PUT', body: input });

export const deleteExercise = (id: number) =>
  request<void>(`/exercises/${id}`, { method: 'DELETE' });
