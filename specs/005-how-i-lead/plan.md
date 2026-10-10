# Implementation Plan: How I Lead

**Branch**: `005-how-i-lead` | **Date**: 2026-10-10 | **Spec**: [spec.md](./spec.md)

## Summary

A bilingual manager README (`/how-i-lead/`, `/nl/zo-leid-ik/`) rendered from typed content as API
documentation: version line, testimonial (Chris Stapper), table of contents and eight endpoints
(values, expectations both ways, one-on-ones, contact, feedback, errors, known issues), ending in
a LinkedIn call to action. Joins the route registry; linked from the home identity card; error
handling links to the method page's assumption 2.

## Technical Context

**Language/Version**: TypeScript 6.0 strict; Node 24 LTS in CI
**Primary Dependencies**: Astro 7.3 (no new dependencies)
**Storage**: `src/site/readme.ts`
**Testing**: Vitest (content invariants, source rule proxies); Playwright + axe (structure,
anchors, links, Dutch); shared per-page suites via `tests/e2e/pages.ts`
**Target Platform**: GitHub Pages | **Project Type**: static website
**Constraints**: zero client JS; WCAG 2.2 AA (badges not colour-only); constitution budgets
**Scale/Scope**: 2 new pages, ~15 strings, ~35 content entries × 2 languages

## Constitution Check

| Principle | Compliance | Status |
|-----------|-----------|--------|
| I–V | same patterns as 003/004: typed content, tests first, `005:` traces, axe, no JS | Pass |
| VI. Private & secure | only clarified or published statements; no assessment content (SC-003) | Pass |
| VII. Bilingual parity | per-locale content; quote marked `lang="en"` on both pages | Pass |

## Project Structure

```text
src/site/readme.ts                                        new
src/components/ReadmePage.astro                           new
src/pages/how-i-lead.astro, src/pages/nl/zo-leid-ik.astro new
src/site/routes.ts, src/i18n/ui.ts                        + route, strings
src/components/EntityHeader.astro                         + "How I lead" link
src/components/MethodPage.astro                           + id="assumption-<n>"
tests/unit/readme.test.ts; tests/e2e/readme.spec.ts, pages.ts
```

## Complexity Tracking

None.
