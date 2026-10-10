---

description: "Task list for 009 Scorecard"
---

# Tasks: Scorecard

**Input**: Design documents from `/specs/009-scorecard/`

**Tests**: Required (constitution II). Test tasks precede their implementation and are seen
failing first. Code carries `009:T###` comments.

## Phase 1: User Story 1 — Live within ten minutes again (P1)

- [ ] T001 [P] Write failing unit tests in `tests/unit/shard.test.ts`: every built page belongs to exactly one of three shards; shards differ in size by at most one; without `LHCI_SHARD` nothing is blocked; blocklist entries are site-relative paths
- [ ] T002 [P] Extend `tests/unit/quality-report.test.ts` with failing tests: schema v2; merging several shard manifests; JSON paths resolved relative to each manifest; test counts from Vitest and Playwright JSON; duration from run start; nulls when inputs are missing
- [ ] T003 [P] Rewrite `tests/unit/workflow-policy.test.ts` (failing): jobs `checks`, `budgets` (3-shard matrix), `report`, `quality-gate`, `deploy`; `quality-gate` runs `if: always()`, needs all and fails unless every result is success; deploy needs `quality-gate`; the `npm run` steps across `checks` then `budgets` equal `npm run check`; `report` alone has `actions: read`; pinned actions and empty top-level permissions still hold
- [ ] T004 Implement the shard blocklist in `lighthouserc.cjs`, report v2 in `scripts/quality-report.ts`, JSON reporters in `vitest.config.ts` and `playwright.config.ts` (`reports/`, ignored) (makes T001–T002 pass)
- [ ] T005 Restructure `.github/workflows/pipeline.yml` per contracts/pipeline.md (makes T003 pass)

## Phase 2: User Stories 2–3 — The scorecard, honestly (P1/P2)

- [ ] T006 [P] Write failing unit tests in `tests/unit/specs.test.ts` for shipped-spec counting (all tasks checked = shipped; any open task = not shipped; non-spec folders ignored)
- [ ] T007 [P] Write failing e2e tests in `tests/e2e/scorecard.spec.ts` with a fixture report served via request interception: verdict, commit link, measurement time, tiles (unit, e2e, duration vs 10 minutes), specs shipped, per-page table with "within budget"/"over budget" text, an over-budget fixture shows "over budget"; a 404 shows "no measurement available yet"; without JavaScript the explanation, specs shipped and raw-report link show and no numbers appear; scripts allowed on playground and scorecard only
- [ ] T008 Implement `src/site/specs.ts`, `src/components/ScorecardPage.astro` with its inline module, the route, strings and `src/pages/scorecard.astro`; skip `/quality/report.json` in the link check (makes T006–T007 pass)

## Phase 3: User Story 4 — Findability and Dutch (P2)

- [ ] T009 Add `/scorecard/` and `/nl/scorecard/` to `tests/e2e/pages.ts`; add failing tests: navigation item "Scorecard — how it's measured" eighth; footer "Scorecard" link next to the build id in both languages; Dutch page; update the navigation-order test
- [ ] T010 Create `src/pages/nl/scorecard.astro`; add the footer link (makes T009 pass)

## Phase 4: Polish

- [ ] T011 [P] Update the README (pipeline section, roadmap 008 live and 009 this PR) and supersede the pipeline table in `specs/001-platform-foundation/contracts/quality-gate.md` with a pointer to 009
- [ ] T012 Run `npm run check` and `LHCI_SHARD=1/3 npm run budgets`; review screenshots with a real local report; fix findings
- [ ] T013 Open the pull request, confirm the new jobs and the aggregate `quality-gate` pass, record timings; after merge verify SC-001 on `main`
