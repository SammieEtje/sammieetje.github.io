# Feature Specification: Weekly Article Pipeline

**Feature Branch**: `013-weekly-article-pipeline`

**Created**: 2026-10-16

**Status**: Draft

**Input**: User description: "Weekly article pipeline: give Sander grip on publishing one LinkedIn
article per week."

## Context

Sander publishes long-form LinkedIn Articles (`linkedin.com/pulse/...`). The site lists them on the
writing page (spec 006), grouped by four content pillars. Ten articles appeared between 2026-03-09
and 2026-06-02, roughly one a week with a few two-week gaps. Nothing has been published since
2026-06-02.

Planning was done by hand. That produced mistakes in the article data and the weekly rhythm did not
hold. The publish click itself is not the problem; the work before it is: knowing what is next,
having something ready, and registering the result on the site without errors. The pillar
"Regulated and fast" still has no article.

### Decisions already made

These were settled before this spec and are not reopened in clarify:

- LinkedIn only. No Substack, newsletter or mailing list for now.
- LinkedIn Articles only. No short posts.
- One article per week.
- No scheduler tool. Neither Typefully nor LinkedIn can schedule Articles, so the publish click on
  LinkedIn stays manual and weekly.
- Drafting happens together with Claude.
- Sander keeps ownership of his texts, independent of LinkedIn.

## Clarifications

### Session 2026-10-16

- Q: Where does the editorial pipeline live? → A: Split. Planning, working titles, status, target
  weeks and drafts stay private in Sander's Obsidian vault, next to the texts and word counts.
  Only published article metadata goes into the public repository. The agent reads the vault
  through the `om` server, and a short note in the repository's CLAUDE.md tells it to consult the
  vault for the pipeline.
- Q: Is the full article text also published on the site? → A: No. Spec 006 stays: LinkedIn is
  the place to read, and the vault is Sander's own archive of the texts.
- Q: Which fixed weekday and time is the weekly publication slot? → A: Tuesday 08:00
  Europe/Amsterdam (seven of the first ten articles appeared on a Tuesday).
- Q: How is Sander reminded of the weekly publish moment? → A: Both. A recurring calendar event
  on Tuesday 08:00 with the publish steps in it, and a scheduled check on the Friday before that
  reads the vault and reports which article is ready for Tuesday, or that the buffer is empty.
- Q: How many weeks of ready articles should the pipeline hold before it warns? → A: Two. The
  warning shows when fewer than two ready, unpublished articles are in the pipeline.
- Q: Does the public site show anything about publishing rhythm? → A: No. The writing page keeps
  listing articles with their dates; no rhythm metric, promise or streak is added anywhere.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sander sees what is next and where the gaps are (Priority: P1)

Sander opens one overview and sees, for the coming weeks, which article is planned for which week,
what state each one is in (idea, draft, ready, published), and which weeks or pillars have nothing
planned.

**Why this priority**: the rhythm broke because nobody could see the pipeline. Without this view
the other stories only tidy up the end of a process that has already stalled.

**Independent Test**: with a set of planned articles in different states, the overview shows each
article with its pillar, working title, status and target week, and lists every week in the
horizon without a planned article and every pillar without a planned or published article.

**Acceptance Scenarios**:

1. **Given** planned articles for some of the coming weeks, **When** Sander opens the overview,
   **Then** each week in the horizon shows its planned article, or is marked as a gap.
2. **Given** a pillar with no planned and no published article, **When** Sander opens the
   overview, **Then** that pillar is marked as a gap.
3. **Given** an article moves from draft to ready, **When** Sander opens the overview again,
   **Then** it shows the new status and counts towards the ready buffer.
4. **Given** the planning holds unpublished working titles, **When** anyone visits the public site
   or reads the public repository, **Then** they see none of it unless Sander has decided it may be
   public.

---

### User Story 2 - Registering a published article is one step (Priority: P1)

After Sander publishes an article on LinkedIn, he gives one command with the article's details.
The article lands on the site through one pull request that passes the quality gate, in English
and Dutch, and the planning shows it as published.

**Why this priority**: this is the weekly step where hand-made mistakes crept in, and the step
Sander repeats most.

