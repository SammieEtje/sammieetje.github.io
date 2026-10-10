# Implementation Plan: TechDocs

**Branch**: `006-techdocs` | **Date**: 2026-10-10 | **Spec**: [spec.md](./spec.md)

## Summary

A bilingual TechDocs page (`/writing/`, `/nl/schrijven/`) rendered from typed article data: four
pillar sections (one "coming soon"), ten LinkedIn articles with Amsterdam dates, reading times,
series markers and fresh excerpts; title links open LinkedIn. The method page gains four
"Further reading" links. Joins the navigation as "TechDocs".

## Technical Context

**Language/Version**: TypeScript 6.0 strict; Node 24 LTS in CI
**Primary Dependencies**: Astro 7.3 (no new dependencies)
**Storage**: `src/site/articles.ts`
**Testing**: Vitest (data invariants); Playwright + axe (grouping, order, links, series, Dutch,
method cross-links); shared per-page suites
**Constraints**: zero client JS; constitution budgets; external links not crawled by the gate

## Constitution Check

| Principle | Compliance | Status |
|-----------|-----------|--------|
| I–V | same patterns as 003–005 | Pass |
| VI | only public article metadata; excerpts original | Pass |
| VII | per-locale pillars and excerpts; English titles marked `lang="en"` | Pass |

## Project Structure

```text
src/site/articles.ts, src/components/WritingPage.astro            new
src/pages/writing.astro, src/pages/nl/schrijven.astro             new
src/site/routes.ts, src/i18n/ui.ts                                + route, strings
src/components/MethodPage.astro                                   + further reading
tests/unit/articles.test.ts; tests/e2e/writing.spec.ts, pages.ts; method.spec.ts (nav order)
```

## Complexity Tracking

None.
