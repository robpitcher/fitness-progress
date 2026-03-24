-- Migration: Seed global exercise library
-- Inserts ~30 common exercises with user_id = NULL (global/shared).
-- Idempotent: skips any exercise that already exists for user_id IS NULL.

INSERT INTO exercises (name, category, user_id)
SELECT name, category, NULL
FROM (VALUES
  -- Chest
  ('Bench Press',         'Chest'),
  ('Incline Bench Press', 'Chest'),
  ('Dumbbell Flyes',      'Chest'),
  ('Push-Up',             'Chest'),
  ('Cable Crossover',     'Chest'),

  -- Back
  ('Barbell Row',         'Back'),
  ('Dumbbell Row',        'Back'),
  ('Pull-Up',             'Back'),
  ('Lat Pulldown',        'Back'),
  ('Seated Cable Row',    'Back'),
  ('Deadlift',            'Back'),

  -- Shoulders
  ('Overhead Press',      'Shoulders'),
  ('Lateral Raise',       'Shoulders'),
  ('Front Raise',         'Shoulders'),
  ('Face Pull',           'Shoulders'),
  ('Rear Delt Fly',       'Shoulders'),

  -- Legs
  ('Squat',               'Legs'),
  ('Leg Press',           'Legs'),
  ('Romanian Deadlift',   'Legs'),
  ('Leg Extension',       'Legs'),
  ('Leg Curl',            'Legs'),
  ('Calf Raise',          'Legs'),
  ('Lunge',               'Legs'),

  -- Arms
  ('Bicep Curl',          'Arms'),
  ('Hammer Curl',         'Arms'),
  ('Tricep Pushdown',     'Arms'),
  ('Tricep Dip',          'Arms'),
  ('Skull Crusher',       'Arms'),

  -- Core
  ('Plank',               'Core'),
  ('Hanging Leg Raise',   'Core'),
  ('Cable Crunch',        'Core')
) AS v(name, category)
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e
  WHERE e.name = v.name AND e.user_id IS NULL
);
