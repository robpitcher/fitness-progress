# Project Context

- **Owner:** Rob
- **Project:** Fitness Progress Tracker — a mobile-optimized web app for logging workouts, tracking body weight, and visualizing fitness progress over time.
- **Stack:** React 18+ (Vite), TypeScript, Tailwind CSS, React Router v6, TanStack Query, Recharts, Lucide React, Supabase (PostgreSQL + Auth + REST API), Azure Static Web Apps
- **Created:** 2026-03-23

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->
- Playwright added to devcontainer: browsers installed via `npx playwright install --with-deps` in postCreateCommand, VS Code extension `ms-playwright.playwright` added. No package.json exists yet so `@playwright/test` was not added as a dep — will need to be added when package.json is created.
- Created core database schema migration (`supabase/migrations/20260324000001_create_schema.sql`) with 6 tables: profiles, exercises, workouts, workout_exercises, sets, body_weights. All FKs use cascade deletes except exercises→workout_exercises which uses restrict to prevent orphaned history. `profiles.id` references `auth.users(id)` directly (no default UUID — Supabase Auth supplies it).
- Created RLS policies migration (`supabase/migrations/20260324000002_rls_policies.sql`). Enables RLS on all 6 tables. Profiles: INSERT/SELECT/UPDATE own row. Exercises: SELECT global + own, INSERT/UPDATE/DELETE own only. Workouts & body_weights: full CRUD own rows. workout_exercises & sets: CRUD via `exists` subquery joining through workouts.user_id to verify ownership. PR #39, closes #6.
- Created auto-profile-creation migration (`supabase/migrations/20260324000004_auto_create_profile.sql`). Added `handle_new_user()` function and `on_auth_user_created` trigger on `auth.users` that automatically inserts a `profiles` row whenever a user signs up. Included backfill statement to create profiles for existing auth.users without profiles. This fixes the foreign key constraint violation when creating workouts — `workouts.user_id` references `profiles.id`, and now every auth user is guaranteed to have a profile.
