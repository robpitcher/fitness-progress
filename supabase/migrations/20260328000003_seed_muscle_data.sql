-- Migration: Seed muscle targeting data for all 30 default exercises
-- Adds primary/secondary muscle data and training notes
-- Idempotent: skips if muscle data already exists for each exercise

-- Update training notes for all exercises
UPDATE exercises SET training_notes = 'Primary mass builder for pec thickness. Elbows at ~45° maximizes chest over shoulder involvement.' WHERE name = 'Bench Press' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Targets upper chest, creating the "shelf" look. 30°–45° incline ideal; steeper shifts to delts.' WHERE name = 'Incline Bench Press' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Isolation move for pec width. Maximal stretch at bottom. Minimal tricep involvement.' WHERE name = 'Dumbbell Flyes' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Similar activation to bench press. Wide hands = width focus, close hands = thickness/tricep focus.' WHERE name = 'Push-Up' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Best for pec shape and separation. High-to-low = lower/outer pec. Low-to-high = upper/inner pec. Constant tension throughout arc.' WHERE name = 'Cable Crossover' AND user_id IS NULL;

UPDATE exercises SET training_notes = 'Builds back thickness — dense, 3D mid-back appearance.' WHERE name = 'Barbell Row' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Primarily thickness; unilateral nature allows greater lat stretch and contraction.' WHERE name = 'Dumbbell Row' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'The king of back width — builds the V-taper by flaring the lats.' WHERE name = 'Pull-Up' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Builds lat width, enhancing the V-shape. Good substitute for pull-ups at higher rep ranges.' WHERE name = 'Lat Pulldown' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Primarily for back thickness — packs density into the mid-back.' WHERE name = 'Seated Cable Row' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Builds overall back thickness and mass — especially erectors and traps. Not a direct width builder but supports total posterior chain size.' WHERE name = 'Deadlift' AND user_id IS NULL;

UPDATE exercises SET training_notes = 'Primary compound shoulder builder. Standing version engages core more. Primarily hits front and side delts.' WHERE name = 'Overhead Press' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'The key exercise for capped shoulders and shoulder width. Minimize trap engagement to keep tension on side delts.' WHERE name = 'Lateral Raise' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Isolates front delts. Note: front delts get heavy work from all pressing movements — don''t overtrain.' WHERE name = 'Front Raise' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Essential for rear delt and shoulder health. Balances pressing work and prevents shoulder imbalances.' WHERE name = 'Face Pull' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Best isolation for rear delts — crucial for round, 3D shoulders and posture.' WHERE name = 'Rear Delt Fly' AND user_id IS NULL;

UPDATE exercises SET training_notes = 'King of leg exercises for overall mass. Narrower stance with toes out emphasizes vastus lateralis for outer quad sweep.' WHERE name = 'Squat' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Feet low/close = outer quads (quad sweep). Feet high/wide = glutes and hamstrings.' WHERE name = 'Leg Press' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Key exercise for hamstring development — stretches and loads hamstrings through full ROM.' WHERE name = 'Romanian Deadlift' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Pure quad isolation. Turn toes slightly out to target vastus lateralis for outer quad sweep. Slow negatives enhance hypertrophy.' WHERE name = 'Leg Extension' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Directly targets hamstrings via knee flexion. Vary foot angle to hit different hamstring heads. Complements RDLs.' WHERE name = 'Leg Curl' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Straight-leg = gastrocnemius (upper calf). Bent-knee (seated) = soleus (lower calf). High volume and frequency needed for stubborn calves.' WHERE name = 'Calf Raise' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Long stride = glutes and hamstrings. Short stride = quads. Bulgarian split squat variation for advanced stimulus.' WHERE name = 'Lunge' AND user_id IS NULL;

UPDATE exercises SET training_notes = 'Long head (elbows back) = bicep peak. Short head (elbows forward, e.g. preacher) = inner thickness. Standard supinated grip emphasizes peak.' WHERE name = 'Bicep Curl' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Builds arm thickness — the brachialis pushes the bicep up from underneath. Also builds forearm width.' WHERE name = 'Hammer Curl' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Straight bar = lateral head ("horseshoe" shape). Rope attachment allows greater contraction for long/lateral head involvement.' WHERE name = 'Tricep Pushdown' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Mass builder for overall tricep size. Upright torso = more triceps. Leaning forward = more chest involvement.' WHERE name = 'Tricep Dip' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Best for long head development — the long head crosses both shoulder and elbow joints. Adds fullness to the back of the upper arm.' WHERE name = 'Skull Crusher' AND user_id IS NULL;

