# Research: Weekly Article Pipeline

## R1. Where the planning data lives in the vault

- **Decision**: the planning is the frontmatter of the article notes Sander already keeps in his
  vault (the personal-brand content folder). There is no separate planning file. Four fields are
  added or normalised per note: `status` (`idea | draft | ready | published | withdrawn`),
  `target_week` (ISO week, `2026-W44`), `linkedin_url` and `publish_date`. Pillar, series, part,
  language and word count already exist as `pilaar`, `reeks`, `deel`, `taal` and `words`.
- **Rationale**: the notes already carry most fields, and Sander edits them in Obsidian. A second
  planning file would drift from the notes, which is the hand-made error this feature removes.
  The drift is already visible: some published articles still have notes that say draft.
- **Alternatives considered**: a planning table in a single note (drifts from the notes); the
  existing spreadsheet calendar (not machine-readable without another dependency); a planning
  file in the public repository (rejected in clarify).

## R2. How repository code reaches the vault without leaking it

- **Decision**: repository scripts read the vault from a directory given in the environment
  variable `ARTICLE_VAULT_DIR`. The value is set on Sander's machine (shell profile or the
  git-ignored `.claude/settings.local.json`), never in a committed file. The agent finds notes and
  context through the `om` server, which is already registered at user scope and therefore
  available in this repository; CLAUDE.md says so in a few lines.
- **Rationale**: the code is public, the data is not. An environment variable keeps local paths
  out of the repository (constitution VI) and lets the Friday check point the same script at a
  fresh clone of the vault.
- **Alternatives considered**: reading only through `om` (fine for an agent, but the overview and
  checks must be deterministic scripts that tests can run); a committed relative path (assumes a
  folder layout and leaks the vault's name).

## R3. The overview

- **Decision**: `npm run pipeline` prints the overview in the terminal as plain text: the coming
  eight ISO weeks with the planned article and status per week, gaps, missed weeks since the last
  publication, pillars without planned or published work, and the buffer line (`ready 1 of 2`,
  with a warning below target). It is computed by a pure module that tests feed with fixture
  notes.
- **Rationale**: the overview must stay private (FR-001, FR-022), so it cannot be a page on the
  site. A terminal report is what the publish skill, the Friday check and Sander all read, from
  one implementation.
- **Alternatives considered**: an Obsidian Bases or Dataview view (cannot compute gaps, missed
  weeks or the buffer); a generated note written back into the vault (a second copy that can go
  stale; may be added later on top of the same module).

## R4. The publish step

- **Decision**: a project skill `/publish-article` in `.claude/skills/publish-article/`. It runs
  the deterministic parts as scripts and keeps the writing parts (the excerpts) with Claude and
  Sander:
  1. Find the note (by title or `om` search), read the LinkedIn URL from Sander.
  2. `npm run pipeline -- verify <note> --date <yyyy-mm-dd>` checks status `ready`, the planned
     week (FR-014), URL form and duplicates, and prints the derived record: pillar id, series and
     part, language, reading time.
  3. Claude drafts the English and Dutch excerpt (at most two sentences, style rules), Sander
     approves.
  4. The article is added to `src/site/articles.ts`; on a branch `article/<id>`, `npm run check`
     runs, one commit, one pull request.
  5. `npm run pipeline -- mark-published <note> --date … --url …` updates the note's frontmatter.
- **Rationale**: one command for Sander (FR-006), scripts for everything a machine can check,
  and Claude only where judgement is needed. Using the full `npm run check` keeps the local and
  CI results equal (constitution I).
- **Alternatives considered**: a script that edits `articles.ts` through text insertion (fragile
  in a hand-formatted TypeScript file; Claude plus the type checker and tests is safer); moving
  article data to JSON (a rewrite of 006 with no gain for this feature).

## R5. Guardrails in the public gate

- **Decision**: a pure module `src/site/article-rules.ts` returns named problems for a list of
  articles: duplicate id or URL, URL not of the form `https://www.linkedin.com/pulse/<slug>`,
  invalid date, a date in the future (Europe/Amsterdam) or before 2026-03-09, unknown or missing
  pillar, unknown series, missing or empty text in either language (excerpt, series name, pillar
  name and intro), more than two sentences in an excerpt, and style-rule violations through the
  existing `styleViolations`. A unit test runs it over the real data and over one broken fixture
  per rule.
- **Rationale**: one module gives one message format that names the article (SC-002). The
  existing `articles.test.ts` assertions that hard-code ten articles, an empty "Regulated and
  fast" pillar and a single series are rewritten to rules (FR-018), as are the e2e checks that
  depend on them (`toHaveCount(5)` on series lines, the "coming soon" text on the regulated
  pillar).
- **Alternatives considered**: a separate CLI step in the pipeline (would need its own entry in
  `npm run check` and the workflow; the unit-test step already runs in both).

## R6. Week arithmetic and time zone

- **Decision**: dates are calendar dates in Europe/Amsterdam (`yyyy-mm-dd`). ISO week numbers are
  computed from the calendar date alone, which needs no time zone. "Today" is the current date in
  Europe/Amsterdam via `Intl.DateTimeFormat`. The publication slot is Tuesday 08:00; a target week
  `2026-W44` means Tuesday 2026-10-27.
- **Rationale**: avoids the UTC midnight edge case in the spec, without a date library.
- **Alternatives considered**: `Temporal` (not stable in Node 24 without a flag); a date library
  (a new dependency for twenty lines of arithmetic).

## R7. Reminder: calendar event and Friday check

- **Decision**:
  - **Tuesday**: a recurring Google Calendar event, Tuesday 08:00–08:30 Europe/Amsterdam, titled
    "Publish this week's article", with the publish steps in the description. Created once
    through the Google Calendar connector after Sander confirms.
  - **Friday**: a Claude Code routine (scheduled cloud agent) every Friday 09:00 Europe/Amsterdam.
    It checks out this repository and Sander's vault repository (already on GitHub and pushed
    automatically), runs `npm ci` and `npm run pipeline -- friday` with `ARTICLE_VAULT_DIR`
    pointing at the vault checkout, and sends Sander the result as a push notification. The
    routine's prompt lives in Sander's account, not in the repository.
