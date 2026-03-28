# Squad Decisions

## Active Decisions

### Playwright Added to Devcontainer

**Date:** 2025-07-15  
**Author:** Dozer

Added Playwright support to `.devcontainer/devcontainer.json`:

- **postCreateCommand** now chains `npx playwright install --with-deps` after the existing global install, ensuring browser binaries and OS-level deps are available on container creation.
- **VS Code extension** `ms-playwright.playwright` added so tests can be run/debugged from the editor.
- **No `@playwright/test` dev dependency added** — there is no `package.json` at the repo root yet. When one is created, `@playwright/test` should be added as a devDependency.

**Impact:** All team members rebuilding the devcontainer will get Playwright browsers and the VS Code extension automatically. Tank can start writing E2E tests once a `package.json` and test config are in place.

### Tailwind CSS v4 with CSS-based Config

**Date:** 2026-03-24  
**Author:** Trinity  
**PR:** #34

Tailwind v4 was installed as part of project scaffolding. Unlike v3, Tailwind v4 uses CSS-based configuration rather than `tailwind.config.js`. Dark mode is configured via `@custom-variant dark` in `src/index.css`.

**Key Choices:**
- Use `@tailwindcss/vite` plugin instead of PostCSS-based setup.
- Dark mode uses `class` strategy via `@custom-variant dark (&:where(.dark, .dark *))`.
- No `tailwind.config.js` — theme extensions go in CSS with `@theme`.

**Impact:** All team members writing Tailwind classes should use `dark:` prefix for dark mode variants. Theme customization happens in `src/index.css`, not a JS config file.

### Supabase Client Configuration

**Date:** 2026-03-24  
**Author:** Dozer  
**PR:** #33

Established the Supabase client as a single typed export at `src/lib/supabase.ts`. The client validates environment variables at initialization and throws a descriptive error if they're missing, pointing the developer to `.env.example`.

**Key Choices:**
- **Runtime env validation** — the client throws immediately if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing, rather than failing silently on first API call.
- **`vite-env.d.ts` for type safety** — env vars are typed via `ImportMetaEnv` interface in `src/vite-env.d.ts`. All future env vars should be added here.
- **Minimal `package.json`** — only `@supabase/supabase-js` is listed. Merge order: Trinity #1 first, then Dozer #2.

**Impact:** All data access goes through the single `supabase` export — no scattered client instantiation. Future database types will be passed as a generic to `createClient<Database>()` once the schema is defined.

### Core Database Schema Design

**Date:** 2025-07-15  
**Author:** Dozer  
**Issue:** #4

Established the foundational schema that all features depend on with six tables forming a cohesive unit.

**Key Choices:**
- **Single migration file** — all six tables in one migration (`20260324000001_create_schema.sql`) since they form a cohesive unit and must be deployed together.
- **Cascade deletes from profiles** — deleting a profile cascades to exercises, workouts, and body_weights. Workouts cascade to workout_exercises, which cascade to sets. This keeps cleanup simple and avoids orphaned rows.
- **Restrict delete on exercises→workout_exercises** — `exercise_id` FK uses `on delete restrict` so an exercise cannot be deleted while it's referenced in workout history. This prevents accidental data loss.
- **`profiles.id` has no default UUID** — the id comes from `auth.users.id` (supplied by Supabase Auth), so `gen_random_uuid()` default is intentionally omitted on that column.
- **`"order"` column quoted** — `order` is a reserved word in SQL; the column is always referenced as `"order"` in the migration.

**Impact:** All feature work (workout logging, body weight tracking, exercise library) depends on this schema. RLS policies will be added in a follow-up migration.

### Row-Level Security Policies

**Date:** 2026-03-24  
**Author:** Dozer  
**PR:** #39

Enabled Row-Level Security on all 6 tables with per-user access policies via `supabase/migrations/20260324000002_rls_policies.sql`.

**Key Choices:**
- **All tables use `auth.uid()` for ownership checks** — no service-role bypass policies.
- **`exercises` allows SELECT on global rows** — `user_id IS NULL` rows are visible to everyone so seed/shared exercises are visible, but only owner can mutate their own custom exercises.
- **`workout_exercises` and `sets` use `exists` subqueries** — joining through parent tables to verify ownership rather than denormalizing `user_id` onto every table.
- **UPDATE policies include both `using` and `with check`** — `using` determines which rows can be seen for update, `with check` determines which values the updated row must satisfy to prevent ownership transfer.
- **No DELETE policy on `profiles`** — account deletion is handled by Supabase Auth cascade from `auth.users`.

