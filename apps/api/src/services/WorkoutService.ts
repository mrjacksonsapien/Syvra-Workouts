import type { Workout, WorkoutDetails, WorkoutInput, WorkoutSummary } from '@syvra/shared';
import { NotFoundError } from '../errors/index.js';
import type { WorkoutExerciseRepository } from '../repositories/WorkoutExerciseRepository.js';
import type { WorkoutRepository } from '../repositories/WorkoutRepository.js';

export class WorkoutService {
  constructor(
    private readonly workouts: WorkoutRepository,
    private readonly workoutExercises: WorkoutExerciseRepository,
  ) {}

  list(): Promise<WorkoutSummary[]> {
    return this.workouts.findAll();
  }

  async get(id: number): Promise<WorkoutDetails> {
    const workout = await this.workouts.findById(id);
    if (!workout) throw new NotFoundError('Workout not found');
    const exercises = await this.workoutExercises.findByWorkoutId(id);
    return { ...workout, exercises };
  }

  create(input: WorkoutInput): Promise<Workout> {
    return this.workouts.create(input);
  }

  async update(id: number, input: WorkoutInput): Promise<Workout> {
    const updated = await this.workouts.update(id, input);
    if (!updated) throw new NotFoundError('Workout not found');
    return updated;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.workouts.delete(id);
    if (!deleted) throw new NotFoundError('Workout not found');
  }
}
