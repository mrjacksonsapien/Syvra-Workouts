import type { Exercise, ExerciseInput, ExerciseUsage, MuscleGroup } from '@syvra/shared';
import { ConflictError, NotFoundError } from '../errors/index.js';
import type { ExerciseRepository } from '../repositories/ExerciseRepository.js';
import type { WorkoutExerciseRepository } from '../repositories/WorkoutExerciseRepository.js';
import type { WorkoutRepository } from '../repositories/WorkoutRepository.js';

export class ExerciseService {
  constructor(
    private readonly exercises: ExerciseRepository,
    private readonly workoutExercises: WorkoutExerciseRepository,
    private readonly workouts: WorkoutRepository,
  ) {}

  list(muscleGroup?: MuscleGroup): Promise<Exercise[]> {
    return this.exercises.findAll({ muscleGroup });
  }

  async get(id: number): Promise<Exercise> {
    const exercise = await this.exercises.findById(id);
    if (!exercise) throw new NotFoundError('Exercise not found');
    return exercise;
  }

  async listWorkouts(id: number): Promise<ExerciseUsage[]> {
    await this.get(id); // 404 if the exercise doesn't exist
    return this.workouts.findByExerciseId(id);
  }

  async create(input: ExerciseInput): Promise<Exercise> {
    await this.assertNameFree(input.name);
    return this.exercises.create(input);
  }

  async update(id: number, input: ExerciseInput): Promise<Exercise> {
    await this.get(id);
    await this.assertNameFree(input.name, id);
    const updated = await this.exercises.update(id, input);
    if (!updated) throw new NotFoundError('Exercise not found');
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.get(id);
    const workoutCount = await this.workoutExercises.countByExerciseId(id);
    if (workoutCount > 0) {
      throw new ConflictError(
        'EXERCISE_IN_USE',
        `This exercise is used in ${workoutCount} workout${workoutCount === 1 ? '' : 's'}. Remove it from those workouts first.`,
        { workoutCount },
      );
    }
    await this.exercises.delete(id);
  }

  // `ownId` lets an exercise keep its own name when it is updated.
  private async assertNameFree(name: string, ownId?: number): Promise<void> {
    const existing = await this.exercises.findByName(name);
    if (existing && existing.id !== ownId) {
      throw new ConflictError('EXERCISE_NAME_TAKEN', 'An exercise with this name already exists.');
    }
  }
}
