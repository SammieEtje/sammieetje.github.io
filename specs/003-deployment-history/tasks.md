---

description: "Task list for 003 Deployment History"
---

# Tasks: Deployment History

**Input**: Design documents from `/specs/003-deployment-history/`

**Tests**: Required (constitution II). Test tasks precede their implementation and are seen
failing first. Code carries `003:T###` comments.

## Phase 1: Foundational

- [ ] T001 [P] Write failing unit tests for period formatting and release labels (`v2016.10`; "Oct 2016 – Aug 2020" / "okt 2016 – aug 2020"; open end "present" / "heden") in `tests/unit/period.test.ts`
- [ ] T002 [P] Write failing unit tests for the career data invariants (nine roles + one education entry last; strictly descending start; no overlapping periods; exactly one open-ended role; every role has ≥ 1 known pattern tag; every text field in every locale; current-role text exactly as clarified) in `tests/unit/career.test.ts`
- [ ] T003 Implement `src/site/period.ts` (makes T001 pass)
- [ ] T004 Implement `src/site/patterns.ts` and `src/site/career.ts` with the clarified content in EN and NL (makes T002 pass)

## Phase 2: User Story 1 + 2 — Scan the track record, read the notes (P1) 🎯 MVP

- [ ] T005 [P] [US1] Write failing e2e tests in `tests/e2e/career.spec.ts`: `/career/` lists nine releases + education newest first, each with label, period, title, organisation, location and summary; exactly one "latest" marker on the first release; education last and distinct
- [ ] T006 [P] [US2] Add failing e2e tests to `tests/e2e/career.spec.ts`: release notes closed by default; keyboard Enter on a release's notes toggle opens and closes them with `aria-expanded`-equivalent state (`details[open]`); works with JavaScript disabled; each toggle has a unique accessible name
- [ ] T007 [US1] Add the `career` route and interface strings, create `src/components/ReleaseLog.astro` and `src/pages/career.astro` (makes T005–T006 pass for English)

## Phase 3: User Story 3 — See the pattern (P2)

- [ ] T008 [US3] Add failing e2e tests: legend names and explains four phases; every role release shows ≥ 1 tag whose text matches a legend name, to `tests/e2e/career.spec.ts`
- [ ] T009 [US3] Create `src/components/PatternLegend.astro` and render tags in `ReleaseLog.astro` (makes T008 pass)

## Phase 4: User Story 4 — Dutch, navigation, home link (P2)

- [ ] T010 [US4] Add `/career/` and `/nl/loopbaan/` to `tests/e2e/pages.ts` (shared suites: axe, metadata, privacy, footer, skip link, reflow) and add failing tests: navigation item with term + subtitle in both languages and `aria-current` on the history page; Key numbers card links to the history in the page language; language switch maps `/career/` ⇄ `/nl/loopbaan/`; Dutch page content, in `tests/e2e/career.spec.ts`
- [ ] T011 [US4] Create `src/pages/nl/loopbaan.astro`, add the history link to `src/components/KeyNumbers.astro` (makes T010 pass)

## Phase 5: User Story 5 — Sharper sharing card (P3)

- [ ] T012 [P] [US5] Update failing tests: `tests/unit/meta.test.ts` expects `/og/<locale>.jpg`; `tests/e2e/sharing.spec.ts` expects JPEG 1200 × 630 per language, each ≤ 125 KB (half of the 002 PNGs), no `/og/*.png` built
- [ ] T013 [US5] Simplify the Satori tree in `src/site/og-image.ts` (photo, name, headline ≥ 40 px), encode JPEG via sharp, replace `src/pages/og/[locale].png.ts` by `[locale].jpg.ts`, update `src/site/meta.ts` (makes T012 pass)

## Phase 6: Polish

- [ ] T014 [P] Record the 002 LinkedIn Post Inspector result (SC-004 pass, card soft after re-encoding) in `specs/002-catalog-overview/quickstart.md`
- [ ] T015 [P] Update the README roadmap (002 live, 003 this PR)
- [ ] T016 Run `npm run check`; review screenshots (desktop light/dark, mobile, both languages, a release opened); fix findings
- [ ] T017 Open the pull request, confirm `quality-gate` passes, record results in `quickstart.md`

## Dependencies

Phase 1 → Phase 2 → (Phase 3, Phase 4 in any order) → Phase 6. Phase 5 is independent of 1–4.
