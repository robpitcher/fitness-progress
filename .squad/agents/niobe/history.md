# Niobe — History

## Project Context

- **Project:** fitness-progress
- **Owner:** Rob
- **Stack:** React 18+ (Vite), TypeScript, Tailwind CSS, React Router v6, TanStack Query, Recharts, Lucide React, Supabase (PostgreSQL + Auth + REST API), Azure Static Web Apps
- **Description:** A mobile-optimized fitness tracking web app for logging workouts, tracking body weight, and visualizing progress over time.
- **Joined:** 2026-03-24

## Key Files

- `staticwebapp.config.json` — Azure Static Web Apps routing and config
- `.github/workflows/` — CI/CD pipelines (if any)
- `vite.config.ts` — Build configuration
- `supabase/` — Database migrations and config

## Learnings

(Append new learnings below this line)

### Infra Deployment Workflow (#67)
- Created `.github/workflows/deploy-infra.yml` for automated Azure infra deployment
- Uses OIDC federated credentials (no stored client secrets) via `azure/login@v2`
- Triggers on `infra/**` changes to main + manual `workflow_dispatch`
- Subscription-scoped deployment: `az deployment sub create --template-file infra/main.bicep`
- Extracts SWA deployment token from Bicep outputs and masks it in logs
- Targets `production` GitHub environment for protection rules
- Created `infra/README.md` with secrets docs, OIDC federation setup, and manual trigger instructions
- PR #69 opened as draft — depends on #66 for the Bicep files it references

### Bicep IaC for Static Web App (#66) — 2026-03-24
- Created `infra/main.bicep` (subscription-scoped), `infra/modules/static-web-app.bicep` (SWA resource), and `infra/main.bicepparam` (defaults).
- SWA build properties aligned with Vite/React: `appLocation: '/'`, `outputLocation: 'dist'`, `apiLocation: ''`.
- `deploymentToken` output uses `listSecrets()` — needs `#disable-next-line outputs-should-not-contain-secrets` to suppress linter warning.
- Validated clean with `az bicep build`. Opened draft PR #68 on branch `squad/66-bicep-iac`.
- Key files added to project: `infra/main.bicep`, `infra/modules/static-web-app.bicep`, `infra/main.bicepparam`.

### SWA Deploy File Count Fix (#70) — 2026-03-24
- Azure SWA Free tier deployment was failing with "The number of static files was too large" because the deploy action walks `app_location` (repo root) even with `skip_app_build: true`.
- Created `.staticwebappignore` at repo root to exclude `node_modules/`, `.squad/`, `.git/`, `.github/`, `supabase/`, `infra/`, `spec/`, `tests/`, `test-results/`, `playwright-report/`, `src/`, `public/`, and config/meta files.
- Only `dist/` (build output) and `staticwebapp.config.json` (SWA routing) get uploaded now.
- The workflow YAML itself needed no changes — `app_location: '/'`, `output_location: 'dist'`, `skip_app_build: true` were already correct.
- Committed to branch `squad/swa-path-filters` (PR #70).

### SWA Deploy Path Fix (#70, follow-up) — 2026-03-24
- `.staticwebappignore` alone did NOT fix the "too many static files" error — with `skip_app_build: true`, the SWA deploy action ignores `.staticwebappignore` and still walks everything under `app_location`.
- Fix: changed `app_location` from `'/'` (repo root) to `'./dist'` (build output only), set `output_location: ''`, and added a step to copy `staticwebapp.config.json` into `dist/` so SWA routing rules are included.
- Key lesson: when using `skip_app_build: true`, always point `app_location` directly at the final build output directory — don't rely on `.staticwebappignore` or `output_location` to filter.
- `close_pull_request_job` left unchanged — it only runs `action: 'close'` and doesn't upload files.
