# Implementation Plan: Playground

**Branch**: `008-playground` | **Date**: 2026-10-10 | **Spec**: [spec.md](./spec.md)

## Summary

A bilingual playground (`/playground/`, `/nl/speeltuin/`): a deterministic adoption model in one
TypeScript module, rendered at build time for the default scenario and re-run in the browser by a
small bundled script when the visitor toggles seven levers and a mandate. Chart and summary update
instantly; without JavaScript the default result and a note remain. The page explains the model,
names the Rabobank reference carefully and links to the source. Seventh navigation section;
linked from the method page.

## Technical Context

**Language/Version**: TypeScript 6.0 strict; Node 24 LTS in CI
**Primary Dependencies**: Astro 7.3 (bundled `<script>`); no new dependencies
**Storage**: none (stateless)
**Testing**: Vitest (model invariants incl. exhaustive monotonicity, chart paths, summaries);
Playwright + axe (interaction, timing, mandate, no-JS, scripts only here, Dutch, links)
**Performance Goals**: update < 100 ms; bundle < 5 KB expected (budget 50 KB)
**Constraints**: JavaScript only on the playground pages (constitution V); WCAG 2.2 AA

## Constitution Check

| Principle | Compliance | Status |
|-----------|-----------|--------|
| I | one model module serves build and browser; no duplication | Pass |
| II | model and page tested first | Pass |
| III | `008:` traces | Pass |
| IV | native controls, status region, pattern not colour-only, works without JS | Pass |
| V | JS scoped to this explicitly specified feature; budget asserted per page; other pages keep 0 scripts (test) | Pass |
| VI | no third-party requests; module is same-origin | Pass |
| VII | per-locale labels and summaries | Pass |

## Project Structure

```text
src/site/adoption-model.ts                                   new (shared by build and browser)
src/components/PlaygroundPage.astro                          new (+ client <script>)
src/pages/playground.astro, src/pages/nl/speeltuin.astro     new
src/site/routes.ts, src/i18n/ui.ts                           + route, strings
src/components/MethodPage.astro                              + "try it" link
tests/unit/adoption-model.test.ts; tests/e2e/playground.spec.ts; meta-privacy.spec.ts (scripts rule); pages.ts; method.spec.ts (nav order)
```

## Complexity Tracking

| Addition | Why needed | Simpler alternative rejected because |
|----------|------------|--------------------------------------|
| First client-side script | FR-004/FR-005: interaction is the feature | a static page cannot be "poked at"; a framework island would add kilobytes for no benefit |
