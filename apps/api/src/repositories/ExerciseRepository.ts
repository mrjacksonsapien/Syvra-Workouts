import type { Pool } from 'pg';
import type { Exercise, ExerciseInput, MuscleGroup } from '@syvra/shared';

// A row as it comes out of PostgreSQL (snake_case, timestamps are Date objects).
interface ExerciseRow {
  id: number;
  name: string;
  muscle_group: MuscleGroup;
  description: string | null;
  equipment: string | null;
  created_at: Date;
  updated_at: Date;
}

const COLUMNS = 'id, name, muscle_group, description, equipment, created_at, updated_at';

function toExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group,
    description: row.description,
    equipment: row.equipment,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export class ExerciseRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(filter: { muscleGroup?: MuscleGroup } = {}): Promise<Exercise[]> {
    const result = filter.muscleGroup
      ? await this.pool.query<ExerciseRow>(
          `SELECT ${COLUMNS} FROM exercises WHERE muscle_group = $1 ORDER BY name`,
          [filter.muscleGroup],
        )
      : await this.pool.query<ExerciseRow>(`SELECT ${COLUMNS} FROM exercises ORDER BY name`);
    return result.rows.map(toExercise);
  }

  async findById(id: number): Promise<Exercise | null> {
    const result = await this.pool.query<ExerciseRow>(
      `SELECT ${COLUMNS} FROM exercises WHERE id = $1`,
      [id],
    );
    return result.rows[0] ? toExercise(result.rows[0]) : null;
  }

  async findByName(name: string): Promise<Exercise | null> {
    const result = await this.pool.query<ExerciseRow>(
      `SELECT ${COLUMNS} FROM exercises WHERE name = $1`,
      [name],
    );
    return result.rows[0] ? toExercise(result.rows[0]) : null;
  }

  async create(input: ExerciseInput): Promise<Exercise> {
    const result = await this.pool.query<ExerciseRow>(
      `INSERT INTO exercises (name, muscle_group, description, equipment)
       VALUES ($1, $2, $3, $4)
       RETURNING ${COLUMNS}`,
      [input.name, input.muscleGroup, input.description ?? null, input.equipment ?? null],
    );
    return toExercise(result.rows[0]!);
  }

  // Returns null when no exercise has this id.
  async update(id: number, input: ExerciseInput): Promise<Exercise | null> {
    const result = await this.pool.query<ExerciseRow>(
      `UPDATE exercises
       SET name = $2, muscle_group = $3, description = $4, equipment = $5
       WHERE id = $1
       RETURNING ${COLUMNS}`,
      [id, input.name, input.muscleGroup, input.description ?? null, input.equipment ?? null],
    );
    return result.rows[0] ? toExercise(result.rows[0]) : null;
  }

  // True when a row was deleted, false when the id did not exist.
  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM exercises WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
