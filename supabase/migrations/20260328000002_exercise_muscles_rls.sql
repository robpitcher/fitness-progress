-- Migration: RLS policies for exercise_muscles
-- Allows all authenticated users to read muscle data
-- Only allows users to modify muscle data for exercises they own

-- Enable RLS on exercise_muscles
ALTER TABLE exercise_muscles ENABLE ROW LEVEL SECURITY;

-- SELECT: Allow viewing muscle data for global exercises or user's own exercises
CREATE POLICY "select_exercise_muscles" ON exercise_muscles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises e
      WHERE e.id = exercise_muscles.exercise_id
        AND (e.user_id IS NULL OR e.user_id = auth.uid())
    )
  );

-- INSERT: Allow adding muscle data only to exercises the user owns
CREATE POLICY "insert_exercise_muscles" ON exercise_muscles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises e
      WHERE e.id = exercise_muscles.exercise_id
        AND e.user_id = auth.uid()
    )
  );

-- UPDATE: Allow updating muscle data only for exercises the user owns
CREATE POLICY "update_exercise_muscles" ON exercise_muscles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises e
      WHERE e.id = exercise_muscles.exercise_id
        AND e.user_id = auth.uid()
    )
  );

-- DELETE: Allow deleting muscle data only for exercises the user owns
CREATE POLICY "delete_exercise_muscles" ON exercise_muscles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises e
      WHERE e.id = exercise_muscles.exercise_id
        AND e.user_id = auth.uid()
    )
  );
