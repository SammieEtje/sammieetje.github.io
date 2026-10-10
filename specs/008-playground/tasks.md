---

description: "Task list for 008 Playground"
---

# Tasks: Playground

**Input**: Design documents from `/specs/008-playground/`

**Tests**: Required (constitution II). Test tasks precede their implementation and are seen
failing first. Code carries `008:T###` comments.

## Phase 1: Model

- [x] T001 Write failing unit tests in `tests/unit/adoption-model.test.ts`: 52 weeks; deterministic (same input, same output); bounds 0–1; exhaustive monotonicity over all 256 scenarios (adding any lever never lowers final adoption); SC-003 (all levers → ≥ 80% and 0% reluctant; no levers + mandate → reluctant ≥ 50%); default (no levers, no mandate) stays below 10%; `chartPaths` returns valid SVG path data within the viewBox; `summarize` per locale for stalled, voluntary and mandated outcomes; lever ids align with the method page's instruments
- [x] T002 Implement `src/site/adoption-model.ts` (makes T001 pass)

## Phase 2: User Stories 1–2 — Try the levers, mandate vs golden path (P1) 🎯 MVP

- [x] T003 Write failing e2e tests in `tests/e2e/playground.spec.ts`: controls (7 levers in two labelled groups, mandate) enabled with JavaScript; default summary and curve; toggling a lever changes the adoption path and summary within 100 ms; summary is a polite status region; all levers → summary says everyone chose it; no levers + mandate → summary reports a reluctant share and the reluctant band is non-empty
- [x] T004 Add the `playground` route and strings; create `src/components/PlaygroundPage.astro` with the client script and `src/pages/playground.astro` (makes T003 pass)

## Phase 3: User Stories 3–4 — Explanation, no-JS, findability, Dutch (P2)

- [x] T005 Add `/playground/` and `/nl/speeltuin/` to `tests/e2e/pages.ts`; narrow the 001 "no scripts" test to every page except the playground and assert a single same-origin module there; add failing tests: explanation section (rules, illustrative, Rabobank reference, source link); without JavaScript the default curve and summary render, controls are disabled and the note is shown; navigation lists "Playground — try it" seventh; method premise links to the playground; language switch; Dutch page and Dutch summary
- [x] T006 Create `src/pages/nl/speeltuin.astro`; add the explanation section and the method-page link (makes T005 pass)

## Phase 4: Polish

- [x] T007 Verify the home fold on a 360 px phone with seven navigation sections (001 SC-001); tighten the navigation if needed
- [x] T008 [P] Update the README roadmap (007 live, 008 this PR) and the stack note (first client-side script)
- [x] T009 Run `npm run check`; review screenshots (desktop light/dark, mobile NL, mandate scenario); fix findings
- [x] T010 Open the pull request, confirm `quality-gate` passes, record results in `quickstart.md`
