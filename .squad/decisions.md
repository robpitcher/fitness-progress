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

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
