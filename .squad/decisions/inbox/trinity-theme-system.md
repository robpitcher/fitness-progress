# Theme System Architecture

**Date:** 2026-03-24  
**Author:** Trinity  
**PR:** #37  
**Issue:** #5

## Decision

Implemented a React context-based theme system supporting `light`, `dark`, and `system` modes. Theme state is persisted in `localStorage` under the key `'theme'` and applied by toggling the `.dark` class on `<html>`, which aligns with Tailwind v4's `@custom-variant dark` configuration.

## Key Choices

- **Context in `src/lib/ThemeContext.ts`** — separated from the `ThemeProvider` component to comply with the `react-refresh/only-export-components` ESLint rule.
- **FOUC prevention via inline script** — a small synchronous `<script>` in `index.html` `<head>` reads `localStorage` and sets the `.dark` class before React hydrates, preventing any flash of wrong theme.
- **`system` as default** — when no preference is stored, the app follows `prefers-color-scheme`. A `matchMedia` listener re-applies the theme if the OS preference changes while in system mode.
- **ThemeProvider wraps outermost** — placed outside `QueryClientProvider` and `BrowserRouter` so all components, including future layout shells, have access to theme context.

## Impact

- All components can use `useTheme()` to read or change the theme.
- Tailwind `dark:` variants work automatically via the `.dark` class on `<html>`.
- Future theme toggle UI just needs to call `setTheme('light' | 'dark' | 'system')`.
