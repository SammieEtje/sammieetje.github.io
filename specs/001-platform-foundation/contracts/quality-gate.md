# Contract: Quality Gate

## Local golden path (FR-017)

```bash
npm ci
npm run check
```

`npm run check` runs, in order, and stops at the first failure:

| Script | What it checks | Requirement |
|--------|----------------|-------------|
| `format:check` | Prettier formatting | FR-014 |
| `lint` | ESLint (TypeScript + Astro rules) | FR-014 |
| `typecheck` | `astro check` (TypeScript strict) | FR-014, FR-010 |
| `test:unit` | Vitest: dictionaries, routes, metadata, trace check, workflow policy | FR-010, FR-018, FR-020 |
| `trace` | Every `data-spec` and task reference exists in the specs | FR-018 |
| `build` | Static build into `dist/` | FR-016 |
| `test:e2e` | Playwright + axe on the built site | FR-001–FR-013 |
| `links` | Internal links in `dist/` resolve | FR-014 |
| `budgets` | Lighthouse CI assertions + `quality-report.json` | FR-014, FR-019 |

## Pipeline (`.github/workflows/pipeline.yml`)

| Trigger | `quality-gate` job | `deploy` job |
|---------|--------------------|--------------|
| `pull_request` → `main` | runs every script above as a separate step | skipped |
| `push` → `main` | runs every script; uploads `dist/` as Pages artefact | runs after gate success |
| `workflow_dispatch` | runs every script | skipped unless on `main` |

Outputs of every run (FR-019):

- Step summary: a table with each script's outcome and the per-page budget scores.
- Artefact `quality-report`: `quality-report.json` (schema in `data-model.md`) and the raw
  Lighthouse results.

Policies (FR-020), enforced by a unit test over every workflow file:

- Top-level `permissions` is declared and empty (`{}`); each job declares its own.
- Every `uses:` that is not a local path is pinned to a 40-character commit SHA.

Merge protection (FR-015): branch protection on `main` requires the `quality-gate` check to pass
and the branch to be up to date.
