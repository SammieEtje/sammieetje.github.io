# Quickstart: Plugins

```bash
npm ci && npm run check
npm run dev            # http://localhost:4321/plugins/ and /nl/projecten/
```

| # | Scenario | Expected | Spec |
|---|----------|----------|------|
| 1 | Open `/plugins/` | Introduction; three cards with purpose, demonstrates, tech, lifecycle, repo link | US1 |
| 2 | Look at this site's and the demo's cards | "spec-driven" marker with a link to their specs | US2 |
| 3 | Navigation; NL switch | "Plugins — what I build"; `/nl/projecten/` in Dutch | US3 |

## Validation results (2026-10-10)

| # | Result | Evidence |
|---|--------|----------|
| 1 | Pass | `plugins.spec.ts` introduction and complete cards; screenshot review (desktop dark) |
| 2 | Pass | `plugins.spec.ts` spec-driven markers on the site and the demo only |
| 3 | Pass | `plugins.spec.ts` navigation, language switch, Dutch page; phone home screenshot with six sections |

`quality-gate` passed on pull request #8. Lighthouse on all thirteen pages: 100 / 100 / 100 / 100
with 0 bytes of JavaScript.
