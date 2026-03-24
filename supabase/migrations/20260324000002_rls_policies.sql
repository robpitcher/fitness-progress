-- Migration: Enable Row-Level Security and create access policies
-- Ensures every user can only access their own data

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
alter table profiles enable row level security;
alter table exercises enable row level security;
alter table workouts enable row level security;
alter table workout_exercises enable row level security;
alter table sets enable row level security;
alter table body_weights enable row level security;

-- ============================================================
-- profiles: users can INSERT, SELECT, and UPDATE their own row
-- ============================================================
create policy "Users can insert own profile"
  on profiles for insert
  with check (id = auth.uid());

create policy "Users can view own profile"
  on profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================================
-- exercises: SELECT global (user_id IS NULL) or own;
--            INSERT/UPDATE/DELETE own only
-- ============================================================
create policy "Users can view global and own exercises"
  on exercises for select
  using (user_id is null or user_id = auth.uid());

create policy "Users can insert own exercises"
  on exercises for insert
  with check (user_id = auth.uid());

create policy "Users can update own exercises"
  on exercises for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own exercises"
  on exercises for delete
  using (user_id = auth.uid());

-- ============================================================
-- workouts: full CRUD on own rows only
-- ============================================================
create policy "Users can view own workouts"
  on workouts for select
  using (user_id = auth.uid());

create policy "Users can insert own workouts"
  on workouts for insert
  with check (user_id = auth.uid());

create policy "Users can update own workouts"
  on workouts for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own workouts"
  on workouts for delete
  using (user_id = auth.uid());

-- ============================================================
-- workout_exercises: CRUD through workouts.user_id ownership
-- ============================================================
create policy "Users can view own workout_exercises"
  on workout_exercises for select
  using (
    exists (
      select 1 from workouts
      where workouts.id = workout_exercises.workout_id
        and workouts.user_id = auth.uid()
    )
  );

create policy "Users can insert own workout_exercises"
  on workout_exercises for insert
  with check (
    exists (
      select 1 from workouts
      where workouts.id = workout_exercises.workout_id
        and workouts.user_id = auth.uid()
    )
  );

create policy "Users can update own workout_exercises"
  on workout_exercises for update
  using (
    exists (
      select 1 from workouts
      where workouts.id = workout_exercises.workout_id
        and workouts.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workouts
      where workouts.id = workout_exercises.workout_id
        and workouts.user_id = auth.uid()
    )
  );

create policy "Users can delete own workout_exercises"
  on workout_exercises for delete
  using (
    exists (
      select 1 from workouts
      where workouts.id = workout_exercises.workout_id
        and workouts.user_id = auth.uid()
    )
  );

-- ============================================================
-- sets: CRUD through workout_exercises -> workouts.user_id
-- ============================================================
create policy "Users can view own sets"
  on sets for select
  using (
    exists (
      select 1 from workout_exercises
        join workouts on workouts.id = workout_exercises.workout_id
      where workout_exercises.id = sets.workout_exercise_id
        and workouts.user_id = auth.uid()
    )
  );

create policy "Users can insert own sets"
  on sets for insert
  with check (
    exists (
      select 1 from workout_exercises
        join workouts on workouts.id = workout_exercises.workout_id
      where workout_exercises.id = sets.workout_exercise_id
        and workouts.user_id = auth.uid()
    )
  );

create policy "Users can update own sets"
  on sets for update
  using (
    exists (
      select 1 from workout_exercises
        join workouts on workouts.id = workout_exercises.workout_id
      where workout_exercises.id = sets.workout_exercise_id
        and workouts.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workout_exercises
        join workouts on workouts.id = workout_exercises.workout_id
      where workout_exercises.id = sets.workout_exercise_id
        and workouts.user_id = auth.uid()
    )
  );

create policy "Users can delete own sets"
  on sets for delete
  using (
    exists (
      select 1 from workout_exercises
        join workouts on workouts.id = workout_exercises.workout_id
      where workout_exercises.id = sets.workout_exercise_id
        and workouts.user_id = auth.uid()
    )
  );

-- ============================================================
-- body_weights: full CRUD on own rows only
-- ============================================================
create policy "Users can view own body_weights"
  on body_weights for select
  using (user_id = auth.uid());

create policy "Users can insert own body_weights"
  on body_weights for insert
  with check (user_id = auth.uid());

create policy "Users can update own body_weights"
  on body_weights for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own body_weights"
  on body_weights for delete
  using (user_id = auth.uid());
