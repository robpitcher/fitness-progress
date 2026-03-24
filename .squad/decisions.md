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

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
