---

description: "Task list for 001 Platform Foundation"
---

# Tasks: Platform Foundation

**Input**: Design documents from `/specs/001-platform-foundation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required by the constitution (II. Test-First). In every phase, test tasks come first
and MUST be seen failing before the implementation task that makes them pass.

**Organization**: Tasks are grouped by user story. US2 (pipeline, P1) is delivered before US1
(identity, P1) so that every later change already passes through the gate.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US6)
- Code that implements a task carries a `001:T###` comment

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialisation and the local golden path

- [x] T001 Initialise `package.json` (name, `"type": "module"`, `engines.node >=24`, scripts per contracts/quality-gate.md), `.nvmrc` (`24`) and install pinned dev dependencies from research.md R13
- [x] T002 Create `astro.config.mjs` (static output, `site: https://sammieetje.github.io`, i18n `en`/`nl` without default prefix, sitemap) and `tsconfig.json` extending `astro/tsconfigs/strictest`
- [x] T003 [P] Configure Prettier in `.prettierrc.json` and `.prettierignore` (with `prettier-plugin-astro`)
- [x] T004 [P] Configure ESLint flat config in `eslint.config.js` (typescript-eslint + eslint-plugin-astro)
- [x] T005 [P] Configure Vitest in `vitest.config.ts` (`tests/unit/**/*.test.ts`) and Playwright in `playwright.config.ts` (Chromium, `webServer` = `astro preview` on port 4321, `tests/e2e`)
- [x] T006 Add a minimal `src/pages/index.astro` placeholder so `npm run build` succeeds, and verify `format:check`, `lint`, `typecheck` and `build` pass

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Dictionaries, route registry, metadata and traceability that every story depends on

- [x] T007 [P] Write failing unit tests for dictionary parity (equal key sets, non-empty values) and `t()` lookup in `tests/unit/i18n.test.ts`
- [x] T008 [P] Write failing unit tests for the route registry (each route has a path per locale; counterpart path lookup; navigation lists only registry routes) in `tests/unit/routes.test.ts`
- [x] T009 [P] Write failing unit tests for the PageMeta builder (unique title, description length 50–160, canonical, hreflang en/nl/x-default, og fields) in `tests/unit/meta.test.ts`
- [x] T010 [P] Write failing unit tests for the trace check (accepts existing FR/SC/US/T IDs, rejects unknown IDs and unknown feature folders) in `tests/unit/trace-check.test.ts`
- [x] T011 Implement typed dictionaries and helpers in `src/i18n/ui.ts` and `src/i18n/utils.ts` (makes T007 pass)
- [x] T012 Implement the route registry in `src/site/routes.ts` (makes T008 pass)
- [x] T013 Implement the PageMeta builder in `src/site/meta.ts` (makes T009 pass)
- [x] T014 Implement `scripts/trace-check.ts` as a pure `checkTraces()` plus CLI entry, wired to `npm run trace` (makes T010 pass)

**Checkpoint**: shared modules tested; user-story work can begin

---

## Phase 3: User Story 2 — Changes reach production only through the gate (Priority: P1)

**Goal**: every PR and push runs the full gate; only gated builds on `main` deploy to Pages

**Independent Test**: a PR with a failing check cannot merge; a merged passing change goes live

### Tests for User Story 2

- [x] T015 [P] [US2] Write failing unit tests for the workflow policy (top-level `permissions: {}`, each job declares permissions, every external `uses:` pinned to a 40-char SHA, deploy job `needs` the gate and only runs on push to `main`) in `tests/unit/workflow-policy.test.ts`
- [x] T016 [P] [US2] Write failing unit tests for the quality report builder (median scores per page, `passed` false when any budget is missed, schema v1 per data-model.md) in `tests/unit/quality-report.test.ts`
- [x] T017 [P] [US2] Write a failing unit test asserting `.github/dependabot.yml` covers `npm` and `github-actions` weekly in `tests/unit/dependabot.test.ts`

