-- Idempotent for local resets
DROP TABLE IF EXISTS workout_exercises, workouts, exercises CASCADE;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE exercises (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          VARCHAR(80)  NOT NULL,
  muscle_group  VARCHAR(20)  NOT NULL,
  description   TEXT,
  equipment     VARCHAR(50),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT exercises_name_unique UNIQUE (name),
  CONSTRAINT exercises_muscle_group_check CHECK (muscle_group IN
    ('chest','back','legs','shoulders','arms','core','full_body'))
);

CREATE TABLE workouts (
  id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name            VARCHAR(80) NOT NULL,
  description     TEXT,
  scheduled_date  DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE workout_exercises (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workout_id    INTEGER  NOT NULL REFERENCES workouts(id)  ON DELETE CASCADE,
  exercise_id   INTEGER  NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  sets          SMALLINT NOT NULL CHECK (sets BETWEEN 1 AND 20),
  reps          SMALLINT NOT NULL CHECK (reps BETWEEN 1 AND 100),
  weight_kg     NUMERIC(6,2)      CHECK (weight_kg >= 0),
  rest_seconds  SMALLINT          CHECK (rest_seconds BETWEEN 0 AND 600),
  position      SMALLINT NOT NULL CHECK (position >= 1),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workout_exercises_pair_unique UNIQUE (workout_id, exercise_id)
);

-- The unique pair index already covers lookups by workout_id; add one for exercise_id
CREATE INDEX workout_exercises_exercise_id_idx ON workout_exercises (exercise_id);
CREATE INDEX exercises_muscle_group_idx ON exercises (muscle_group);

CREATE TRIGGER exercises_set_updated_at BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER workouts_set_updated_at BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER workout_exercises_set_updated_at BEFORE UPDATE ON workout_exercises
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
