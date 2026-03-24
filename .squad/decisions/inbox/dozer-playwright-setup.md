# Playwright Added to Devcontainer

**Date:** 2025-07-15
**Author:** Dozer

## Decision

Added Playwright support to `.devcontainer/devcontainer.json`:

- **postCreateCommand** now chains `npx playwright install --with-deps` after the existing global install, ensuring browser binaries and OS-level deps are available on container creation.
- **VS Code extension** `ms-playwright.playwright` added so tests can be run/debugged from the editor.
- **No `@playwright/test` dev dependency added** — there is no `package.json` at the repo root yet. When one is created, `@playwright/test` should be added as a devDependency.

## Impact

All team members rebuilding the devcontainer will get Playwright browsers and the VS Code extension automatically. Tank can start writing E2E tests once a `package.json` and test config are in place.
