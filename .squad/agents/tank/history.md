# Project Context

- **Owner:** Rob
- **Project:** Fitness Progress Tracker — a mobile-optimized web app for logging workouts, tracking body weight, and visualizing fitness progress over time.
- **Stack:** React 18+ (Vite), TypeScript, Tailwind CSS, React Router v6, TanStack Query, Recharts, Lucide React, Supabase (PostgreSQL + Auth + REST API), Azure Static Web Apps
- **Created:** 2026-03-23

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->
- Playwright testing framework adopted for E2E tests. Browsers installed in devcontainer via `npx playwright install --with-deps` in postCreateCommand; VS Code extension `ms-playwright.playwright` available. `@playwright/test` will be added as devDependency once `package.json` is created.
- Vite 8 does NOT load `.env` files via dotenv. Supabase env vars must be passed via `process.env` (e.g. `webServer.env` in `playwright.config.ts`). Tests mock Supabase auth via `localStorage` session injection and intercept REST API calls via `page.route()`.
- E2E workout logging tests added in PR #64 (issue #32). Pattern: `setupSupabaseMocks(page, options)` helper injects auth session + intercepts all Supabase endpoints. Reusable across test suites.
