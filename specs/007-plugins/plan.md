# Implementation Plan: Plugins

**Branch**: `007-plugins` | **Date**: 2026-10-10 | **Spec**: [spec.md](./spec.md)

## Summary

A bilingual Plugins page (`/plugins/`, `/nl/projecten/`) rendered from curated typed data: an
introduction in the clarified framing and three plugin cards (this site, `my-specdriven-app`,
`myPool`) with purpose, what each demonstrates, technologies, lifecycle and links; spec-driven
projects link to their specifications. Sixth navigation section.

## Technical Context

**Language/Version**: TypeScript 6.0 strict; Node 24 LTS in CI
**Primary Dependencies**: Astro 7.3 (no new dependencies)
**Storage**: `src/site/projects.ts`
**Testing**: Vitest (selection, URL shape, no family/fork URLs); Playwright + axe (cards, markers,
navigation, Dutch); shared per-page suites
**Constraints**: zero client JS; no third-party images (no CI badges); constitution budgets

## Constitution Check

| Principle | Compliance | Status |
|-----------|-----------|--------|
| I–V | same patterns as 003–006 | Pass |
| VI | no family names or URLs (unit-tested); no third-party badges | Pass |
| VII | per-locale texts | Pass |

## Project Structure

```text
src/site/projects.ts, src/components/PluginsPage.astro      new
src/pages/plugins.astro, src/pages/nl/projecten.astro       new
src/site/routes.ts, src/i18n/ui.ts                          + route, strings
tests/unit/projects.test.ts; tests/e2e/plugins.spec.ts, pages.ts; method.spec.ts (nav order)
```

## Complexity Tracking

None.
