# Project Context

- **Owner:** Rob
- **Project:** Fitness Progress Tracker — a mobile-optimized web app for logging workouts, tracking body weight, and visualizing fitness progress over time.
- **Stack:** React 18+ (Vite), TypeScript, Tailwind CSS, React Router v6, TanStack Query, Recharts, Lucide React, Supabase (PostgreSQL + Auth + REST API), Azure Static Web Apps
- **Created:** 2026-03-23

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

### 2026-03-24 — Project Setup (#1)
- **Tailwind v4** uses CSS-based config, not `tailwind.config.js`. Dark mode via `@custom-variant dark (&:where(.dark, .dark *))` in `src/index.css`.
- **Vite plugin**: `@tailwindcss/vite` in `vite.config.ts` — no PostCSS config needed.
- **App shell**: `src/App.tsx` wraps everything in `QueryClientProvider > BrowserRouter > Routes`.
- **Folder structure**: `src/components`, `src/pages`, `src/hooks`, `src/lib`, `src/types`.
- **TypeScript strict mode** is on via `tsconfig.app.json`.
- **Playwright**: `playwright.config.ts` at repo root — chromium only, tests in `./tests/`.
- Vite scaffolded React 19 (compatible with the 18+ requirement in the PRD).
