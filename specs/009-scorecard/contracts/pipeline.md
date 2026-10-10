# Contract: Pipeline (009 revision of 001 contracts/quality-gate.md)

| Job | Needs | Permissions | Runs |
|-----|-------|-------------|------|
| `checks` | — | contents: read | format:check, lint, typecheck, test:unit, trace, build, test:e2e, links; uploads `dist`, `reports` |
| `budgets` (×3) | checks | contents: read | budgets with `LHCI_SHARD=i/3`; uploads shard reports |
| `report` | checks, budgets | contents: read, actions: read | merge → `quality-report.json`; on main: Pages artifact = `dist` + `quality/report.json` |
| `quality-gate` | checks, budgets, report (`if: always()`) | none | fails unless all succeeded — the required check |
| `deploy` | quality-gate (push to main) | pages: write, id-token: write | deploy-pages |
