# Decision: Core Database Schema Design

**Date:** 2025-07-15
**Author:** Dozer
**Issue:** #4

## Context

The PRD specifies six tables for the fitness-progress data model. This migration establishes the foundational schema that all features depend on.

## Decisions

1. **Single migration file** — all six tables in one migration (`20260324000001_create_schema.sql`) since they form a cohesive unit and must be deployed together.

2. **Cascade deletes from profiles** — deleting a profile cascades to exercises, workouts, and body_weights. Workouts cascade to workout_exercises, which cascade to sets. This keeps cleanup simple and avoids orphaned rows.

3. **Restrict delete on exercises→workout_exercises** — `exercise_id` FK uses `on delete restrict` so an exercise cannot be deleted while it's referenced in workout history. This prevents accidental data loss.

4. **`profiles.id` has no default UUID** — the id comes from `auth.users.id` (supplied by Supabase Auth), so `gen_random_uuid()` default is intentionally omitted on that column.

5. **`"order"` column quoted** — `order` is a reserved word in SQL; the column is always referenced as `"order"` in the migration.

## Impact

All feature work (workout logging, body weight tracking, exercise library) depends on this schema. RLS policies will be added in a follow-up migration.
