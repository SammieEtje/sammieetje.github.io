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
2. Read the branch protection on `main` back through the API: `quality-gate` is a required
   check, enforced for administrators; while it has not succeeded the pull request's merge
   state is `BLOCKED` (SC-006).
3. Merge: the `deploy` job runs and the site is live at `https://sammieetje.github.io/` within
   10 minutes (SC-005); the footer shows the merge commit's short SHA.

## Validation results (2026-10-09)

| # | Result | Evidence |
|---|--------|----------|
| 1 | Pass | `shell.spec.ts` (360 px above the fold, no horizontal scroll); manual screenshot review |
| 2 | Pass | `a11y-behaviour.spec.ts` on every page |
| 3 | Pass | `i18n.spec.ts`; interface fully Dutch on `/nl/` |
| 4 | Pass | `a11y-behaviour.spec.ts` (computed background at first paint); axe in both schemes |
| 5 | Pending | Only verifiable on the deployed site; checked after merge |
| 6 | Pass | `footer.spec.ts`; links to the commit that was built |
| 7 | Pass | `meta-privacy.spec.ts` on every page: zero foreign requests, zero cookies, zero scripts |

Pipeline: `quality-gate` passed on pull request #1 (deploy correctly skipped). Branch protection on
`main` requires `quality-gate`, strict (up to date), enforced for administrators, no force
pushes; with the check pending, the pull request's merge state was `BLOCKED` (SC-006).
Lighthouse on every page: 100 / 100 / 100 / 100 with 0 bytes of JavaScript.
