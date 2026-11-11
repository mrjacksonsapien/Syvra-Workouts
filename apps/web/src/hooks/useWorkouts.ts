import { getWorkout, listWorkouts } from '../api/workouts';
import { useAsync } from './useAsync';

export const useWorkouts = () => useAsync(() => listWorkouts(), []);

// Workout with its exercises.
export const useWorkout = (id: number) => useAsync(() => getWorkout(id), [id]);
