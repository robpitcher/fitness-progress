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
### 2026-03-24 — TypeScript Types & API Hooks (#8)
- **Entity types** in `src/types/database.ts`: Profile, Exercise, Workout, WorkoutExercise, Set, BodyWeight — plus Insert and Update variants derived with `Omit`/`Pick`/`Partial`.
- **Barrel export** in `src/types/index.ts` re-exports all types from `database.ts`.
- **Query key factory** in `src/hooks/queryKeys.ts` — `queryKeys.workouts.list(userId)` returns `["workouts", "list", userId]` for TanStack Query cache keys.
- **`useSupabaseQuery`** and **`useSupabaseQuerySingle`** in `src/hooks/useSupabaseQuery.ts` — generic wrappers around `useQuery` that accept a Supabase query builder and handle error/null unwrapping.
- **`useSupabaseMutation`** in `src/hooks/useSupabaseMutation.ts` — wraps `useMutation` with automatic cache invalidation via `invalidateKeys`.
- Schema note: `workouts.started_at` is nullable in the DB (no `NOT NULL` constraint), so the TS type is `string | null`.

### 2026-03-24 — Authentication UI & Flow (#10)
- **AuthContext** in `src/lib/AuthContext.tsx` — separated context from component (same pattern as ThemeContext) to satisfy `react-refresh/only-export-components`.
- **AuthProvider** in `src/components/AuthProvider.tsx` — manages Supabase session via `getSession()` + `onAuthStateChange`, exposes `signIn`, `signUp`, `signOut`.
- **useAuth** hook in `src/hooks/useAuth.ts` — consumes AuthContext with provider guard.
- **LoginPage** (`src/pages/LoginPage.tsx`) and **SignUpPage** (`src/pages/SignUpPage.tsx`) — email/password forms with error display, loading states, and cross-links.
- **ProtectedLayout** in `src/App.tsx` — uses `<Outlet>` for nested routes; redirects to `/login` when unauthenticated; shows spinner during auth check.
- **PublicRoute** wrapper redirects authenticated users away from login/signup to `/workout`.
- **ProfilePage** updated with sign-out button (red, with `LogOut` icon) and displays user email.
- **PR:** #42

### 2026-03-24 — Exercise Search & Picker Component (#11)
- **ExercisePicker** in `src/components/ExercisePicker.tsx` — modal/overlay with real-time search, exercise list, and inline custom exercise creation form.
- Uses wrapper + inner component pattern: outer component conditionally renders inner, so local state resets on unmount/remount (avoids `setState`-in-effect lint violation).
- Library exercises shown with `Dumbbell` icon; custom exercises with `User` icon + indigo "Custom" badge.
- Touch targets ≥ 44px on all interactive elements. Body scroll locked while modal is open.
- **useExercises** hook (`src/hooks/useExercises.ts`) — fetches global (`user_id IS NULL`) + user's custom exercises via `.or()` filter, sorted by name.
- **useCreateExercise** hook (`src/hooks/useCreateExercise.ts`) — mutation with `queryKeys.exercises.all` invalidation.
- Both hooks follow existing `useSupabaseQuery` / `useSupabaseMutation` patterns from #8.
- **PR:** #43
