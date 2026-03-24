# Decision: Remove path filters and add workflow_dispatch to SWA workflow

**Date:** 2026-03-24
**Author:** Niobe
**PR:** #71
**Branch:** `squad/swa-workflow-cleanup`

## Context

The SWA deploy workflow on `main` had `paths:` filters on the push trigger that restricted deploys to changes in `src/`, `public/`, `index.html`, config files, etc. This meant changes to the workflow file itself, `.staticwebappignore`, infra configs, or new non-listed files would not trigger a deploy.

## Decision

1. **Remove all path filters** from the push trigger — every push to `main` triggers a deploy.
2. **Add `workflow_dispatch:`** as a top-level trigger so the team can manually redeploy from the GitHub Actions UI.

## Rationale

- Path filters create a maintenance burden — every new deployable file type requires updating the filter list.
- Missing a deploy is worse than an occasional no-op deploy (SWA deploys are fast and idempotent).
- Manual trigger is essential for debugging deployment issues, redeploying after secrets rotation, or forcing a redeploy without a code change.

## Impact

- All pushes to `main` will trigger the SWA workflow. This is a minor increase in CI usage but ensures deploys are never silently skipped.
- Team members can now click "Run workflow" in the Actions tab for on-demand deploys.