### Implementation for User Story 2

- [x] T018 [US2] Create `.github/workflows/pipeline.yml` with the `quality-gate` and `deploy` jobs per contracts/quality-gate.md and research.md R10 (makes T015 pass)
- [x] T019 [US2] Create `lighthouserc.cjs` (static dist, all HTML pages, mobile, 3 runs, assertions from constitution V, filesystem upload to `.lighthouseci/`) and `scripts/quality-report.ts` writing `quality-report.json` and a Markdown step summary (makes T016 pass)
- [x] T020 [P] [US2] Create `.github/dependabot.yml` for `npm` and `github-actions`, weekly, grouped (makes T017 pass)
- [x] T021 [US2] Wire `npm run check` to chain `format:check → lint → typecheck → test:unit → trace → build → test:e2e → links → budgets`, and verify it passes locally

**Checkpoint**: the gate runs locally exactly as in CI

---

## Phase 4: User Story 1 — Recognise who this is (Priority: P1) 🎯 MVP

**Goal**: an English home page in the portal layout with name, role line, headline and LinkedIn

**Independent Test**: open `/` at 360 px and at desktop width; identity visible without scrolling

### Tests for User Story 1

- [x] T022 [P] [US1] Write failing e2e tests for the home identity block (h1 name, current role, positioning, headline, LinkedIn link with accessible name) in `tests/e2e/home.spec.ts`
- [x] T023 [P] [US1] Write failing e2e tests for the portal shell (banner, primary nav with term + subtitle and `aria-current="page"`, single main, contentinfo) and 360 px above-the-fold + no horizontal scroll in `tests/e2e/shell.spec.ts`
- [x] T024 [P] [US1] Write failing e2e tests for page metadata (title, description, canonical, hreflang, og tags) and the privacy guarantee (no `<script>`, only same-origin requests, zero cookies) in `tests/e2e/meta-privacy.spec.ts`

### Implementation for User Story 1

- [x] T025 [P] [US1] Create design tokens with `light-dark()` and base styles in `src/styles/tokens.css` and `src/styles/global.css` (own identity, self-hosted Inter + JetBrains Mono)
- [x] T026 [P] [US1] Create the profile data in `src/site/profile.ts`
- [x] T027 [US1] Create `src/layouts/PortalLayout.astro` with `SiteHeader`, `PrimaryNav`, `SiteFooter` components in `src/components/` and head metadata from `src/site/meta.ts`
- [x] T028 [US1] Create `src/components/EntityHeader.astro` and the English home page `src/pages/index.astro` (makes T022–T024 pass)

**Checkpoint**: MVP — English identity page, gated and deployable

---

## Phase 5: User Story 3 — Read the site in Dutch (Priority: P2)

**Goal**: full Dutch counterpart with a working language switch

**Independent Test**: switch EN ⇄ NL on the home page; all interface text changes language

### Tests for User Story 3

- [x] T029 [P] [US3] Write failing e2e tests for the language switch (links to counterpart, `aria-current` on the current language, Dutch interface text on `/nl/`, `lang="nl"`) in `tests/e2e/i18n.spec.ts`
- [x] T030 [P] [US3] Write a failing build-parity test (every English HTML page in `dist/` has a Dutch counterpart and vice versa, `404.html` excepted) in `tests/e2e/parity.spec.ts`

### Implementation for User Story 3

- [x] T031 [US3] Create `src/components/LanguageSwitch.astro` and add it to `SiteHeader`
- [x] T032 [US3] Create `src/pages/nl/index.astro` and complete the Dutch dictionary (makes T029–T030 pass)

---

## Phase 6: User Story 4 — Use the site in any way that suits the visitor (Priority: P2)

**Goal**: keyboard, screen reader and dark-mode users are fully served

**Independent Test**: keyboard-only navigation and zero axe violations in both schemes

