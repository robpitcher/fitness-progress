# Decision: .staticwebappignore for SWA deploy file count limit

**Author:** Niobe (Azure Cloud Engineer)
**Date:** 2026-03-24
**Status:** Proposed

## Context
The Azure SWA Free tier deployment was failing with "The number of static files was too large." Even with `skip_app_build: true` and `output_location: 'dist'`, the SWA deploy action walks the entire `app_location` directory (repo root), counting `node_modules/`, `.git/`, `.squad/`, `test-results/`, etc. toward the file limit.

## Decision
Added `.staticwebappignore` at the repo root. This file works like `.gitignore` but specifically for the SWA deploy action — it tells the uploader which paths to skip.

### What's excluded
All directories and files that are not part of the deployed app: `node_modules/`, `.squad/`, `.git/`, `.github/`, `supabase/`, `infra/`, `spec/`, `tests/`, `test-results/`, `playwright-report/`, `src/`, `public/`, plus config files (`*.config.js`, `*.config.ts`, `tsconfig*.json`, `package*.json`), docs (`*.md`, `LICENSE`), and git metadata (`.gitignore`, `.gitattributes`).

### What's uploaded
Only `dist/` (Vite build output) and `staticwebapp.config.json` (SWA routing config at repo root).

## Tradeoffs
- If new top-level files or directories are added that need to be deployed, they must not match any pattern in `.staticwebappignore`. This is unlikely since all app output goes to `dist/`.
- The workflow YAML itself needed no changes — the ignore file is the correct fix for this class of problem.
