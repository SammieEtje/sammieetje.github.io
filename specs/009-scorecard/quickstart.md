# Quickstart: Scorecard

```bash
npm ci && npm run check                      # all pages, unsharded, writes quality-report.json
LHCI_SHARD=2/3 npm run budgets               # one shard, as in CI
mkdir -p dist/quality && cp quality-report.json dist/quality/report.json && npm run preview
```

| # | Scenario | Expected | Spec |
|---|----------|----------|------|
| 1 | Merge to `main` | Pipeline green and live within 10 minutes; budgets ≤ ~3 min | US1, SC-001, SC-002 |
| 2 | Open `/scorecard/` on the live site | Verdict, commit, tiles, per-page table matching the run | US2 |
| 3 | Preview without a report | "No measurement available yet" | US3 |
| 4 | Disable JavaScript | Explanation, specs shipped, raw report link | US3 |
| 5 | Footer and navigation | "Scorecard" link next to the build id; nav item | US4 |

## Validation results (2026-10-10)

| # | Result | Evidence |
|---|--------|----------|
| 1 | Pass on the pull request; confirm on `main` after merge | PR #10 run: 6 min 23 s end to end (was ~10 min). checks 104 s; budgets shards 241 s, 240 s, 199 s in parallel (were 483 s in one job); report 23 s; quality-gate 3 s |
| 2 | Pass with a real local report; confirm live after merge | screenshots with a merged local report; merged CI report: schema 2, 17 of 17 pages exactly once, tests 114 / 298, duration 374 s |
| 3 | Pass | `scorecard.spec.ts`: pending placeholder and 404 → "No measurement available yet." |
| 4 | Pass | `scorecard.spec.ts` without JavaScript |
| 5 | Pass | `footer.spec.ts`, `scorecard.spec.ts` navigation |