**Independent Test**: starting from a planned article in state ready, one command produces a pull
request that adds the article to the writing page with title, URL, date, pillar, optional series,
reading time and a two-language excerpt; the quality gate passes; the planning entry becomes
published.

**Acceptance Scenarios**:

1. **Given** a ready article that Sander has just published on LinkedIn, **When** he runs the
   publish step with its URL, **Then** a pull request is opened that adds the article to the
   writing page in both languages, newest first within its pillar.
2. **Given** the publish step, **When** it asks for the excerpt, **Then** the excerpt is an
   original summary of at most two sentences per language that follows the site's style rules.
3. **Given** the pull request is merged, **When** the site is live, **Then** the article appears
   on the writing page in both languages and links to its LinkedIn URL.
4. **Given** the publish step, **When** it finishes, **Then** the planning entry for that article
   is marked published with its publication date.

---

### User Story 3 - The gate catches the mistakes made by hand (Priority: P1)

When article data is wrong, the quality gate fails and says what is wrong, before anything goes
live.

**Why this priority**: every guardrail here matches a mistake that has already happened. A rule
that only lives in a document is a wish (constitution I).

**Independent Test**: for each listed mistake, adding a deliberately broken article makes the gate
fail with a message naming the article and the rule; a correct article passes.

**Acceptance Scenarios**:

1. **Given** an article whose URL is already used by another article, **When** the gate runs,
   **Then** it fails and names both articles.
2. **Given** an article whose URL is not a LinkedIn Article URL, **When** the gate runs, **Then**
   it fails and names the article.
3. **Given** an article whose publication date falls outside its planned week in the vault,
   **When** the publish step runs, **Then** it stops before opening a pull request and names the
   article, the date and the planned week.
4. **Given** an article whose excerpt or pillar name is missing in one language, **When** the gate
   runs, **Then** it fails and names the article and the language.
5. **Given** an article whose excerpt breaks the style rules or has more than two sentences,
   **When** the gate runs, **Then** it fails and names the article and the rule.
6. **Given** an article without a pillar, or with a pillar that does not exist, **When** the gate
   runs, **Then** it fails and names the article.

---

### User Story 4 - Sander is warned before the buffer runs dry (Priority: P2)

When fewer than two articles are ready, Sander gets a warning while
there is still time to write.

**Why this priority**: the gap after 2026-06-02 started as an empty buffer. The warning is useful
once the overview exists, so it comes after stories 1 to 3.

**Independent Test**: with the buffer target of two weeks, the warning appears with zero or one
ready, unpublished article and disappears at two.

**Acceptance Scenarios**:

1. **Given** fewer ready articles than the buffer target, **When** Sander looks at the overview,
   **Then** it shows a warning with the number of ready articles and the target.
2. **Given** at least as many ready articles as the buffer target, **When** Sander looks at the
   overview, **Then** no warning is shown.
3. **Given** a week has passed without a published article, **When** Sander looks at the overview,
   **Then** the missed week is shown as missed and is not silently moved forward.

---

### User Story 5 - Sander is reminded at the weekly publish moment (Priority: P3)

On Tuesday at 08:00 Sander's calendar reminds him to publish and lists the steps. On the Friday
before, a scheduled check tells him which article is ready for Tuesday, while there is still a
weekend to finish one if nothing is.

**Why this priority**: helpful for the habit, but the overview and buffer warning already make
the state visible.

**Independent Test**: the calendar event exists and recurs weekly on Tuesday 08:00; the Friday
check, run against a planning with and without a ready article, reports the right article or the
empty buffer.

**Acceptance Scenarios**:

1. **Given** a ready article planned for next Tuesday, **When** the Friday check runs, **Then** it
   names that article.
2. **Given** no ready article for next Tuesday, **When** the Friday check runs, **Then** it says
   so and shows the buffer warning.
3. **Given** it is Tuesday 08:00, **When** the calendar event starts, **Then** it lists the
   publish steps.

---

### Edge Cases

- Sander publishes an article that was never planned. The publish step still registers it and
  adds it to the planning as published, with its actual week.
