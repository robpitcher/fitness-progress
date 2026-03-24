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
