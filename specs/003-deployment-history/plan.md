# Implementation Plan: Deployment History

**Branch**: `003-deployment-history` | **Date**: 2026-10-10 | **Spec**: [spec.md](./spec.md)

## Summary

A bilingual release-log page (`/career/`, `/nl/loopbaan/`) built from typed career data: nine
releases plus education, newest first, each with a derived `vYYYY.MM` label, period, title,
organisation, summary, pattern tags and native-disclosure release notes; a legend explains the
four-phase pattern. The page joins the route registry (navigation, language switch, parity and
all shared per-page tests) and the home Key numbers card links to it. Sharing cards become
simpler, larger-text JPEGs.

## Technical Context

**Language/Version**: TypeScript 6.0 strict; Node 24 LTS in CI

**Primary Dependencies**: Astro 7.3; existing sharp, satori, resvg (no new dependencies)

**Storage**: typed modules `src/site/career.ts`, `src/site/patterns.ts`

**Testing**: Vitest (career data invariants, period/label formatting, meta image URL);
Playwright + axe (release log, disclosure by keyboard and without JS, legend, navigation, Dutch
page, sharing JPEG); shared per-page suites extended via `tests/e2e/pages.ts`

**Target Platform**: GitHub Pages | **Project Type**: static website

**Performance Goals / Constraints**: constitution budgets; zero client JS; WCAG 2.2 AA

**Scale/Scope**: 2 new pages, ~25 new interface strings, ~10 content entries × 2 languages

## Constitution Check

| Principle | Compliance | Status |
|-----------|-----------|--------|
| I. Right thing easy | adding a role = one data entry; ordering, labels, current marker derived and tested | Pass |
| II. Test-first | tasks.md orders tests first | Pass |
| III. Traceability | `data-spec="003:FR-xxx"`; `003:T###` comments | Pass |
| IV. Accessible | native disclosure; headings per release; axe both schemes; keyboard test | Pass |
| V. Fast and light | static HTML, no JS; LHCI on new pages automatically | Pass |
| VI. Private & secure | only approved public career content; no HR details | Pass |
| VII. Bilingual parity | content typed per locale; route in both languages; parity test | Pass |

## Project Structure

```text
src/site/career.ts, src/site/patterns.ts, src/site/period.ts      new
src/components/ReleaseLog.astro, PatternLegend.astro              new
src/pages/career.astro, src/pages/nl/loopbaan.astro               new
src/site/routes.ts, src/i18n/ui.ts                                + route, strings
src/components/KeyNumbers.astro                                   + link to history
src/site/og-image.ts, src/pages/og/[locale].jpg.ts                simpler card, JPEG (replaces .png)
src/site/meta.ts                                                  image URL .jpg
tests/unit/career.test.ts, period.test.ts; meta.test.ts           new / updated
tests/e2e/career.spec.ts; sharing.spec.ts; pages.ts               new / updated
specs/002-catalog-overview/quickstart.md                          record SC-004 (LinkedIn) result
```

## Complexity Tracking

None.