- Sander publishes in a different week than planned, on purpose. The publish step lets him move
  the planned week first, so the date check reflects the decision instead of being switched off.
- Two articles are published in the same week, for instance to catch up. Both are accepted; the
  week counts as covered once and the second does not fill a later week.
- A LinkedIn URL changes after publication, for instance when the slug is edited. Updating the
  URL of an existing article is possible without a duplicate.
- An article is removed from LinkedIn. It can be taken off the site in one change, and the
  planning shows it as withdrawn rather than published.
- The publication date near midnight differs between Europe/Amsterdam and UTC. The date in
  Europe/Amsterdam counts.
- The pillar "Regulated and fast" gets its first article. Existing checks that assume this pillar
  is empty, or that there are exactly ten articles, are updated as part of this feature, so the
  first real publish does not fail on an outdated test.
- The planning lives in the private vault, so the public quality gate cannot see the planned
  week. The planned-week check runs in the publish step, which can read the vault (FR-014).
- The vault cannot be reached during the publish step. The step stops and says so; it does not
  skip the planned-week check or the planning update.

## Requirements *(mandatory)*

### Functional Requirements

**Editorial pipeline**

- **FR-001**: The planning MUST be kept in Sander's private Obsidian vault. Only the metadata of
  published articles goes into the public repository. Unpublished titles, drafts and planning
  MUST NOT become visible on the site or in the public repository unless Sander has decided they
  may.
- **FR-025**: The repository MUST contain a short instruction for the agent (in CLAUDE.md) to
  read the pipeline from the vault through the `om` server, and MUST NOT contain the vault's
  content or local paths to it.
- **FR-002**: Every planned article MUST have a pillar, a working title, a status (`idea`,
  `draft`, `ready`, `published`) and a target publication week. A published article MUST also
  record its publication date.
- **FR-003**: Status MUST only move forward in the order `idea → draft → ready → published`,
  except that an article may be moved back one step or withdrawn on purpose.
- **FR-004**: One overview MUST show, for a horizon of the coming weeks, the planned article per
  week with its status, every week without a planned article, the ready articles not yet
  published, and every pillar without a planned or published article.
- **FR-005**: The overview MUST show a missed week (a past week without a published article) as
  missed.

**Publish step**

- **FR-006**: Registering a published article MUST be one command or skill that takes title, URL,
  publication date (Europe/Amsterdam), pillar, optional series and part, reading time and an
  excerpt in English and Dutch.
- **FR-007**: The publish step MUST produce exactly one pull request that adds the article to the
  writing page and passes the quality gate before it can be merged.
- **FR-008**: The publish step MUST mark the matching planning entry as published with its date,
  or create a published entry when the article was not planned.
