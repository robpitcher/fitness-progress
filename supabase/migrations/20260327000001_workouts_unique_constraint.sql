-- Migration: Add unique constraint on workouts (user_id, date)
-- This prevents multiple workouts per user per day

alter table workouts
  add constraint workouts_user_date_unique unique (user_id, date);
