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
