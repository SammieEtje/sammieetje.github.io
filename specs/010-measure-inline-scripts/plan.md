# Implementation Plan: Measure Inline Scripts

**Branch**: `010-measure-inline-scripts` | **Date**: 2026-10-10 | **Spec**: [spec.md](./spec.md)

## Summary

Make "JavaScript per page" one measurement: a shared function gzips executable embedded script
from the built HTML; the quality report adds it to Lighthouse's separate-file count, publishes the
total with a breakdown, and becomes the JavaScript gate (exits non-zero over 50 KB). Lighthouse's
own script-size assertion and the 008 embedded-script test are replaced. The scorecard explains
the measure in one line.

## Technical Context

**Language/Version**: TypeScript 6.0 strict; Node 24 LTS in CI
**Primary Dependencies**: none new (Node `zlib`)
**Testing**: Vitest (measurement rules, report totals and exit status); Playwright (agreement with
a browser-side measurement; scorecard note)
**Constraints**: one definition (SC-002); local and CI identical (FR-004)

## Constitution Check

| Principle | Compliance | Status |
|-----------|-----------|--------|
| I. Right thing easy | removes a duplicated rule; one function used by gate, report and test | Pass |
| II. Test-first | tests before code | Pass |
| III. Traceability | `010:` traces | Pass |
| IV–VII | no UI change beyond one translated sentence | Pass |

## Project Structure

```text
src/site/script-size.ts                  new: scriptBytes(html)
scripts/quality-report.ts                inline measurement, totals, breakdown, exit status
lighthouserc.cjs                         remove the script-size assertion
.github/workflows/pipeline.yml           report job always downloads dist
src/components/ScorecardPage.astro, src/i18n/ui.ts   + measurement note
tests/unit/script-size.test.ts, quality-report.test.ts, workflow-policy.test.ts
tests/e2e/meta-privacy.spec.ts (budget test → agreement test), scorecard.spec.ts (note)
```

## Complexity Tracking

None.
