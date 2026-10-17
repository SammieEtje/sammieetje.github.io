---

description: "Task list for 013 Weekly Article Pipeline"
---

# Tasks: Weekly Article Pipeline

**Input**: Design documents from `/specs/013-weekly-article-pipeline/`

**Tests**: Required (constitution II). Test tasks precede their implementation and are seen
failing first. Code carries `013:T###` comments.

**Fixtures**: unit tests build a temporary vault with `fs.mkdtempSync` and invented notes
("Fixture article A"…). No real working titles or vault text are ever copied into tests
(constitution VI).

## Phase 1: Foundation: weeks and notes

- [X] T001 [P] Write failing tests in `tests/unit/weeks.test.ts` for `src/site/weeks.ts`:
  - `isoWeek('2026-10-16')` is `2026-W42`, `isoWeek('2026-06-02')` is `2026-W23`, and a year
    boundary case (`2026-12-31` → `2026-W53`, `2027-01-04` → `2027-W01`);
  - `slotOf('2026-W44')` is `2026-10-27` (the Tuesday, FR-020);
  - `todayIn('Europe/Amsterdam', now)` gives the Amsterdam date for `2026-10-16T22:30:00Z`
    (`2026-10-17`);
  - `weeksBetween('2026-W23', '2026-W42')` is 19.
- [X] T002 [P] Write failing tests in `tests/unit/pipeline-notes.test.ts` for
  `scripts/pipeline/notes.ts` against a temporary vault:
  - only notes with `platform: LinkedIn` and `type` `article` or `content`, outside `archive/`
    and `analytics/`, are read;
  - the title comes from the first `#` heading without a "Week n, Post n —" or "Deel n:" prefix;
  - `pilaar` "P3 - Gereguleerd én Snel" maps to `regulated` (P1 `people`, P2 `environment`,
    P3 `regulated`, P4 `community`);
  - a note without `status` counts as `draft`; an unknown status is reported;
  - `writeFrontmatter` changes only the given keys and leaves the other frontmatter lines and the
    body byte for byte the same.
- [X] T003 Implement `src/site/weeks.ts` and `scripts/pipeline/notes.ts` (makes T001 and T002
  pass). Use `yaml` `parseDocument` for frontmatter so untouched keys keep their formatting.

## Phase 2: User Story 3: The gate catches the mistakes made by hand (P1)

**Goal**: every listed mistake fails the gate with a message that names the article.
**Independent test**: one broken fixture per rule fails; the real data passes.

- [X] T004 [P] [US3] Write failing tests in `tests/unit/article-rules.test.ts` for
  `articleProblems(articles, today)` in `src/site/article-rules.ts`. One fixture per rule; each
  message starts with the article id:
  - duplicate `id`, duplicate `url` naming both articles (FR-012);
  - URL not matching `^https://www\.linkedin\.com/pulse/[a-z0-9-]+$` (FR-013);
  - invalid date, a date after `today` (Europe/Amsterdam), a date before `2026-03-09` (FR-014);
  - missing or empty `excerpt.en` or `excerpt.nl`, series name, pillar name or intro (FR-015);
  - an excerpt with three sentences, or with a `styleViolations` hit such as an em dash (FR-016);
  - pillar missing or not one of the four ids (FR-017);
  - unknown `series.id`; `part > total` when a total is set;
  - a record with a field outside the `Article` model, such as `body` or `text` (FR-011).

  Also: the real `articles` give no problems.
- [X] T005 [P] [US3] Rewrite `tests/unit/articles.test.ts` so it holds for any correct data
  (FR-018). Replace "ten provided articles", "leave regulated without articles" and the single
  five-part series assertion with: unique ids, a complete series has parts `1..total`, and a
  running series (no total) has parts `1..n` without gaps. Keep the `elite-sports` date anchor.
- [X] T006 [US3] After T005 (same file), make `tests/e2e/writing.spec.ts` data-driven (FR-018). Every pillar without
  articles shows the "in the works" text and every other pillar shows none. The series-line count
  equals the number of articles with a series. Every title link's `lang` equals its article's
  `titleLang(a)`, and every series line equals `seriesLabel(a, locale)`. Then add failing unit
  tests in `tests/unit/articles.test.ts` for two helpers in `src/site/articles.ts`:
  - `titleLang(a)` is `a.lang ?? 'en'`, so an article with `lang: 'nl'` gets `nl` (FR-028);
  - `seriesLabel(a, locale)` gives "Running the platform as a product · part 1 of 5" for a
    complete series and "<name> · part 2" / "<naam> · deel 2" without a total (FR-027).