- **FR-009**: Reading time MUST be derived the same way as for the existing articles (word count
  of Sander's own text divided by 230, rounded up), so all articles on the page are comparable.
- **FR-010**: Excerpts MUST be original summaries of at most two sentences per language (006:FR-007)
  and MUST follow the site's style rules (spec 012).
- **FR-011**: The site MUST NOT publish the full text of an article. The writing page keeps
  linking to LinkedIn as the place to read (spec 006); Sander's own copy of each text stays in the
  vault.

**Guardrails**

- **FR-012**: The quality gate MUST fail when two articles share a URL, and name both.
- **FR-013**: The quality gate MUST fail when an article URL is not a LinkedIn Article URL
  (`https://www.linkedin.com/pulse/<slug>`), and name the article.
- **FR-014**: The publish step MUST refuse to open a pull request when the publication date does
  not fall in the article's planned week in the vault, and name the article, the date and the
  week. The public quality gate MUST fail when a publication date is not a valid date, lies in the
  future, or is before the first article (2026-03-09).
- **FR-015**: The quality gate MUST fail when any visitor-facing article field (excerpt, series
  name, pillar name or intro) is missing or empty in either language, and name the article and
  the language.
- **FR-016**: The quality gate MUST fail when an excerpt breaks the style rules or has more than
  two sentences, and name the article and the rule.
- **FR-017**: The quality gate MUST fail when an article has no pillar or an unknown pillar, and
  name the article.
- **FR-018**: Existing article checks MUST NOT depend on a fixed number of articles or on a pillar
  staying empty, so a correct new article never fails the gate.

**Buffer and rhythm**

- **FR-019**: The overview MUST warn when fewer than two ready, unpublished articles are in the
  pipeline (buffer target: two weeks), and show both the number ready and the target.
- **FR-020**: The weekly publication slot MUST be Tuesday 08:00 Europe/Amsterdam. A planned
  article's target week is the ISO week that contains that Tuesday.
- **FR-021**: Sander's calendar MUST hold a recurring event on Tuesday 08:00 Europe/Amsterdam that
  lists the publish steps.
- **FR-026**: A scheduled check MUST run every Friday before the slot, read the planning in the
  vault, and report to Sander the article that is ready for next Tuesday, or that none is ready
  together with the buffer warning (FR-019). The report MUST stay private to Sander.
- **FR-022**: The public site MUST NOT show a publishing-rhythm signal (no cadence metric on the
  scorecard, no publishing promise, no streak). The planning, the buffer and missed weeks stay
  private to Sander.

**Cross-cutting**

- **FR-023**: Everything a visitor sees as a result of this feature MUST exist in English and
  Dutch (constitution VII) and MUST be static HTML without new client-side JavaScript
  (constitution V).
- **FR-024**: Commits and pull request descriptions produced by the publish step MUST NOT contain
  agent-session links or local absolute paths (constitution VI).

### Key Entities

- **Planned article**: one entry in the editorial pipeline. Working title, pillar, status, target
  week, and once published its publication date and a link to the published article. Lives in
  Sander's private vault (FR-001).
- **Published article**: the public record on the writing page, as defined in spec 006: title,
  LinkedIn URL, date, reading time, pillar, optional series and part, excerpt per language.
- **Pillar**: one of the four content pillars; every article belongs to exactly one.
- **Publication week**: an ISO week in Europe/Amsterdam. Each week in the horizon is covered,
  planned, missed or a gap.
- **Publication slot**: Tuesday 08:00 Europe/Amsterdam, the moment Sander publishes each week.
- **Buffer target**: two ready, unpublished articles.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Registering a published article on the site takes Sander one command and at most
  5 minutes of his own time, from LinkedIn URL to an open pull request.
- **SC-002**: Each of the six guardrail mistakes in User Story 3, introduced on purpose, is caught
  in 100% of cases (the planned-week check by the publish step, the others by the quality gate),
  with a message that names the article.
- **SC-003**: In the eight weeks after the feature is live, at least seven articles are published,
  and no gap of two or more weeks goes by without a buffer warning first.
- **SC-004**: At any moment, Sander can answer "what do I publish next week, and what is ready?"
  from one overview, without opening another source.
- **SC-005**: No unpublished working title, draft or planning detail appears on the site or in the
  public repository unless Sander has approved it, checked at the pull request of this feature
  and at every publish step.
- **SC-006**: The pillar "Regulated and fast" has a planned article within the horizon of the
  overview.

## Assumptions

- The writing page, pillars, series and article data from spec 006 stay as they are; this feature
  adds to them and does not redesign the page.
- Weeks are ISO weeks (Monday to Sunday) in Europe/Amsterdam.
- The overview's horizon is the coming eight weeks.
- The overview is private to Sander and lives where the planning lives; it is not a page on the
  public site.
- The Friday check runs in the morning, Europe/Amsterdam. Creating the calendar event and the
  scheduled check touches Sander's own accounts, so both are confirmed with him when they are
  set up.
- The publish step runs on Sander's machine with Claude, and uses the same pull request and quality
  gate as every other change. Sander reviews and merges the pull request himself.
- Excerpts are drafted together with Claude and approved by Sander in the pull request.
- Word counts come from Sander's own copy of the text, which he keeps independent of LinkedIn.
- LinkedIn Article URLs keep the form `https://www.linkedin.com/pulse/<slug>`.
- Out of scope: Typefully and other schedulers, Substack, short LinkedIn posts, other platforms
  (XING, Mastodon), automated publishing to LinkedIn, and LinkedIn analytics.
