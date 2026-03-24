# Decision: SWA workflow path filters — push only

**Author:** Niobe (Azure Cloud Engineer)
**Date:** 2025-01-29
**Status:** Proposed

## Context
The Azure Static Web Apps deployment workflow was triggering on every push and PR to `main`, including `.squad/` commits, infra changes, docs, etc. This wastes CI minutes and creates noise.

## Decision
Add `paths` filters to the `push` trigger only. The `pull_request` trigger is left **unfiltered**.

### Why not filter pull_request too?
The `close_pull_request_job` must fire on `github.event.action == 'closed'` to clean up SWA preview environments. If we add path filters to the PR trigger, GitHub Actions won't fire the workflow on PR close unless the PR's last commit touched a matching path — breaking preview environment cleanup.

### Paths included
`src/**`, `public/**`, `index.html`, `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*.json`, `staticwebapp.config.json`

These cover all files that affect the built application output.

## Tradeoffs
- PRs will still trigger build_and_deploy for non-app changes (e.g., docs-only PRs). This is acceptable — preview deploys are cheap and the close cleanup is critical.
- Push deploys to production are now properly filtered, which is the higher-value optimization.
