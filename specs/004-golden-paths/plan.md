# Implementation Plan: Golden Paths

**Branch**: `004-golden-paths` | **Date**: 2026-10-10 | **Spec**: [spec.md](./spec.md)

## Summary

A bilingual method page (`/method/`, `/nl/methode/`) rendered from typed content: premise and
principle with an inline-SVG path diagram, two lever cards and the pragmatism rule, four
assumptions, the four phases from 003 each linked to the releases that prove them (stable
anchors added to the deployment history), compliance as a four-step platform property, and the
behavioural-science models as a "dependencies" list without statistics. The page joins the route
registry between Overview and Deployment history; the About card and the history legend link
to it.

## Technical Context

**Language/Version**: TypeScript 6.0 strict; Node 24 LTS in CI
**Primary Dependencies**: Astro 7.3 (no new dependencies)
**Storage**: `src/site/method.ts`; reuses `patterns.ts`, `career.ts`
**Testing**: Vitest (content invariants, no percentages, phase proofs); Playwright + axe
(sections, diagram accessibility in both schemes, anchors, links in/out, Dutch); shared per-page
suites via `tests/e2e/pages.ts`; link checker validates anchors (`--check-fragments`)
**Target Platform**: GitHub Pages | **Project Type**: static website
**Constraints**: zero client JS; WCAG 2.2 AA; constitution budgets
**Scale/Scope**: 2 new pages, ~20 strings, ~25 content entries × 2 languages

## Constitution Check

| Principle | Compliance | Status |
|-----------|-----------|--------|
| I. Right thing easy | proofs derived from career data; anchors checked by the existing link gate | Pass |
| II. Test-first | tasks order tests first | Pass |
| III. Traceability | `004:FR-xxx` attributes, `004:T###` comments | Pass |
| IV. Accessible | SVG with title/desc; headings per section; axe both schemes | Pass |
| V. Fast and light | inline SVG, no JS | Pass |
| VI. Private & secure | public positioning only | Pass |
| VII. Bilingual parity | typed per-locale content; route in both languages | Pass |

## Project Structure

```text
src/site/method.ts                                   new
src/components/MethodPage.astro, PathDiagram.astro   new
src/pages/method.astro, src/pages/nl/methode.astro   new
src/site/routes.ts, src/i18n/ui.ts                   + route (between overview and career), strings
src/components/ReleaseLog.astro                      + id="release-<id>", :target style
src/components/AboutCard.astro, PatternLegend.astro  + link to method
src/site/career.ts                                   ASE attribution corrected (research R4)
tests/unit/method.test.ts                            new
tests/e2e/method.spec.ts, pages.ts                   new / updated
specs/003-deployment-history/quickstart.md           record LinkedIn post-merge result
```

## Complexity Tracking

None.
