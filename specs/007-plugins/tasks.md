---

description: "Task list for 007 Plugins"
---

# Tasks: Plugins

**Input**: Design documents from `/specs/007-plugins/`

**Tests**: Required (constitution II). Test tasks precede their implementation and are seen
failing first. Code carries `007:T###` comments.

## Phase 1: Foundational

- [ ] T001 Write failing unit tests in `tests/unit/projects.test.ts`: exactly `profile-site`, `specdriven-app`, `mypool`; repo URLs of shape `https://github.com/SammieEtje/<name>`, unique; every URL belongs to the allowlist of own repositories; spec links only on spec-driven projects; texts per locale; lifecycle in the allowed set
- [ ] T002 Implement `src/site/projects.ts` (makes T001 pass)

## Phase 2: User Stories 1–2 — Cards and spec-driven markers (P1/P2) 🎯 MVP

- [ ] T003 Write failing e2e tests in `tests/e2e/plugins.spec.ts`: introduction (clarified framing); three cards in order with purpose, demonstrates, tech list, lifecycle, since-year, repository link; this site says "you're looking at it"; spec-driven markers with links on the site and the demo only; no `<img>` in the cards
- [ ] T004 Add the `plugins` route and strings; create `src/components/PluginsPage.astro` and `src/pages/plugins.astro` (makes T003 pass)

## Phase 3: User Story 3 — Findability and Dutch (P2)

- [ ] T005 Add `/plugins/` and `/nl/projecten/` to `tests/e2e/pages.ts`; add failing tests: navigation lists "Plugins — what I build" sixth with `aria-current`; language switch; Dutch page; update the navigation-order test
- [ ] T006 Create `src/pages/nl/projecten.astro` (makes T005 pass)

## Phase 4: Polish

- [ ] T007 [P] Update the README roadmap (006 live, 007 this PR)
- [ ] T008 Run `npm run check`; review screenshots (desktop light/dark, mobile NL, home fold with six sections); fix findings
- [ ] T009 Open the pull request, confirm `quality-gate` passes, record results in `quickstart.md`
