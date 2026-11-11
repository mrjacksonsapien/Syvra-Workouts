import type {
  AddWorkoutExerciseInput,
  UpdateWorkoutExerciseInput,
  Workout,
  WorkoutDetails,
  WorkoutExercise,
  WorkoutInput,
  WorkoutSummary,
} from '@syvra/shared';
import { request } from './client';

export const listWorkouts = () => request<WorkoutSummary[]>('/workouts');

export const getWorkout = (id: number) => request<WorkoutDetails>(`/workouts/${id}`);

export const createWorkout = (input: WorkoutInput) =>
  request<Workout>('/workouts', { method: 'POST', body: input });

export const updateWorkout = (id: number, input: WorkoutInput) =>
  request<Workout>(`/workouts/${id}`, { method: 'PUT', body: input });

export const deleteWorkout = (id: number) => request<void>(`/workouts/${id}`, { method: 'DELETE' });

export const addExerciseToWorkout = (workoutId: number, input: AddWorkoutExerciseInput) =>
  request<WorkoutExercise>(`/workouts/${workoutId}/exercises`, { method: 'POST', body: input });

export const updateWorkoutExercise = (
  workoutId: number,
  exerciseId: number,
  input: UpdateWorkoutExerciseInput,
) =>
  request<WorkoutExercise>(`/workouts/${workoutId}/exercises/${exerciseId}`, {
    method: 'PUT',
    body: input,
  });

export const removeExerciseFromWorkout = (workoutId: number, exerciseId: number) =>
  request<void>(`/workouts/${workoutId}/exercises/${exerciseId}`, { method: 'DELETE' });