**Impact:** All Supabase client queries now go through RLS. The anon key can safely be shipped to the browser. Backend services needing bypass must use the service-role key.

### Theme System Architecture

**Date:** 2026-03-24  
**Author:** Trinity  
**PR:** #37  
**Issue:** #5

Implemented a React context-based theme system supporting `light`, `dark`, and `system` modes with persistence and FOUC prevention.

**Key Choices:**
- **Context in `src/lib/ThemeContext.ts`** — separated from the `ThemeProvider` component to comply with the `react-refresh/only-export-components` ESLint rule.
- **FOUC prevention via inline script** — a small synchronous `<script>` in `index.html` `<head>` reads `localStorage` and sets the `.dark` class before React hydrates, preventing any flash of wrong theme.
- **`system` as default** — when no preference is stored, the app follows `prefers-color-scheme`. A `matchMedia` listener re-applies the theme if the OS preference changes while in system mode.
- **ThemeProvider wraps outermost** — placed outside `QueryClientProvider` and `BrowserRouter` so all components, including future layout shells, have access to theme context.

**Impact:** All components can use `useTheme()` to read or change the theme. Tailwind `dark:` variants work automatically via the `.dark` class on `<html>`. Future theme toggle UI just needs to call `setTheme('light' | 'dark' | 'system')`.

### Infrastructure Deployment Workflow

**Date:** 2026-03-24
**Author:** Niobe
**PR:** #69
**Issue:** #67

Created a GitHub Actions workflow (`deploy-infra.yml`) for automated infrastructure deployment when Bicep files change on `main`.

**Key Choices:**
- **OIDC over client secrets** — Uses federated identity credentials on a user-assigned managed identity. No secret storage, no rotation needed.
- **Subscription-scoped deployment** — `az deployment sub create` allows the Bicep template to create/manage the resource group itself.
- **`production` GitHub environment** — Enables environment protection rules (required reviewers, wait timers) for future governance needs.
- **Path-filtered trigger** — Only runs on `infra/**` changes to avoid unnecessary deployments on app code changes.
- **SWA token extraction and masking** — Extracts deployment token from Bicep outputs and masks in logs for potential future automation.
- **`if: always()` on logout** — Ensures Azure logout happens even if deployment fails.

**Impact:** Three GitHub secrets required: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`. OIDC federation must be configured on the managed identity (documented in `infra/README.md`). Depends on #66 for the Bicep templates.

### SWA Deployment Workflow — Cleanup & Manual Trigger

**Date:** 2026-03-24
**Author:** Niobe
**PR:** #71
**Branch:** `squad/swa-workflow-cleanup`

Removed path filters from the SWA deploy workflow push trigger and added `workflow_dispatch` for manual redeploys.

**Key Choices:**
- **Remove all path filters** — every push to `main` triggers a deploy. Path filters create maintenance burden and risk silently missing deploys.
- **Add `workflow_dispatch:`** — enables manual redeploys from the GitHub Actions UI for debugging or forced redeployment without code changes.
- **Keep `pull_request` unfiltered** — allows the `close_pull_request_job` to fire on PR close and clean up preview environments, even for non-app changes.

**Rationale:** Missing a deploy is worse than an occasional no-op deploy (SWA deploys are fast and idempotent). Manual trigger is essential for debugging and secret rotation workflows.

**Impact:** All pushes to `main` will trigger the SWA workflow (minor increase in CI usage). Team can now click "Run workflow" in Actions tab for on-demand deploys.

### `.staticwebappignore` for SWA File Count Limit

**Date:** 2026-03-24
**Author:** Niobe
**Status:** Active

Azure SWA Free tier deployments were failing with "The number of static files was too large." Even with `skip_app_build: true` and `output_location: 'dist'`, the SWA deploy action walks the entire `app_location` directory (repo root), counting `node_modules/`, `.git/`, `.squad/`, `test-results/`, etc. toward the file limit.

**Solution:**
Added `.staticwebappignore` at the repo root. This file works like `.gitignore` but specifically for the SWA deploy action.

**What's Excluded:**
All non-deployed directories and files: `node_modules/`, `.squad/`, `.git/`, `.github/`, `supabase/`, `infra/`, `spec/`, `tests/`, `test-results/`, `playwright-report/`, `src/`, `public/`, config files, docs, and git metadata.

**What's Uploaded:**
Only `dist/` (Vite build output) and `staticwebapp.config.json` (SWA routing config).

**Tradeoff:** If new top-level files are added that need to be deployed, they must not match any pattern in `.staticwebappignore`. This is unlikely since all app output goes to `dist/`.

**Impact:** Workflow YAML needs no changes — the ignore file is the correct fix for this class of problem.

### Past Workout Blank Page Bug — Date Logic Fix

**Date:** 2026-03-27
**Author:** Trinity
**PR:** #78
**Issue:** Blank page when clicking "add workout" on past dates in calendar

The conditional query logic in `WorkoutPage.tsx` was inverted, causing both the today and past workout queries to be disabled simultaneously, leaving the UI in infinite loading state.

**Root Cause:**
```typescript
// BEFORE (BROKEN):
const { data: todayWorkouts = [], isLoading: loadingToday } =
  useTodayWorkout(isEditingPast ? undefined : userId);