- [X] T007 [US3] Implement `src/site/article-rules.ts` (makes T004 pass). In `src/site/articles.ts`
  add `lang?: 'en' | 'nl'` and optional `series.total` to `Article`, and the helpers `titleLang`
  and `seriesLabel` (makes the T006 unit tests pass).
- [X] T008 [US3] Update `src/components/WritingPage.astro` to use `titleLang(a)` on the title link
  (`data-spec="013:FR-028"`) and `seriesLabel(a, locale)` for the series line (the element keeps
  `data-spec="006:FR-006"`; a wrapper or the label span carries `013:FR-027`). Makes the T006 e2e
  tests pass.
- [X] T009 [US3] Prove each guard once by hand: break one real article per rule, run
  `npm run test:unit`, see the named message, revert. Record the messages in quickstart.md.

## Phase 3: User Story 1: Sander sees what is next and where the gaps are (P1) 🎯 MVP

**Goal**: one private overview of the coming eight weeks.
**Independent test**: a fixture vault with notes in every state gives the expected table.

- [X] T010 [P] [US1] Write failing tests in `tests/unit/pipeline-overview.test.ts` for
  `overview(notes, today)` in `scripts/pipeline/overview.ts`, against fixture notes:
  - eight weeks from the current week (when today is on or before its Tuesday) or the next one;
  - each week is `covered`, `planned` (with title, pillar, status) or `gap` (FR-004);
  - the missed line counts weeks without a publication since the last one (FR-005);
  - pillars without planned or published notes are listed;
  - two notes published in one week cover that week once;
  - two unpublished notes with the same `target_week` both show, and the week is `double-booked`;
  - "Needs attention" lists a note with an unknown status, a `ready` note without `target_week`
    or `words`, and a `published` note without `publish_date` or `linkedin_url` (FR-002).
- [X] T011 [P] [US1] Write a failing test in `tests/unit/pipeline-cli.test.ts`: `node
  scripts/pipeline.ts` with `ARTICLE_VAULT_DIR` unset or missing exits `2` with
  `ARTICLE_VAULT_DIR is not set or not readable`; with a fixture vault it prints the overview and
  exits `0`.
- [X] T012 [US1] Implement `scripts/pipeline/overview.ts`, `scripts/pipeline.ts` (subcommand
  dispatch, text rendering as in contracts/pipeline-cli.md) and the `"pipeline": "node
  scripts/pipeline.ts"` script in `package.json` (makes T010 and T011 pass).

## Phase 4: User Story 4: Sander is warned before the buffer runs dry (P2)

**Goal**: a warning when fewer than two articles are ready.
**Independent test**: zero, one and two ready notes give warning, warning, no warning.

- [X] T013 [P] [US4] Extend `tests/unit/pipeline-overview.test.ts`, failing first: the buffer line
  reads `Buffer: ready <n> of 2.` and adds `WARNING: fewer than 2 articles are ready.` for n < 2
  (FR-019); a missed week stays missed and is not moved forward. Extend
  `tests/unit/pipeline-cli.test.ts`: `pipeline friday` names next Tuesday's ready article, or says
  `nothing is ready`, followed by the buffer line (FR-026).
- [X] T014 [US4] Implement the buffer line and the `friday` subcommand in
  `scripts/pipeline/overview.ts` and `scripts/pipeline.ts` (makes T013 pass).

## Phase 5: User Story 2: Registering a published article is one step (P1)

**Goal**: from LinkedIn URL to an open pull request in one skill.
**Independent test**: `verify` and `mark-published` behave as the contract says on fixtures; a dry
run of the skill on a fixture produces a correct record.

- [X] T015 [P] [US2] Write failing tests in `tests/unit/pipeline-publish.test.ts` for `verify`
  and `markPublished` in `scripts/pipeline/publish.ts`:
  - `verify` fails when the note is not `ready`, when the date is outside `target_week` (message
    `<title>: published <date> is not in planned week <week> (<tuesday>)`, FR-014), when the URL
    is malformed or already on the site, and when `pilaar` or `words` is missing;
  - on success it returns `pillar`, `minutes = ceil(words / 230)` (FR-009), `lang` from `taal`,
    and the series name, id (kebab-case) and part;
  - `markPublished` sets `status: published`, `publish_date` and `linkedin_url` and nothing else
    (FR-008); it refuses a note that is not `ready` (FR-003); `--unplanned` sets `target_week`
    to the week of the date;
  - `--backfill` accepts a URL that is already on the site with the same date, and refuses one
    whose site date differs or that is not on the site.
