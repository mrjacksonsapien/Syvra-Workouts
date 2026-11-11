import type {
  AddWorkoutExerciseInput,
  UpdateWorkoutExerciseInput,
  WorkoutExercise,
} from '@syvra/shared';
import { ConflictError, NotFoundError } from '../errors/index.js';
import type { ExerciseRepository } from '../repositories/ExerciseRepository.js';
import type { WorkoutExerciseRepository } from '../repositories/WorkoutExerciseRepository.js';
import type { WorkoutRepository } from '../repositories/WorkoutRepository.js';

export class WorkoutExerciseService {
  constructor(
    private readonly workouts: WorkoutRepository,
    private readonly exercises: ExerciseRepository,
    private readonly workoutExercises: WorkoutExerciseRepository,
  ) {}

  async add(workoutId: number, input: AddWorkoutExerciseInput): Promise<WorkoutExercise> {
    if (!(await this.workouts.findById(workoutId))) throw new NotFoundError('Workout not found');
    if (!(await this.exercises.findById(input.exerciseId))) throw new NotFoundError('Exercise not found');
    if (await this.workoutExercises.find(workoutId, input.exerciseId)) {
      throw new ConflictError(
        'EXERCISE_ALREADY_IN_WORKOUT',
        'This exercise is already in the workout.',
      );
    }
    return this.workoutExercises.add(workoutId, input);
  }

  async update(
    workoutId: number,
    exerciseId: number,
    input: UpdateWorkoutExerciseInput,
  ): Promise<WorkoutExercise> {
    const updated = await this.workoutExercises.update(workoutId, exerciseId, input);
    if (!updated) throw new NotFoundError('This exercise is not in the workout');
    return updated;
  }

  async remove(workoutId: number, exerciseId: number): Promise<void> {
    const removed = await this.workoutExercises.remove(workoutId, exerciseId);
    if (!removed) throw new NotFoundError('This exercise is not in the workout');
  }
}
