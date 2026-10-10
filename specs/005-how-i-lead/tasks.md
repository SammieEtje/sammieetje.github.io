---

description: "Task list for 005 How I Lead"
---

# Tasks: How I Lead

**Input**: Design documents from `/specs/005-how-i-lead/`

**Tests**: Required (constitution II). Test tasks precede their implementation and are seen
failing first. Code carries `005:T###` comments.

## Phase 1: Foundational

- [x] T001 Write failing unit tests in `tests/unit/readme.test.ts`: valid last-updated date and intro per locale; exactly the eight endpoints in order with unique paths and written-out methods; every text per locale; clarified one-on-one rhythm (monthly, one hour, ad hoc); the two clarified known issues with workarounds; expectations of me (3) and of you (4); testimonial by Chris Stapper with a LinkedIn URL without query string
- [x] T002 Implement `src/site/readme.ts` (makes T001 pass)

## Phase 2: User Stories 1–2 — What it is like, day to day (P1) 🎯 MVP

- [x] T003 [US1] [US2] Write failing e2e tests in `tests/e2e/readme.spec.ts`: h1, intro and version line with `<time>`; table of contents lists eight endpoints and each link lands on its section; every section heading has a written-out method, a path and a title; one-on-ones, contact and feedback contain the clarified practices; testimonial quote with `lang="en"`, author link
- [x] T004 Add the `how-i-lead` route and strings; create `src/components/ReadmePage.astro` and `src/pages/how-i-lead.astro` (makes T003 pass)

## Phase 3: User Stories 3–4 — Known issues, error handling (P2)

- [x] T005 [US3] [US4] Add failing e2e tests: known issues as description/workaround pairs; error handling links to `/method/#assumption-2`, which exists and contains "Learning requires room to fail safely"
- [x] T006 Render known issues and errors in `ReadmePage.astro`; add `id="assumption-<n>"` in `src/components/MethodPage.astro` (makes T005 pass)

## Phase 4: User Story 5 — Contact, findability, Dutch (P2)

- [x] T007 [US5] Add `/how-i-lead/` and `/nl/zo-leid-ik/` to `tests/e2e/pages.ts`; add failing tests: LinkedIn call to action at the end; navigation item "API docs — how I lead" / "API-docs — zo leid ik" with `aria-current`; home identity card links to the page per language; language switch; Dutch content with the English quote still marked `lang="en"`
- [x] T008 Create `src/pages/nl/zo-leid-ik.astro`; add the link in `src/components/EntityHeader.astro` (makes T007 pass)

## Phase 5: Polish

- [x] T009 [P] Update the README roadmap (004 live, 005 this PR)
- [x] T010 Run `npm run check`; review screenshots (desktop light/dark, mobile NL, home identity card); fix findings
- [x] T011 Open the pull request, confirm `quality-gate` passes, record results in `quickstart.md`

## Dependencies

Phase 1 → Phase 2 → (Phases 3, 4) → Phase 5.