- [X] T016 [P] [US2] Write failing tests in `tests/unit/publish-skill.test.ts`:
  `.claude/skills/publish-article/SKILL.md` exists, names the steps from
  contracts/publish-skill.md in order (verify, excerpts, `npm run check`, one pull request,
  mark-published), and its commit and pull-request templates contain no `claude.ai/code`,
  `Claude-Session` or other session-link pattern (FR-024).
- [X] T017 [US2] Implement `scripts/pipeline/publish.ts` and the `verify` and `mark-published`
  subcommands in `scripts/pipeline.ts` (makes T015 pass).
- [X] T018 [US2] Write `.claude/skills/publish-article/SKILL.md` from contracts/publish-skill.md
  (makes T016 pass). Excerpt rules: original summary, at most two sentences per language
  (006:FR-007), the 012 style rules (FR-010). Include the "Changing an article later" section.

## Phase 6: User Story 5: Sander is reminded at the weekly publish moment (P3)

**Goal**: a Tuesday calendar event and a Friday check.
**Independent test**: both exist; a manual run of the Friday check reports correctly.

- [X] T019 [US5] Ask Sander to confirm, then create the recurring Google Calendar event "Publish
  this week's article", every Tuesday 08:00–08:30 Europe/Amsterdam, with the publish steps in the
  description (FR-021).
- [X] T020 [US5] Ask Sander to confirm, then create the Friday 09:00 Europe/Amsterdam routine with
  `/schedule`. It checks out this repository and the vault repository, runs `npm ci` and `npm run
  pipeline -- friday` with `ARTICLE_VAULT_DIR` on the vault checkout, and notifies Sander
  (FR-026). If the routine cannot read the vault repository, install the local fallback instead
  (research R7) and say so in the pull request. Trigger one run and check the notification.

## Phase 7: Polish and cross-cutting

- [X] T021 [P] Write a failing test in `tests/unit/claude-md.test.ts`: `CLAUDE.md` exists, says the
  pipeline lives in the vault and is read through `om` and `ARTICLE_VAULT_DIR`, and contains no
  absolute path (`/Users/`, `~/`) (FR-025). Then write `CLAUDE.md`.
- [X] T022 [P] Write two privacy tests. They pass as soon as they run, so see each fail once on a
  temporary change, then revert:
  - `tests/unit/no-rhythm-signal.test.ts`: no `ui` key or value in either language mentions
    publishing rhythm, cadence, streak or "every Tuesday", and the scorecard data has no such
    metric (FR-022);
  - `tests/unit/no-planning-data.test.ts`: no file under `src/` or `public/` contains
    `target_week`, a `status: idea|draft|ready` frontmatter line, `linkedin_url:` or an absolute
    local path (`/Users/`), and every record in `articles` has only `Article` fields (FR-001,
    SC-005).
- [X] T023 [P] Add a "Publishing an article" section to `README.md`: the `/publish-article`
  golden path, `npm run pipeline`, that the planning lives privately in the vault, and that
  article pull requests are content changes outside the Spec Kit flow (plan.md).
- [X] T024 Ask Sander to confirm, then bring the vault frontmatter in line through `npm run
  pipeline -- mark-published --backfill` for the published articles whose notes still lack
  `status: published`, `publish_date` or `linkedin_url` (the URLs and dates in
  `src/site/articles.ts`). Run `npm run pipeline` and show Sander the overview. Ask him which
  "Regulated and fast" article to give a `target_week` within the horizon (SC-006).
- [X] T025 Run `npm run check` and the quickstart privacy scan, and time `npm run pipeline` on the
  real vault (target under 2 seconds). Record the results in quickstart.md, open the pull request
  and confirm `quality-gate` passes.

## Dependencies

- T003 needs T001 and T002. Phases 3–5 need T003.
- Phase 2 (US3) needs only T001 and T003 for the date rules; it can run alongside Phase 3.
- T008 needs T007. T009 needs T007 and T008.
- Phase 4 (US4) extends Phase 3 (US1).
- Phase 5 (US2) needs Phase 2 (rules for the URL and duplicate checks) and Phase 3 (the CLI).
- Phase 6 (US5) needs T014 (`friday`).
- T024 needs T017. T025 comes last.

## Parallel opportunities

- T001 and T002.
- T004, T005 and T010, T011 (different files); T006 after T005.
- T015 and T016.
- T021, T022, T023.

## Implementation strategy

1. **MVP**: Phases 1–3. The overview shows where the gaps are, and the gate catches the hand-made
   mistakes. The site is ready for Dutch articles and running series.
2. **Buffer**: Phase 4.
3. **Golden path**: Phase 5. The next real publish runs through `/publish-article`.
4. **Reminders**: Phase 6, in Sander's accounts after his confirmation.
5. **Polish**: Phase 7, then one pull request.
