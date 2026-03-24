-- Migration: Create core fitness-progress schema
-- Tables: profiles, exercises, workouts, workout_exercises, sets, body_weights

-- 5.1 profiles
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- 5.2 exercises
create table exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  user_id uuid references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint exercises_user_name_unique unique (user_id, name)
);

-- 5.3 workouts
create table workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  date date not null,
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index workouts_user_date_idx on workouts (user_id, date);

-- 5.4 workout_exercises
create table workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts (id) on delete cascade,
  exercise_id uuid not null references exercises (id) on delete restrict,
  "order" int not null,
  created_at timestamptz not null default now()
);

-- 5.5 sets
create table sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references workout_exercises (id) on delete cascade,
  set_number int not null,
  reps int,
  weight numeric,
  created_at timestamptz not null default now()
);

-- 5.6 body_weights
create table body_weights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  date date not null,
  weight numeric not null,
  created_at timestamptz not null default now(),
  constraint body_weights_user_date_unique unique (user_id, date)
);