### Tests for User Story 4

- [x] T033 [P] [US4] Write failing e2e tests: first Tab shows the skip link and Enter focuses `main`; dark scheme applies on first paint (computed background differs from light); 320 px and 200% zoom reflow without horizontal scroll; JavaScript disabled still renders all content, in `tests/e2e/a11y-behaviour.spec.ts`
- [x] T034 [P] [US4] Write failing axe scans for every page × both languages × both colour schemes in `tests/e2e/axe.spec.ts`

### Implementation for User Story 4

- [x] T035 [US4] Create `src/components/SkipLink.astro`, add it to the layout, add focus styles and `prefers-reduced-motion` rules (makes T033–T034 pass)

---

## Phase 7: User Story 5 — Recover from a wrong address (Priority: P3)

**Goal**: a bilingual not-found page

**Independent Test**: open `/404.html`; both languages and both home links present

- [x] T036 [US5] Write failing e2e tests for `/404.html` (English and Dutch sections with `lang`, links to `/` and `/nl/`, portal layout) in `tests/e2e/not-found.spec.ts`
- [x] T037 [US5] Create `src/pages/404.astro` (makes T036 pass)

---

## Phase 8: User Story 6 — See how this site is built (Priority: P3)

**Goal**: footer shows the live build identity and links to source and specs

**Independent Test**: footer build link points to the commit of the deployed version

- [x] T038 [P] [US6] Write failing unit tests for `src/site/build-info.ts` (uses `GITHUB_SHA`, falls back to git, then `local`; short SHA = 7 chars; URLs) in `tests/unit/build-info.test.ts`
- [x] T039 [P] [US6] Write failing e2e tests for the footer links (build, source, specs) in `tests/e2e/footer.spec.ts`
- [x] T040 [US6] Implement `src/site/build-info.ts` and render it in `src/components/SiteFooter.astro` (makes T038–T039 pass)

---

## Phase 9: Polish & Cross-Cutting Concerns

- [x] T041 [P] Add `public/robots.txt` referencing the sitemap and a favicon in `public/`
- [x] T042 [P] Rewrite `README.md`: purpose, the golden path (`npm ci && npm run check`), pipeline, Spec Kit workflow, and the roadmap of upcoming specs
- [x] T043 Run `npm run trace` and the full `npm run check`; fix any finding
- [x] T044 Enable GitHub Pages with source "GitHub Actions" for the repository
- [x] T045 Open the pull request, confirm the `quality-gate` check passes in CI, then apply branch protection on `main` requiring `quality-gate`, an up-to-date branch, and enforcement for administrators (FR-015)
- [x] T046 Verify SC-006 without extra commits or pull requests: read the protection rule back through the API, and confirm the pull request reports a blocked merge state while `quality-gate` has not succeeded
- [x] T047 Run the quickstart.md manual scenarios that can be run before merge and record the results in `specs/001-platform-foundation/quickstart.md`

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → **Foundational (Phase 2)** → **US2 (Phase 3)** → **US1 (Phase 4)** →
  **US3, US4, US5, US6 (Phases 5–8, any order)** → **Polish (Phase 9)**.
- US1 depends on Phase 2 modules; US3 extends US1's layout; US4 and US6 extend the layout too.
- Within each phase: tests first (seen failing), then implementation.
- T045 needs the branch pushed; T046 needs T045's protection rule.

## Parallel Example: Phase 2

```text
T007 tests/unit/i18n.test.ts
T008 tests/unit/routes.test.ts
T009 tests/unit/meta.test.ts
T010 tests/unit/trace-check.test.ts
```

## Implementation Strategy

1. Phases 1–3: the golden path and the gate exist before any content.
2. Phase 4: MVP — English identity page through the gate.
3. Phases 5–8: Dutch, accessibility behaviour, 404, build identity.
4. Phase 9: documentation, Pages, branch protection, proof that the gate blocks.