- **Rationale**: both reminders reach Sander when his laptop is closed. The Friday check reuses
  the overview module, so it cannot disagree with `npm run pipeline`.
- **Alternatives considered**: a local `launchd` job (silent when the laptop is closed or
  asleep); a GitHub Actions schedule in the vault repository (puts automation in the private vault
  and needs a notification channel of its own); a session-bound cron (stops with the session).
- **Open risk**: if the routine cannot be given access to the vault repository, it falls back to
  a local `launchd` job running the same command; the quickstart checks which one is live.

## R8. Series and language of a new article

- **Decision**:
  - `Article` gets an optional `lang` (default `en`), used on the title link. Some articles are
    written in Dutch, and the link currently hard-codes `lang="en"`
    (constitution IV, correct language of parts).
  - `series.total` becomes optional. While a series is still running the site shows "part n" /
    "deel n" without a total, so the public site does not reveal how many parts are planned
    (FR-001). Once the last part is published, the total is set on all parts in the same pull
    request.
  - A new series gets its bilingual name in the `series` map in the same pull request as its
    first article.
- **Rationale**: both gaps would surface on the first publish of a Dutch article or of a new
  series.
- **Alternatives considered**: always showing a total (leaks planning and goes wrong when a
  series grows); translating Dutch titles (titles are
  published words and stay as written, see 012).

## R9. No session links in what the publish step writes

- **Decision**: the skill uses a fixed commit-message and pull-request template with only the
  `Co-Authored-By` trailer, and says explicitly that session-link trailers are left out. A unit
  test reads the skill and fails if its templates contain a session link or session trailer, or
  if CLAUDE.md contains an absolute local path.
- **Rationale**: the rule already applies by hand; this makes the golden path carry it.
- **Alternatives considered**: a CI scan of commit messages (the pull-request checkout has only
  the merge commit; the pull-request body is not visible to the gate without extra permissions).
