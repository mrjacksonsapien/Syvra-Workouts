import type { Pool } from 'pg';
import type { ExerciseUsage, Workout, WorkoutInput, WorkoutSummary } from '@syvra/shared';

interface WorkoutRow {
  id: number;
  name: string;
  description: string | null;
  scheduled_date: string | null; // formatted by to_char in SQL, so no timezone surprises
  created_at: Date;
  updated_at: Date;
}

// A DATE column would become a JS Date (local timezone shifts); we want "YYYY-MM-DD" as-is.
// The `w.` prefix lets the same list be used in queries that join other tables.
const COLUMNS = `w.id, w.name, w.description,
  to_char(w.scheduled_date, 'YYYY-MM-DD') AS scheduled_date,
  w.created_at, w.updated_at`;

// Not null first, earliest date first, then by name.
const ORDER = 'ORDER BY w.scheduled_date ASC NULLS LAST, w.name';

function toWorkout(row: WorkoutRow): Workout {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    scheduledDate: row.scheduled_date,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export class WorkoutRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(): Promise<WorkoutSummary[]> {
    const result = await this.pool.query<WorkoutRow & { exercise_count: string }>(
      `SELECT ${COLUMNS}, COUNT(we.id) AS exercise_count
       FROM workouts w
       LEFT JOIN workout_exercises we ON we.workout_id = w.id
       GROUP BY w.id
       ${ORDER}`,
    );
    // COUNT returns a bigint, which pg gives back as a string.
    return result.rows.map((row) => ({ ...toWorkout(row), exerciseCount: Number(row.exercise_count) }));
  }

  async findById(id: number): Promise<Workout | null> {
    const result = await this.pool.query<WorkoutRow>(
      `SELECT ${COLUMNS} FROM workouts w WHERE w.id = $1`,
      [id],
    );
    return result.rows[0] ? toWorkout(result.rows[0]) : null;
  }

  // Workouts that contain the exercise, with its sets/reps/weight/rest in each.
  async findByExerciseId(exerciseId: number): Promise<ExerciseUsage[]> {
    const result = await this.pool.query<
      WorkoutRow & {
        sets: number;
        reps: number;
        weight_kg: string | null;
        rest_seconds: number | null;
      }
    >(
      `SELECT ${COLUMNS}, we.sets, we.reps, we.weight_kg, we.rest_seconds
       FROM workouts w
       JOIN workout_exercises we ON we.workout_id = w.id
       WHERE we.exercise_id = $1
       ${ORDER}`,
      [exerciseId],
    );
    return result.rows.map((row) => ({
      ...toWorkout(row),
      sets: row.sets,
      reps: row.reps,
      // numeric comes back from pg as a string
      weightKg: row.weight_kg === null ? null : Number(row.weight_kg),
      restSeconds: row.rest_seconds,
    }));
  }

  async create(input: WorkoutInput): Promise<Workout> {
    const result = await this.pool.query<WorkoutRow>(
      `INSERT INTO workouts AS w (name, description, scheduled_date)
       VALUES ($1, $2, $3)
       RETURNING ${COLUMNS}`,
      [input.name, input.description ?? null, input.scheduledDate ?? null],
    );
    return toWorkout(result.rows[0]!);
  }

  // Returns null when no workout has this id.
  async update(id: number, input: WorkoutInput): Promise<Workout | null> {
    const result = await this.pool.query<WorkoutRow>(
      `UPDATE workouts AS w
       SET name = $2, description = $3, scheduled_date = $4
       WHERE w.id = $1
       RETURNING ${COLUMNS}`,
      [id, input.name, input.description ?? null, input.scheduledDate ?? null],
    );
    return result.rows[0] ? toWorkout(result.rows[0]) : null;
  }

  // True when a row was deleted. The database cascades to workout_exercises.
  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM workouts WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
