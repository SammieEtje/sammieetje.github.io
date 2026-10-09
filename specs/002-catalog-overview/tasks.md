---

description: "Task list for 002 Catalog Overview"
---

# Tasks: Catalog Overview

**Input**: Design documents from `/specs/002-catalog-overview/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required by the constitution (II). Test tasks come first in every phase and MUST be
seen failing before the implementation task that makes them pass.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1–US5 from spec.md
- Code that implements a task carries a `002:T###` comment

---

## Phase 1: Setup

- [ ] T001 Add build-time devDependencies `satori@0.47.1`, `@resvg/resvg-js@2.6.2`, `@fontsource/inter@5.3.0` (exact versions)
- [ ] T002 Create `src/assets/profile.jpg`: crop the provided photo to 490 × 490 at offset (45, 72) with sharp, JPEG quality 90, no metadata

---

## Phase 2: Foundational

- [ ] T003 [P] Write failing unit tests for locale number formatting (`10,000`/`10.000`, `5×`, `2.5×`/`2,5×`) in `tests/unit/format.test.ts`
- [ ] T004 [P] Write failing tests for the image metadata guarantee: every image in `src/assets/` has no EXIF, XMP or IPTC in `tests/unit/image-metadata.test.ts`, and every raster image in the built `dist/` (which must contain at least one) has none in `tests/e2e/image-metadata.spec.ts` (runs after the build)
- [ ] T005 Implement `src/site/format.ts` (makes T003 pass)
- [ ] T006 Create `src/components/PortalCard.astro` (card shell: `section` with `h2` title, optional mono kind label) and add new dictionary keys for card titles, photo alt and sharing alt in `src/i18n/ui.ts`

---

## Phase 3: User Story 1 — Put a face to the name (P1) 🎯 MVP

- [ ] T007 [P] [US1] Write failing e2e tests in `tests/e2e/photo.spec.ts`: picture with AVIF and WebP sources, `img` with alt per language, width/height attributes, srcset covering ≥ 2× displayed size; zero layout shift after load; photo responses ≤ 60 KB at device scale factor 2
- [ ] T008 [US1] Render the photo with `<Picture>` inside `src/components/EntityHeader.astro`, beside the name, as a rounded square (makes T007 pass; T004 passes on `dist/`)

---

## Phase 4: User Story 2 — See the proof (P1)

- [ ] T009 [P] [US2] Write failing unit tests for `src/site/key-numbers.ts` (exactly three entries in the clarified order; non-empty label and context per locale; each context has a year range) in `tests/unit/key-numbers.test.ts`
- [ ] T010 [P] [US2] Write failing e2e tests for the Key numbers card on `/` and `/nl/` (title, three tiles, formatted values, labels, contexts; value and label in one paragraph) in `tests/e2e/overview.spec.ts`
- [ ] T011 [US2] Implement `src/site/key-numbers.ts` and `src/components/KeyNumbers.astro` (makes T009–T010 pass)

---

## Phase 5: User Story 3 — Understand the person (P2)

- [ ] T012 [US3] Add failing e2e tests for the About card (title, exact clarified text per language) to `tests/e2e/overview.spec.ts`
- [ ] T013 [US3] Add the About text to the dictionaries and create `src/components/AboutCard.astro` (makes T012 pass)

---

## Phase 6: User Story 4 — Find him elsewhere (P2)

- [ ] T014 [US4] Add failing e2e tests for the Links card (LinkedIn and GitHub URLs, accessible names, `rel` contains `me`) to `tests/e2e/overview.spec.ts`
- [ ] T015 [US4] Add profile links to `src/site/profile.ts` and create `src/components/LinksCard.astro` (makes T014 pass)

---

## Phase 7: Overview layout (FR-009, SC-001)

- [ ] T016 Add failing e2e tests: cards in the order identity, key numbers, About, Links; single column at 360 px; at 1280 × 800 photo, name, headline and first key number visible without scrolling; 320 px no horizontal scroll still holds, to `tests/e2e/overview.spec.ts`
- [ ] T017 Compose the overview grid in `src/components/Overview.astro` and use it in `src/pages/index.astro` and `src/pages/nl/index.astro` (makes T016 pass)

---

## Phase 8: User Story 5 — Share a link that looks right (P2)

- [ ] T018 [P] [US5] Extend `tests/unit/meta.test.ts` with failing tests for `image` (absolute `/og/<locale>.png`, 1200 × 630, alt per locale)
- [ ] T019 [P] [US5] Write failing e2e tests in `tests/e2e/sharing.spec.ts`: og:image / width / height / alt and twitter tags on every page; `/og/en.png` and `/og/nl.png` respond as PNG of 1200 × 630 and differ from each other; no sharing image is committed under `public/` (FR-011)
- [ ] T020 [US5] Extend `src/site/meta.ts` and `src/layouts/PortalLayout.astro` with image tags (makes T018 pass)
- [ ] T021 [US5] Implement `src/site/og-image.ts` (Satori tree + resvg render) and the endpoint `src/pages/og/[locale].png.ts` (makes T019 pass)

---

## Phase 9: Polish & Cross-Cutting

- [ ] T022 [P] Extend `tests/unit/dependabot.test.ts` with a failing test for the ignore rules, then add them to `.github/dependabot.yml` (001:FR-021 follow-up, research R8)
- [ ] T023 [P] Update the README roadmap (001 done, 002 this PR)
- [ ] T024 Run `npm run check`; review screenshots in light, dark and mobile; fix findings
- [ ] T025 Open the pull request, confirm `quality-gate` passes, record results in `quickstart.md`

---

## Dependencies & Execution Order

Setup → Foundational → US1 → US2 → US3 → US4 → Layout → US5 → Polish. US3 and US4 are
independent of each other; the layout phase needs US1–US4; US5 only needs the photo (T002).
