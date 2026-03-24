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

### 2026-03-24 — Theme System (#5)
- **ThemeContext** lives in `src/lib/ThemeContext.ts` (separated from component to satisfy `react-refresh/only-export-components` lint rule).
- **ThemeProvider** in `src/components/ThemeProvider.tsx` wraps the app at the outermost layer (before QueryClientProvider).
- **useTheme** hook in `src/hooks/useTheme.ts` returns `{ theme, setTheme, resolvedTheme }`.
- **FOUC prevention**: inline `<script>` in `index.html` `<head>` reads `localStorage('theme')` and applies `.dark` class before first paint.
- localStorage key is `'theme'`; valid values: `'light' | 'dark' | 'system'`. Defaults to `'system'` (OS preference).

### 2026-03-24 — Bottom Tab Navigation Shell (#9)
- **BottomTabBar** in `src/components/BottomTabBar.tsx` — fixed bottom nav with 5 tabs using `NavLink` for active-state highlighting.
- **Tab order**: Workout (Dumbbell), Calendar (Calendar), Weight (Scale), Charts (TrendingUp), Profile (User) — all Lucide icons.
- **Safe area**: `env(safe-area-inset-bottom)` applied via inline style for notched device support.
- **Touch targets**: `min-h-[44px] min-w-[44px]` on each tab link.
- **Active state**: indigo-600/400 text + `font-semibold` + heavier `strokeWidth` (2.5 vs 2).
- **Routing**: `/workout`, `/calendar`, `/weight`, `/charts`, `/profile` — `/` redirects to `/workout` via `<Navigate replace>`.
- **Layout**: `pb-16` wrapper div prevents page content from being hidden behind the fixed tab bar.
- **Placeholder pages** in `src/pages/` — each renders centered page name with light/dark support.
- **PR**: #41
