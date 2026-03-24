# Project Context

- **Owner:** Rob
- **Project:** Fitness Progress Tracker — a mobile-optimized web app for logging workouts, tracking body weight, and visualizing fitness progress over time.
- **Stack:** React 18+ (Vite), TypeScript, Tailwind CSS, React Router v6, TanStack Query, Recharts, Lucide React, Supabase (PostgreSQL + Auth + REST API), Azure Static Web Apps
- **Created:** 2026-03-23

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->
- Playwright added to devcontainer: browsers installed via `npx playwright install --with-deps` in postCreateCommand, VS Code extension `ms-playwright.playwright` added. No package.json exists yet so `@playwright/test` was not added as a dep — will need to be added when package.json is created.
- Created core database schema migration (`supabase/migrations/20260324000001_create_schema.sql`) with 6 tables: profiles, exercises, workouts, workout_exercises, sets, body_weights. All FKs use cascade deletes except exercises→workout_exercises which uses restrict to prevent orphaned history. `profiles.id` references `auth.users(id)` directly (no default UUID — Supabase Auth supplies it).