const { data: pastWorkouts = [], isLoading: loadingPast } =
  useWorkoutByDate(isEditingPast ? userId : undefined, dateParam);
```

**Solution:**
```typescript
// AFTER (FIXED):
const { data: todayWorkouts = [], isLoading: loadingToday } =
  useTodayWorkout(!isEditingPast ? userId : undefined);
const { data: pastWorkouts = [], isLoading: loadingPast } =
  useWorkoutByDate(isEditingPast ? userId : undefined, isEditingPast ? dateParam : undefined);
```

**Pattern for Team:** When using conditional TanStack Query hooks, match the condition across ALL parameters. Use `undefined` to disable queries. Double-check the hook's `enabled` option aligns with your conditional parameters.

**Impact:** Past workout creation flow now works. No impact on today's workout flow.

### Date Validation Defense-in-Depth Pattern

**Date:** 2026-03-25
**Context:** PR #78 review fixes for past workout creation feature

When adding the ability to create workouts for past dates, deep-linking to future dates (e.g., `/workout/2099-01-01`) could bypass UI guards. This created a security/data integrity hole.

**Solution — Two-Layer Validation:**

1. **API Layer** (`useCreateWorkout` hook):
   - Validates date is not in the future
   - Throws: "Workout date cannot be in the future"
   - Sets correct `started_at` timestamp (midnight UTC for past, current timestamp for today)

2. **UI Layer** (`WorkoutPage.tsx`):
   - Checks if `dateParam > todayDateString()` for deep-linked routes
   - Hides "Start Workout" button for future dates
   - Shows: "Cannot create workouts for future dates"

**Pattern for Future Features:** Whenever accepting user-controlled dates or IDs via URL params, validate at both API (backend enforcement) and UI (better UX) layers. Never assume the UI will catch all invalid inputs.

**Files Modified:**
- `src/hooks/useWorkoutSession.ts` — Added future date validation + exported `todayDateString` utility
- `src/pages/WorkoutPage.tsx` — Added UI-level future date guard for deep links
- `tests/workout.spec.ts` — Made date assertions dynamic to prevent test staleness

### Null-Safety Testing & Crash Prevention

**Date:** 2026-03-28
**Author:** Trinity & Coordinator
**PR:** #78

Fixed critical null-safety crashes causing blank pages when optional data was undefined.

**Crashes Fixed:**
1. `WorkoutPage` line 33: `pastWorkouts[0]?.exercises` — prevented crash when past workout data missing
2. `CalendarPage` line 135: `detail?.exercises` — prevented crash when event detail undefined

**Pattern for Team:**
Use optional chaining at each level when accessing nested properties from potentially undefined objects:
- `obj?.prop?.nested?.deepValue` prevents cascading crashes
- Apply to array access: `array?.[index]?.property`
- This pattern prevents production crashes from undefined data states.

**Testing Improvements:**
- Replaced hardcoded test dates with dynamically computed dates (prevents test staleness)
- Replaced `waitForTimeout` with deterministic `waitForResponse` promises
- Fixed mock data to include all required database fields (prevents masking production bugs)

**Impact:** No more blank page crashes on missing data. Better test reliability and production stability.

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
