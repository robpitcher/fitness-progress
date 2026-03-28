-- Migration: Add exercise_muscles table and training_notes column
-- Stores muscle targeting information for each exercise with primary/secondary distinction

-- Create exercise_muscles table
CREATE TABLE exercise_muscles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  muscle_name text NOT NULL,
  muscle_role text NOT NULL DEFAULT 'primary' CHECK (muscle_role IN ('primary', 'secondary')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Index for faster queries by exercise_id
CREATE INDEX idx_exercise_muscles_exercise_id ON exercise_muscles(exercise_id);

-- Add training_notes column to exercises table
ALTER TABLE exercises ADD COLUMN training_notes text;
