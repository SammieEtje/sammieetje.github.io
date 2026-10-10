---

description: "Task list for 006 TechDocs"
---

# Tasks: TechDocs

**Tests**: Required (constitution II). Test tasks precede their implementation and are seen
failing first. Code carries `006:T###` comments.

## Phase 1: Foundational

- [ ] T001 Write failing unit tests in `tests/unit/articles.test.ts`: four pillars in order with names/intros per locale; ten articles with unique ids and URLs of shape `https://www.linkedin.com/pulse/<slug>`; dates valid; the elite-sports article dated 2026-03-09 (Amsterdam); minutes 1–30; series parts 1..5 complete; excerpts at most two sentences per locale; the regulated pillar has no articles
- [ ] T002 Implement `src/site/articles.ts` (makes T001 pass)

## Phase 2: User Stories 1–3 — Browse, read, follow the series (P1/P2) 🎯 MVP

- [ ] T003 Write failing e2e tests in `tests/e2e/writing.spec.ts`: four pillar sections with intros; ten article cards, each once, newest first per pillar; date in `<time>`, reading time, excerpt; title links to its URL with an accessible name containing "on LinkedIn" and `lang="en"`; regulated pillar shows "coming soon"; series cards show "part n of 5"
- [ ] T004 Add the `writing` route and strings; create `src/components/WritingPage.astro` and `src/pages/writing.astro` (makes T003 pass)

## Phase 3: User Story 4 and cross-links (P2)

- [ ] T005 Add `/writing/` and `/nl/schrijven/` to `tests/e2e/pages.ts`; add failing tests: navigation lists "TechDocs — what I write" last, current on its page; Dutch page with Dutch pillar names, excerpts and dates and English titles; language switch; method page shows four "Further reading" links to the clarified articles; update the 004/005 navigation-order test
- [ ] T006 Create `src/pages/nl/schrijven.astro`; add further-reading links in `src/components/MethodPage.astro` (makes T005 pass)

## Phase 4: Polish

- [ ] T007 [P] Update the README roadmap (005 live, 006 this PR)
- [ ] T008 Run `npm run check`; review screenshots (desktop light/dark, mobile NL, method further reading); fix findings
- [ ] T009 Open the pull request, confirm `quality-gate` passes, record results in `quickstart.md`
