---

description: "Task list for 004 Golden Paths"
---

# Tasks: Golden Paths

**Input**: Design documents from `/specs/004-golden-paths/`

**Tests**: Required (constitution II). Test tasks precede their implementation and are seen
failing first. Code carries `004:T###` comments.

## Phase 1: Foundational

- [ ] T001 Write failing unit tests in `tests/unit/method.test.ts`: premise/principle/diagnosis per locale; exactly two levers (4 and 3 instruments); pragmatism rule; four assumptions in clarified order with assumption 3 "People are inherently lazy" and its subtitle; four compliance steps; six models with authors and year; no `%` in any method text; every phase from `patterns.ts` has ≥ 1 release in `career.ts`; ASE attribution names De Vries
- [ ] T002 Implement `src/site/method.ts`, correct the ASE attribution in `src/site/career.ts` (makes T001 pass)

## Phase 2: User Stories 1–3 — Premise, levers, assumptions (P1) 🎯 MVP

- [ ] T003 [US1] Write failing e2e tests in `tests/e2e/method.spec.ts`: `/method/` h1, principle and diagnosis first; diagram is an `img` with an accessible name and description in the page language, inside the first section, visible at 1280 × 800 together with the principle
- [ ] T004 [US2] [US3] Add failing e2e tests: two lever cards with their instruments and the pragmatism rule; four assumptions in order, each with an "in practice" line, assumption 3 with its subtitle
- [ ] T005 Add the `method` route (between overview and career) and strings; create `src/components/PathDiagram.astro`, `src/components/MethodPage.astro`, `src/pages/method.astro` (makes T003–T004 pass)

## Phase 3: User Story 4 — Phases, compliance, proof (P2)

- [ ] T006 [US4] Add failing e2e tests: each phase lists links to all releases tagged with it; following one lands on `/career/#release-<id>` with that release as `:target`; compliance section has four steps; release items in the deployment history carry `id="release-<id>"`
- [ ] T007 [US4] Add release anchors and `:target` styling to `src/components/ReleaseLog.astro`; render phases with proofs and the compliance steps in `MethodPage.astro` (makes T006 pass)

## Phase 4: User Story 5 — Dependencies (P3)

- [ ] T008 [US5] Add failing e2e tests: dependencies section lists six models, each with manifest id, name, authors and takeaway; the page text contains no `%`
- [ ] T009 [US5] Render the dependencies section in `MethodPage.astro` (makes T008 pass)

## Phase 5: User Story 6 — Findability and Dutch (P2)

- [ ] T010 [US6] Add `/method/` and `/nl/methode/` to `tests/e2e/pages.ts`; add failing tests: navigation order Overview, Golden paths, Deployment history with `aria-current` on the method page; About card and history legend link to the method in the page language; language switch `/method/` ⇄ `/nl/methode/`; Dutch content and Dutch release links (`/nl/loopbaan/#release-…`)
- [ ] T011 [US6] Create `src/pages/nl/methode.astro`; add method links to `AboutCard.astro` and `PatternLegend.astro` (makes T010 pass)

## Phase 6: Polish

- [ ] T012 [P] Record the 003 LinkedIn post-merge result in `specs/003-deployment-history/quickstart.md`; update the README roadmap (003 live, 004 this PR)
- [ ] T013 Run `npm run check`; review screenshots (method page desktop light/dark, mobile NL, diagram, a release reached via its anchor); fix findings
- [ ] T014 Open the pull request, confirm `quality-gate` passes, record results in `quickstart.md`

## Dependencies

Phase 1 → Phase 2 → (Phases 3, 4, 5 in any order) → Phase 6.
