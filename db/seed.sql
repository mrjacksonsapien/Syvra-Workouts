-- Fictional demo data. Runs after schema.sql.
-- Scheduled dates are relative to today: "next Monday" is the Monday of next ISO week,
-- so the data never looks stale.

-- 1. Exercises (15)
INSERT INTO exercises (name, muscle_group, equipment) VALUES
  ('Bench Press',        'chest',     'Barbell'),
  ('Push-Up',            'chest',     'Bodyweight'),
  ('Pull-Up',            'back',      'Pull-up bar'),
  ('Barbell Row',        'back',      'Barbell'),
  ('Lat Pulldown',       'back',      'Cable machine'),
  ('Back Squat',         'legs',      'Barbell'),
  ('Romanian Deadlift',  'legs',      'Barbell'),
  ('Walking Lunge',      'legs',      'Dumbbells'),
  ('Overhead Press',     'shoulders', 'Barbell'),
  ('Lateral Raise',      'shoulders', 'Dumbbells'),
  ('Biceps Curl',        'arms',      'Dumbbells'),
  ('Triceps Dip',        'arms',      'Parallel bars'),
  ('Hanging Leg Raise',  'core',      'Pull-up bar'),
  ('Cable Crunch',       'core',      'Cable machine'),
  ('Kettlebell Swing',   'full_body', 'Kettlebell');

-- 2. Workouts (5)
INSERT INTO workouts (name, scheduled_date) VALUES
  ('Push Day',            date_trunc('week', CURRENT_DATE)::date + 7),   -- next Monday
  ('Pull Day',            date_trunc('week', CURRENT_DATE)::date + 8),   -- next Tuesday
  ('Leg Day',             date_trunc('week', CURRENT_DATE)::date + 10),  -- next Thursday
  ('Full Body Express',   NULL),
  ('Core & Shoulders',    NULL);

-- 3. Workout exercises (links). Exercises are looked up by name, not by id.
-- position = order inside the workout (1, 2, 3, ...)
INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight_kg, rest_seconds, position) VALUES
  -- Push Day
  ((SELECT id FROM workouts WHERE name = 'Push Day'), (SELECT id FROM exercises WHERE name = 'Bench Press'),     4,  8, 60,   120, 1),
  ((SELECT id FROM workouts WHERE name = 'Push Day'), (SELECT id FROM exercises WHERE name = 'Overhead Press'),  3, 10, 35,    90, 2),
  ((SELECT id FROM workouts WHERE name = 'Push Day'), (SELECT id FROM exercises WHERE name = 'Push-Up'),         3, 15, NULL,  60, 3),
  ((SELECT id FROM workouts WHERE name = 'Push Day'), (SELECT id FROM exercises WHERE name = 'Triceps Dip'),     3, 10, NULL,  60, 4),
  -- Pull Day
  ((SELECT id FROM workouts WHERE name = 'Pull Day'), (SELECT id FROM exercises WHERE name = 'Pull-Up'),          4,  6, NULL, 120, 1),
  ((SELECT id FROM workouts WHERE name = 'Pull Day'), (SELECT id FROM exercises WHERE name = 'Barbell Row'),      4,  8, 50,   90, 2),
  ((SELECT id FROM workouts WHERE name = 'Pull Day'), (SELECT id FROM exercises WHERE name = 'Lat Pulldown'),     3, 12, 45,   60, 3),
  ((SELECT id FROM workouts WHERE name = 'Pull Day'), (SELECT id FROM exercises WHERE name = 'Biceps Curl'),      3, 12, 12,   60, 4),
  -- Leg Day
  ((SELECT id FROM workouts WHERE name = 'Leg Day'),  (SELECT id FROM exercises WHERE name = 'Back Squat'),        5,  5, 80,  180, 1),
  ((SELECT id FROM workouts WHERE name = 'Leg Day'),  (SELECT id FROM exercises WHERE name = 'Romanian Deadlift'), 3, 10, 60,  120, 2),
  ((SELECT id FROM workouts WHERE name = 'Leg Day'),  (SELECT id FROM exercises WHERE name = 'Walking Lunge'),    3, 12, 14,   90, 3),
  -- Full Body Express
  ((SELECT id FROM workouts WHERE name = 'Full Body Express'), (SELECT id FROM exercises WHERE name = 'Kettlebell Swing'), 4, 15, 16, 60, 1),
  ((SELECT id FROM workouts WHERE name = 'Full Body Express'), (SELECT id FROM exercises WHERE name = 'Back Squat'),      3,  8, 60, 90, 2),
  ((SELECT id FROM workouts WHERE name = 'Full Body Express'), (SELECT id FROM exercises WHERE name = 'Push-Up'),         3, 12, NULL, 45, 3),
  ((SELECT id FROM workouts WHERE name = 'Full Body Express'), (SELECT id FROM exercises WHERE name = 'Pull-Up'),         3,  5, NULL, 90, 4),
  -- Core & Shoulders
  ((SELECT id FROM workouts WHERE name = 'Core & Shoulders'), (SELECT id FROM exercises WHERE name = 'Hanging Leg Raise'), 3, 12, NULL, 60, 1),
  ((SELECT id FROM workouts WHERE name = 'Core & Shoulders'), (SELECT id FROM exercises WHERE name = 'Cable Crunch'),     3, 15, 30,   45, 2),
  ((SELECT id FROM workouts WHERE name = 'Core & Shoulders'), (SELECT id FROM exercises WHERE name = 'Lateral Raise'),    3, 15,  8,   45, 3),
  ((SELECT id FROM workouts WHERE name = 'Core & Shoulders'), (SELECT id FROM exercises WHERE name = 'Overhead Press'),   3,  8, 30,   90, 4);
