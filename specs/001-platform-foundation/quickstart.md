# Quickstart: Platform Foundation

How to prove this feature works, locally and in the pipeline.

## Prerequisites

- Node.js 24 or newer (`.nvmrc`), npm.
- Google Chrome or Chromium for the budget checks; Playwright installs its own browser with
  `npx playwright install chromium`.

## Local validation

```bash
npm ci
npx playwright install chromium
npm run check          # the full quality gate (contracts/quality-gate.md)
npm run dev            # http://localhost:4321 for manual checks
```

Expected: every step passes; `quality-report.json` exists with `"passed": true`.

## Manual scenarios

| # | Scenario | Expected | Spec |
|---|----------|----------|------|
| 1 | Open `/` at 360 px wide | Name, role line, headline, LinkedIn link visible without scrolling | US1, SC-001 |
| 2 | Press Tab once on any page | "Skip to content" appears; Enter moves focus to main | US4, FR-003 |
| 3 | Switch to NL on `/` | `/nl/` opens, interface fully Dutch; NL marked current | US3 |
| 4 | Set the OS to dark mode, reload | Dark from first paint, no flash | FR-005 |
| 5 | Open `/does-not-exist` on the deployed site | Bilingual not-found page with both home links | US5 |
| 6 | Click the build id in the footer | Opens the matching commit on GitHub | US6 |
| 7 | Open DevTools → Network on any page | Only same-origin requests, no cookies | FR-013, SC-008 |

## Pipeline validation

1. Open the pull request for this branch: the `quality-gate` check runs and posts a summary.
2. Push a commit that breaks a unit test: the check fails and the merge button is blocked
   (SC-006). Revert it.
3. Merge: the `deploy` job runs and the site is live at `https://sammieetje.github.io/` within
   10 minutes (SC-005); the footer shows the merge commit's short SHA.
