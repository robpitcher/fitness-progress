# Decision: Infrastructure Deployment Workflow

**Date:** 2026-03-24
**Author:** Niobe
**PR:** #69
**Issue:** #67

## Context

The project needs automated infrastructure deployment when Bicep files change on `main`.

## Decision

Created a GitHub Actions workflow (`deploy-infra.yml`) using OIDC federated credentials for passwordless Azure authentication.

**Key choices:**

- **OIDC over client secrets** — No `AZURE_CLIENT_SECRET` stored in GitHub. Uses federated identity credentials on a user-assigned managed identity. More secure, no secret rotation needed.
- **Subscription-scoped deployment** — `az deployment sub create` so the Bicep template can create/manage the resource group itself. This keeps the RG definition in code.
- **`production` GitHub environment** — Enables environment protection rules (required reviewers, wait timers) if Rob wants them later. No cost to add now.
- **Path-filtered trigger** — Only runs on `infra/**` changes to avoid unnecessary deployments on app code changes.
- **SWA token extraction and masking** — The workflow extracts the deployment token from Bicep outputs and masks it in logs. This token could be used by the existing SWA deploy workflow if we want to automate token rotation in the future.
- **`if: always()` on logout** — Ensures Azure logout happens even if deployment fails.

## Impact

- Three GitHub secrets required: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`
- OIDC federation must be configured on the managed identity (documented in `infra/README.md`)
- Depends on #66 for the Bicep templates this workflow references
