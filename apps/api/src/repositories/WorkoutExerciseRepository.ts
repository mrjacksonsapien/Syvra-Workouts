import type { Pool } from 'pg';
import type {
  AddWorkoutExerciseInput,
  MuscleGroup,
  UpdateWorkoutExerciseInput,
  WorkoutExercise,
} from '@syvra/shared';

// workout_exercises row joined with its exercise.
interface WorkoutExerciseRow {
  exercise_id: number;
  sets: number;
  reps: number;
  weight_kg: string | null; // numeric → string in pg
  rest_seconds: number | null;
  position: number;
  exercise_name: string;
  exercise_muscle_group: MuscleGroup;
  exercise_equipment: string | null;
}

const SELECT = `SELECT we.exercise_id, we.sets, we.reps, we.weight_kg, we.rest_seconds, we.position,
  e.name AS exercise_name, e.muscle_group AS exercise_muscle_group, e.equipment AS exercise_equipment
  FROM workout_exercises we
  JOIN exercises e ON e.id = we.exercise_id`;

function toWorkoutExercise(row: WorkoutExerciseRow): WorkoutExercise {
  return {
    exerciseId: row.exercise_id,
    sets: row.sets,
    reps: row.reps,
    weightKg: row.weight_kg === null ? null : Number(row.weight_kg),
    restSeconds: row.rest_seconds,
    position: row.position,
    exercise: {
      id: row.exercise_id,
      name: row.exercise_name,
      muscleGroup: row.exercise_muscle_group,
      equipment: row.exercise_equipment,
    },
  };
}

export class WorkoutExerciseRepository {
  constructor(private readonly pool: Pool) {}

  async findByWorkoutId(workoutId: number): Promise<WorkoutExercise[]> {
    const result = await this.pool.query<WorkoutExerciseRow>(
      `${SELECT} WHERE we.workout_id = $1 ORDER BY we.position, we.id`,
      [workoutId],
    );
    return result.rows.map(toWorkoutExercise);
  }

  async find(workoutId: number, exerciseId: number): Promise<WorkoutExercise | null> {
    const result = await this.pool.query<WorkoutExerciseRow>(
      `${SELECT} WHERE we.workout_id = $1 AND we.exercise_id = $2`,
      [workoutId, exerciseId],
    );
    return result.rows[0] ? toWorkoutExercise(result.rows[0]) : null;
  }

  // The new exercise goes last: the position is computed inside the INSERT, so there is no race.
  async add(workoutId: number, input: AddWorkoutExerciseInput): Promise<WorkoutExercise> {
    await this.pool.query(
      `INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight_kg, rest_seconds, position)
       VALUES ($1, $2, $3, $4, $5, $6,
         (SELECT COALESCE(MAX(position), 0) + 1 FROM workout_exercises WHERE workout_id = $1))`,
      [
        workoutId,
        input.exerciseId,
        input.sets,
        input.reps,
        input.weightKg ?? null,
        input.restSeconds ?? null,
      ],
    );
    // Re-read through the JOIN so the result has the same shape as every other read.
    return (await this.find(workoutId, input.exerciseId))!;
  }

  // Returns null when the exercise is not in the workout.
  async update(
    workoutId: number,
    exerciseId: number,
    input: UpdateWorkoutExerciseInput,
  ): Promise<WorkoutExercise | null> {
    const result = await this.pool.query(
      `UPDATE workout_exercises
       SET sets = $3, reps = $4, weight_kg = $5, rest_seconds = $6, position = $7
       WHERE workout_id = $1 AND exercise_id = $2`,
      [
        workoutId,
        exerciseId,
        input.sets,
        input.reps,
        input.weightKg ?? null,
        input.restSeconds ?? null,
        input.position,
      ],
    );
    if ((result.rowCount ?? 0) === 0) return null;
    return this.find(workoutId, exerciseId);
  }

  // True when a row was deleted.
  async remove(workoutId: number, exerciseId: number): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM workout_exercises WHERE workout_id = $1 AND exercise_id = $2',
      [workoutId, exerciseId],
    );
    return (result.rowCount ?? 0) > 0;
  }

  // How many workouts use this exercise (used to refuse deleting it).
  async countByExerciseId(exerciseId: number): Promise<number> {
    const result = await this.pool.query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM workout_exercises WHERE exercise_id = $1',
      [exerciseId],
    );
    return Number(result.rows[0]!.count);
  }
}
