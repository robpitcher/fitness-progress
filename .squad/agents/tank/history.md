# Project Context

- **Owner:** Rob
- **Project:** Fitness Progress Tracker — a mobile-optimized web app for logging workouts, tracking body weight, and visualizing fitness progress over time.
- **Stack:** React 18+ (Vite), TypeScript, Tailwind CSS, React Router v6, TanStack Query, Recharts, Lucide React, Supabase (PostgreSQL + Auth + REST API), Azure Static Web Apps
- **Created:** 2026-03-23

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->
- Playwright testing framework adopted for E2E tests. Browsers installed in devcontainer via `npx playwright install --with-deps` in postCreateCommand; VS Code extension `ms-playwright.playwright` available. `@playwright/test` will be added as devDependency once `package.json` is created.
- Charts page (`/charts`) uses a single exercise dropdown selector (`#exercise-select`) — no internal tab UI. Bottom tab bar handles cross-page navigation. E2E tests follow the body-weight.spec.ts pattern: direct route navigation, semantic locators, no auth mocking.