UPDATE exercises SET training_notes = 'Isometric hold — evenly recruits all ab sections without upper/lower bias. Heavily targets deep stabilizing muscles.' WHERE name = 'Plank' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Best exercise for lower abs. Curl pelvis up (don''t just lift legs) to maximize ab activation over hip flexors.' WHERE name = 'Hanging Leg Raise' AND user_id IS NULL;
UPDATE exercises SET training_notes = 'Best for upper ab thickness. Curl ribcage toward pelvis. Bringing elbows to knees increases lower ab involvement.' WHERE name = 'Cable Crunch' AND user_id IS NULL;

-- Insert muscle data for all exercises
-- Using a helper function to get exercise id by name
DO $$
DECLARE
  ex_id uuid;
BEGIN
  -- CHEST EXERCISES

  -- Bench Press
  SELECT id INTO ex_id FROM exercises WHERE name = 'Bench Press' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Pectoralis Major (sternal/middle)', 'primary'),
      (ex_id, 'Anterior Deltoids', 'secondary'),
      (ex_id, 'Triceps', 'secondary'),
      (ex_id, 'Serratus Anterior', 'secondary');
  END IF;

  -- Incline Bench Press
  SELECT id INTO ex_id FROM exercises WHERE name = 'Incline Bench Press' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Pectoralis Major (clavicular/upper)', 'primary'),
      (ex_id, 'Anterior Deltoids', 'secondary'),
      (ex_id, 'Triceps', 'secondary'),
      (ex_id, 'Serratus Anterior', 'secondary');
  END IF;

  -- Dumbbell Flyes
  SELECT id INTO ex_id FROM exercises WHERE name = 'Dumbbell Flyes' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Pectoralis Major (full sweep, sternal fibers)', 'primary'),
      (ex_id, 'Anterior Deltoids', 'secondary'),
      (ex_id, 'Biceps (stabilizer)', 'secondary');
  END IF;

  -- Push-Up
  SELECT id INTO ex_id FROM exercises WHERE name = 'Push-Up' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Pectoralis Major (sternal + clavicular)', 'primary'),
      (ex_id, 'Anterior Deltoids', 'secondary'),
      (ex_id, 'Triceps', 'secondary'),
      (ex_id, 'Serratus Anterior', 'secondary'),
      (ex_id, 'Core', 'secondary');
  END IF;

  -- Cable Crossover
  SELECT id INTO ex_id FROM exercises WHERE name = 'Cable Crossover' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Pectoralis Major (adjustable angle)', 'primary'),
      (ex_id, 'Anterior Deltoids', 'secondary'),
      (ex_id, 'Biceps (stabilizer)', 'secondary');
  END IF;

  -- BACK EXERCISES

  -- Barbell Row
  SELECT id INTO ex_id FROM exercises WHERE name = 'Barbell Row' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Latissimus Dorsi', 'primary'),
      (ex_id, 'Rhomboids', 'primary'),
      (ex_id, 'Mid/Lower Trapezius', 'primary'),
      (ex_id, 'Posterior Deltoids', 'secondary'),
      (ex_id, 'Biceps', 'secondary'),
      (ex_id, 'Forearms', 'secondary'),
      (ex_id, 'Erector Spinae', 'secondary');
  END IF;

  -- Dumbbell Row
  SELECT id INTO ex_id FROM exercises WHERE name = 'Dumbbell Row' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Latissimus Dorsi', 'primary'),
      (ex_id, 'Rhomboids', 'primary'),
      (ex_id, 'Mid/Lower Trapezius', 'secondary'),
      (ex_id, 'Posterior Deltoids', 'secondary'),
      (ex_id, 'Biceps', 'secondary'),
      (ex_id, 'Forearms', 'secondary');
  END IF;

  -- Pull-Up
  SELECT id INTO ex_id FROM exercises WHERE name = 'Pull-Up' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Latissimus Dorsi', 'primary'),
      (ex_id, 'Biceps', 'secondary'),
      (ex_id, 'Teres Major', 'secondary'),
      (ex_id, 'Lower Trapezius', 'secondary'),
      (ex_id, 'Rhomboids', 'secondary'),
      (ex_id, 'Brachialis', 'secondary');
  END IF;

  -- Lat Pulldown
  SELECT id INTO ex_id FROM exercises WHERE name = 'Lat Pulldown' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Latissimus Dorsi', 'primary'),
      (ex_id, 'Teres Major', 'secondary'),
      (ex_id, 'Rhomboids', 'secondary'),
      (ex_id, 'Mid/Lower Trapezius', 'secondary'),
      (ex_id, 'Biceps', 'secondary'),
      (ex_id, 'Rear Deltoids', 'secondary');
  END IF;

  -- Seated Cable Row
  SELECT id INTO ex_id FROM exercises WHERE name = 'Seated Cable Row' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Rhomboids', 'primary'),
      (ex_id, 'Mid/Lower Trapezius', 'primary'),
      (ex_id, 'Latissimus Dorsi', 'primary'),
      (ex_id, 'Posterior Deltoids', 'secondary'),
      (ex_id, 'Biceps', 'secondary'),
      (ex_id, 'Forearms', 'secondary'),
      (ex_id, 'Erector Spinae', 'secondary');
  END IF;

  -- Deadlift
  SELECT id INTO ex_id FROM exercises WHERE name = 'Deadlift' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Erector Spinae', 'primary'),
      (ex_id, 'Glutes', 'primary'),
      (ex_id, 'Hamstrings', 'primary'),
      (ex_id, 'Trapezius', 'primary'),
      (ex_id, 'Latissimus Dorsi (stabilizer)', 'primary'),
      (ex_id, 'Forearms', 'secondary'),
      (ex_id, 'Core', 'secondary'),
      (ex_id, 'Rhomboids', 'secondary'),
      (ex_id, 'Rear Deltoids', 'secondary');
  END IF;

  -- SHOULDER EXERCISES

  -- Overhead Press
  SELECT id INTO ex_id FROM exercises WHERE name = 'Overhead Press' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Anterior Deltoid', 'primary'),
      (ex_id, 'Lateral Deltoid', 'primary'),
      (ex_id, 'Triceps', 'primary'),
      (ex_id, 'Upper Chest', 'secondary'),
      (ex_id, 'Upper Trapezius', 'secondary'),
      (ex_id, 'Serratus Anterior', 'secondary'),
      (ex_id, 'Core', 'secondary');
  END IF;

  -- Lateral Raise
  SELECT id INTO ex_id FROM exercises WHERE name = 'Lateral Raise' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Lateral (Side) Deltoid', 'primary'),
      (ex_id, 'Supraspinatus', 'secondary'),
      (ex_id, 'Upper Trapezius', 'secondary');
  END IF;

  -- Front Raise
  SELECT id INTO ex_id FROM exercises WHERE name = 'Front Raise' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Anterior (Front) Deltoid', 'primary'),
      (ex_id, 'Upper Chest', 'secondary'),
      (ex_id, 'Lateral Deltoid', 'secondary');
  END IF;

  -- Face Pull
  SELECT id INTO ex_id FROM exercises WHERE name = 'Face Pull' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Posterior (Rear) Deltoid', 'primary'),
      (ex_id, 'Upper/Mid Trapezius', 'primary'),
      (ex_id, 'Rhomboids', 'primary'),
      (ex_id, 'Infraspinatus', 'secondary'),
      (ex_id, 'Teres Minor (rotator cuff)', 'secondary');
  END IF;

  -- Rear Delt Fly
  SELECT id INTO ex_id FROM exercises WHERE name = 'Rear Delt Fly' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Posterior (Rear) Deltoid', 'primary'),
      (ex_id, 'Rhomboids', 'secondary'),
      (ex_id, 'Mid/Lower Trapezius', 'secondary'),
      (ex_id, 'Infraspinatus', 'secondary'),
      (ex_id, 'Teres Minor', 'secondary');
  END IF;

  -- LEG EXERCISES

  -- Squat
  SELECT id INTO ex_id FROM exercises WHERE name = 'Squat' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Quadriceps', 'primary'),
      (ex_id, 'Glutes', 'primary'),
      (ex_id, 'Hamstrings', 'primary'),
      (ex_id, 'Calves', 'secondary'),
      (ex_id, 'Core', 'secondary'),
      (ex_id, 'Adductors', 'secondary'),
      (ex_id, 'Erector Spinae', 'secondary');
  END IF;

  -- Leg Press
  SELECT id INTO ex_id FROM exercises WHERE name = 'Leg Press' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Quadriceps', 'primary'),
      (ex_id, 'Glutes', 'primary'),
      (ex_id, 'Hamstrings', 'secondary'),
      (ex_id, 'Calves', 'secondary'),
      (ex_id, 'Adductors', 'secondary');
  END IF;

  -- Romanian Deadlift
  SELECT id INTO ex_id FROM exercises WHERE name = 'Romanian Deadlift' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Hamstrings', 'primary'),
      (ex_id, 'Glutes', 'primary'),
      (ex_id, 'Erector Spinae (lower back)', 'secondary'),
      (ex_id, 'Forearms', 'secondary'),
      (ex_id, 'Core', 'secondary');
  END IF;

  -- Leg Extension
  SELECT id INTO ex_id FROM exercises WHERE name = 'Leg Extension' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Quadriceps (all four heads)', 'primary');
  END IF;

  -- Leg Curl
  SELECT id INTO ex_id FROM exercises WHERE name = 'Leg Curl' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Hamstrings', 'primary'),
      (ex_id, 'Calves (gastrocnemius)', 'secondary'),
      (ex_id, 'Glutes (minor)', 'secondary');
  END IF;

  -- Calf Raise
  SELECT id INTO ex_id FROM exercises WHERE name = 'Calf Raise' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Gastrocnemius (straight knee)', 'primary'),
      (ex_id, 'Soleus (bent knee)', 'primary'),
      (ex_id, 'Tibialis Anterior (minor)', 'secondary');
  END IF;

  -- Lunge
  SELECT id INTO ex_id FROM exercises WHERE name = 'Lunge' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Quadriceps', 'primary'),
      (ex_id, 'Glutes', 'primary'),
      (ex_id, 'Hamstrings', 'secondary'),
      (ex_id, 'Calves', 'secondary'),
      (ex_id, 'Core', 'secondary'),
      (ex_id, 'Adductors', 'secondary');
  END IF;

  -- ARM EXERCISES

  -- Bicep Curl
  SELECT id INTO ex_id FROM exercises WHERE name = 'Bicep Curl' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Biceps Brachii (long head + short head)', 'primary'),
      (ex_id, 'Brachialis', 'secondary'),
      (ex_id, 'Brachioradialis', 'secondary'),
      (ex_id, 'Forearms', 'secondary');
  END IF;

  -- Hammer Curl
  SELECT id INTO ex_id FROM exercises WHERE name = 'Hammer Curl' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Brachialis', 'primary'),
      (ex_id, 'Brachioradialis', 'primary'),
      (ex_id, 'Biceps Brachii (reduced via neutral grip)', 'secondary'),
      (ex_id, 'Forearm Extensors', 'secondary');
  END IF;

  -- Tricep Pushdown
  SELECT id INTO ex_id FROM exercises WHERE name = 'Tricep Pushdown' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Triceps Brachii (lateral + long head)', 'primary'),
      (ex_id, 'Anconeus', 'secondary'),
      (ex_id, 'Forearms', 'secondary');
  END IF;

  -- Tricep Dip
  SELECT id INTO ex_id FROM exercises WHERE name = 'Tricep Dip' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Triceps Brachii (all three heads)', 'primary'),
      (ex_id, 'Pectoralis Major', 'primary'),
      (ex_id, 'Anterior Deltoid', 'secondary'),
      (ex_id, 'Forearms', 'secondary');
  END IF;

  -- Skull Crusher
  SELECT id INTO ex_id FROM exercises WHERE name = 'Skull Crusher' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Triceps Brachii (long head emphasis)', 'primary'),
      (ex_id, 'Anconeus', 'secondary'),
      (ex_id, 'Forearms', 'secondary');
  END IF;

  -- CORE EXERCISES

  -- Plank
  SELECT id INTO ex_id FROM exercises WHERE name = 'Plank' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Rectus Abdominis (entire)', 'primary'),
      (ex_id, 'Transverse Abdominis', 'primary'),
      (ex_id, 'Obliques', 'primary'),
      (ex_id, 'Deltoids', 'secondary'),
      (ex_id, 'Erector Spinae', 'secondary'),
      (ex_id, 'Glutes', 'secondary'),
      (ex_id, 'Quadriceps', 'secondary');
  END IF;

  -- Hanging Leg Raise
  SELECT id INTO ex_id FROM exercises WHERE name = 'Hanging Leg Raise' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Rectus Abdominis (lower emphasis)', 'primary'),
      (ex_id, 'Hip Flexors', 'primary'),
      (ex_id, 'Forearms (grip)', 'secondary'),
      (ex_id, 'Obliques', 'secondary'),
      (ex_id, 'Transverse Abdominis', 'secondary');
  END IF;

  -- Cable Crunch
  SELECT id INTO ex_id FROM exercises WHERE name = 'Cable Crunch' AND user_id IS NULL;
  IF ex_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exercise_muscles WHERE exercise_id = ex_id) THEN
    INSERT INTO exercise_muscles (exercise_id, muscle_name, muscle_role) VALUES
      (ex_id, 'Rectus Abdominis (upper emphasis)', 'primary'),
      (ex_id, 'Obliques', 'primary'),
      (ex_id, 'Hip Flexors', 'secondary'),
      (ex_id, 'Lats (stabilizer)', 'secondary');
  END IF;

END $$;
