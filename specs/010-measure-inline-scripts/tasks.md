---

description: "Task list for 010 Measure Inline Scripts"
---

# Tasks: Measure Inline Scripts

**Input**: Design documents from `/specs/010-measure-inline-scripts/`

**Tests**: Required (constitution II). Test tasks precede their implementation and are seen
failing first. Code carries `010:T###` comments.

## Phase 1: User Stories 1–2 — One exact measurement (P1) 🎯 MVP

- [x] T001 [P] Write failing unit tests in `tests/unit/script-size.test.ts`: executable embedded scripts are gzipped and summed; `type="module"`, `text/javascript`, no type count; `application/json` and `application/ld+json` do not; `src` scripts are not counted here; empty scripts count 0; a page without scripts is 0
- [x] T002 [P] Extend `tests/unit/quality-report.test.ts` with failing tests: `scriptBytes` is external + inline with a `scripts` breakdown; URL-to-file mapping (`/`, `/nl/x/`, `/404.html`); a page over 50 KB in total makes `passed` false and the CLI exit status non-zero; within budget exits zero
- [x] T003 [P] Extend `tests/unit/workflow-policy.test.ts` with a failing test: the `report` job always downloads the built site (not only on `main`); and assert `lighthouserc.cjs` no longer asserts `resource-summary:script:size`
- [x] T004 Implement `src/site/script-size.ts`; extend `scripts/quality-report.ts` (inline measurement from `dist`, totals, breakdown, exit status); remove the script-size assertion from `lighthouserc.cjs`; make the `report` job always download `dist` (makes T001–T003 pass)
- [x] T005 Replace the embedded-script budget check in `tests/e2e/meta-privacy.spec.ts` with an agreement test: for the playground and the scorecard, `scriptBytes(dist HTML)` equals a browser-side gzip of the page's executable scripts within 0.1 KB, and is greater than 0; the allowed-pages rule stays

## Phase 2: User Story 3 — Say what is counted (P3)

- [x] T006 Add a failing e2e test in `tests/e2e/scorecard.spec.ts` for the measurement note (both languages), then add the note to `src/components/ScorecardPage.astro` and the dictionaries

## Phase 3: Polish

- [x] T007 Run `npm run check`; confirm the local report shows inline bytes for the four scripted pages and 0 elsewhere; run the over-budget experiment from quickstart.md and revert it
- [ ] T008 Open the pull request, confirm `quality-gate` passes, record results; after merge verify the live scorecard (SC-001)
