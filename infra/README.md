# Infrastructure — Fitness Progress

This directory contains Azure infrastructure-as-code (Bicep) templates and documentation for the Fitness Progress app.

## Automated Deployment

The GitHub Actions workflow **Deploy Infrastructure** (`.github/workflows/deploy-infra.yml`) automatically deploys Azure resources whenever changes to `infra/**` are pushed to `main`.

### What the workflow does

1. Checks out the repository
2. Authenticates to Azure using **OIDC federated credentials** (no stored secrets/passwords)
3. Runs `az deployment sub create` with `infra/main.bicep` (subscription-scoped deployment)
4. Extracts and masks sensitive outputs (e.g., SWA deployment token) from the deployment
5. Logs out from Azure

### Required GitHub Repository Secrets

Configure these in **Settings → Secrets and variables → Actions** (or scoped to the `production` environment):

| Secret | Description |
|---|---|
| `AZURE_CLIENT_ID` | Client (application) ID of the user-assigned managed identity used for deployment |
| `AZURE_TENANT_ID` | Azure Active Directory (Entra ID) tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID where resources are deployed |

> **Note:** No client secret is needed — authentication uses OIDC federated credentials.

### Setting Up OIDC Federation (GitHub ↔ Azure)

To allow GitHub Actions to authenticate without stored credentials:

1. **Create a user-assigned managed identity** (or use an existing one) in the Azure portal.
2. **Assign roles** to the managed identity:
   - `Contributor` on the target subscription (for resource creation)
   - `User Access Administrator` if the Bicep template assigns roles
3. **Add a federated credential** on the managed identity:
   - Go to the managed identity → **Federated credentials** → **Add credential**
   - Select **GitHub Actions deploying Azure resources**
   - **Organization:** your GitHub org or username
   - **Repository:** `fitness-progress`
   - **Entity type:** Branch → `main`
   - **Name:** e.g., `github-actions-main`
4. **Add the three secrets** (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`) to the repository or the `production` environment in GitHub.

For full details, see [Microsoft docs: Configure a federated identity credential on a managed identity](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation-create-trust-managed-identity).

### Manual Trigger

You can run the workflow manually from the **Actions** tab:

1. Go to **Actions** → **Deploy Infrastructure**
2. Click **Run workflow**
3. Select the `main` branch
4. Click **Run workflow**

This is useful for re-deploying infrastructure without making a code change (e.g., after fixing an Azure-side issue).

## Bicep Templates

| File | Scope | Description |
|---|---|---|
| `main.bicep` | Subscription | Entry point — creates the resource group and calls child modules |

> Additional modules will be documented here as they are added.
