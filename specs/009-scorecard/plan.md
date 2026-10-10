# Implementation Plan: Scorecard

**Branch**: `009-scorecard` | **Date**: 2026-10-10 | **Spec**: [spec.md](./spec.md)

## Summary

Split the pipeline into `checks`, three parallel `budgets` shards, a `report` job and an aggregate
`quality-gate`, restoring "live within ten minutes". The merged quality report (schema v2: scores,
JavaScript, test counts, timing) is deployed with the site at `/quality/report.json`. A bilingual
scorecard page renders it in the browser, shows specs shipped statically, and degrades honestly
without JavaScript or without a report.

## Technical Context

**Language/Version**: TypeScript 6.0 strict; Node 24 LTS in CI
**Primary Dependencies**: Astro 7.3, Lighthouse CI 0.15 (reused discovery), GitHub Actions
(`upload-artifact`/`download-artifact` pinned by SHA); no new packages
**Testing**: Vitest (sharding, report merge, specs shipped, workflow policy); Playwright + axe
(scorecard with a fixture report, unavailable and no-JS states, scripts rule, footer, Dutch)
**Performance Goals**: pipeline ≤ 10 min to live; budgets stage ≤ ~3 min
**Constraints**: required check name stays `quality-gate`; local `npm run check` unchanged in
behaviour; JavaScript only on playground and scorecard

## Constitution Check

| Principle | Compliance | Status |
|-----------|-----------|--------|
| I. Right thing easy | local check unchanged; CI runs the same scripts, sharded; policy test generalised | Pass |
| II. Test-first | tests before each change | Pass |
| III. Traceability | `009:` traces | Pass |
| IV. Accessible | table with headers and caption; status in text; no-JS state | Pass |
| V. Fast and light | inline script ≤ 2 KB; scripts allowed on two specified pages only (test) | Pass |
| VI. Private & secure | report contains only build metrics; `actions: read` only in `report` | Pass |
| VII. Bilingual parity | labels per locale | Pass |

## Project Structure

```text
.github/workflows/pipeline.yml                      restructured (checks, budgets×3, report, quality-gate, deploy)
lighthouserc.cjs                                    + shard blocklist
scripts/quality-report.ts                           v2: merge shards, test counts, timing
vitest.config.ts, playwright.config.ts              + JSON reporters to reports/
src/site/specs.ts                                   new: shipped specs at build time
src/components/ScorecardPage.astro                  new (+ inline module)
src/pages/scorecard.astro, src/pages/nl/scorecard.astro  new
src/components/SiteFooter.astro                     + scorecard link
src/site/routes.ts, src/i18n/ui.ts                  + route, strings
tests/unit/{shard,quality-report,specs,workflow-policy}.test.ts; tests/e2e/{scorecard,meta-privacy,footer,method}.spec.ts
```

## Complexity Tracking

| Addition | Why needed | Simpler alternative rejected because |
|----------|------------|--------------------------------------|
| Five jobs instead of two | parallel budgets to meet 001 SC-005 | one job grows ~30 s per page and already exceeds the target |
| Second page with a script | the report exists only after the build (clarified) | rebuilding with the report would deploy HTML that was not tested |
