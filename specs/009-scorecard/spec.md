# Feature Specification: Scorecard

**Feature Branch**: `009-scorecard`

**Created**: 2026-10-10

**Status**: Draft

**Input**: User description: "Scorecard: live quality metrics from the pipeline. Include making the
pipeline fast again: the budget checks take about eight minutes and push 'live within ten
minutes' (001 SC-005) over the limit."

## Context

Every developer portal has a scorecard: the measured health of each service. This site's
scorecard shows the quality of the version that is live right now, measured by the pipeline that
deployed it: Lighthouse scores per page, JavaScript per page, how many tests passed, how many
requirements are traced, and how long the pipeline took. It is the proof behind "built
spec-first and shipped through a quality gate".

It also repairs the pipeline itself. With fifteen pages, Lighthouse runs each page three times
one after another and takes about eight minutes, so a merge now goes live in about 10.5 minutes,
breaking 001 SC-005. Running the budget checks in parallel brings the pipeline back under the
limit and keeps it there as pages are added.

Audiences: engineers and peers see the engineering standard in numbers; decision-makers see a
leader who measures what he asks of others.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A merge is live within ten minutes again (Priority: P1)

Sander merges a pull request and the site is live within ten minutes, with every check still
gating the deployment.

**Why this priority**: it restores a broken success criterion of the foundation.

**Independent Test**: merge this feature; the pipeline on `main` finishes and deploys within ten
minutes; a deliberately failing budget would still block merging and deploying.

**Acceptance Scenarios**:

1. **Given** a push to `main`, **When** the pipeline runs, **Then** the budget checks run in parallel
   shards and the deployment completes within ten minutes of the push.
2. **Given** any failing check, including a single budget shard, **When** the pipeline finishes,
   **Then** the required `quality-gate` check fails, merging is blocked and nothing deploys.
3. **Given** a contributor's machine, **When** they run the single local check command, **Then** the
   same checks run as in the pipeline (all pages, one process).

---

### User Story 2 - See the measured quality of the live site (Priority: P1)

A visitor opens the scorecard and sees, for the version that is live: the commit and when it was
measured, Lighthouse scores and JavaScript size per page against the budgets, test and trace
counts, and the pipeline duration.

**Why this priority**: the scorecard is the visible proof of the site's claims.

**Independent Test**: open `/scorecard/` on the deployed site; the numbers match the pipeline run
that deployed it.

**Acceptance Scenarios**:

1. **Given** the scorecard, **When** it loads, **Then** it shows the commit (linked), the measurement
   time, and an overall verdict (all budgets met or not).
2. **Given** the per-page table, **When** it is read, **Then** each page shows its four Lighthouse
   scores and its JavaScript size, with each value marked as within or outside its budget in text,
   not only by colour.
3. **Given** the summary tiles, **When** they are read, **Then** they show unit tests passed,
   end-to-end tests passed, traced references and pipeline duration.

---

### User Story 3 - When measurements are not available (Priority: P2)

A visitor without JavaScript, or a local preview without a pipeline run, sees an honest state
instead of empty or fake numbers.

**Why this priority**: constitution IV/V and honesty.

**Independent Test**: with JavaScript disabled, the scorecard explains where the numbers come from
and links to the raw report; with no report present, it says no measurement is available yet.

**Acceptance Scenarios**:

1. **Given** JavaScript is disabled, **When** the scorecard loads, **Then** it explains the
   measurements and links to the raw report file.
2. **Given** no report exists (local preview), **When** the scorecard loads, **Then** it says that no
   measurement is available yet and how to produce one.

---

### User Story 4 - Find it, read it in Dutch (Priority: P2)

**Independent Test**: navigation lists "Scorecard — how it's measured"; `/nl/scorecard/` in Dutch;
the footer's build link sits next to a link to the scorecard.

**Acceptance Scenarios**:

1. **Given** any page, **When** the visitor opens the navigation, **Then** "Scorecard — how it's
   measured" (NL: "Scorecard — hoe het gemeten is") is listed.
2. **Given** any page footer, **When** the visitor reads it, **Then** a "Scorecard" link sits next to
   the build identity.

### Edge Cases

- A shard fails or times out: the aggregate `quality-gate` fails; nothing deploys.
- The report for the deployed commit is missing: the scorecard shows the "not available" state.
- The report belongs to a different commit than the page's build identity: the scorecard shows the
  report's commit, never claims it is the page's.
- New pages are added: shards rebalance automatically; no per-page pipeline edits.

## Requirements *(mandatory)*

### Functional Requirements

**Pipeline**

- **FR-001**: The budget checks MUST run in parallel shards over all built pages, each page measured
  exactly once per pipeline run, with pages assigned to shards automatically.
- **FR-002**: A single required check named `quality-gate` MUST pass only when every other check,
  including every budget shard, has passed; deployment MUST depend on it.
- **FR-003**: The pipeline MUST produce one merged quality report per run, containing per-page
  scores and JavaScript size, unit and end-to-end test counts, traced references, commit, run
  start and report time, and whether all budgets passed.
- **FR-004**: On `main`, the merged report MUST be deployed with the site at a stable address
  (`/quality/report.json`), unchanged from what the pipeline measured.
- **FR-005**: The local check command MUST keep running every check, including budgets on every
  page, without sharding.

**Scorecard page**

- **FR-006**: The site MUST have a scorecard page at `/scorecard/` (EN) and `/nl/scorecard/` (NL)
  that loads the deployed report and shows commit, measurement time, verdict, per-page scores and
  JavaScript against budgets, test counts, traced references and pipeline duration.
- **FR-007**: Every value MUST state in text whether it meets its budget.
- **FR-008**: Without JavaScript or without a report, the page MUST explain the measurements, link
  to the raw report, and never show invented numbers.
- **FR-009**: The scorecard script MUST stay within the JavaScript budget; pages other than the
  playground and the scorecard keep zero scripts.

**Findability**

- **FR-010**: The scorecard MUST appear in the navigation with term and subtitle in both languages,
  have its own title, description and sharing metadata, and be linked from the footer.

### Key Entities

- **Quality report** (extends 001's schema): schema version, commit, run start, generated at, pages
  (url, scores, script bytes), budgets, unit tests passed, end-to-end tests passed, traced
  references, passed.
- **Shard**: index and total; the pages it measures.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A merge to `main` is live within 10 minutes (restores 001 SC-005).
- **SC-002**: The budget stage takes at most a third of its previous duration (about eight
  minutes).
- **SC-003**: 100% of pages appear in the deployed report exactly once.
- **SC-004**: The scorecard shows the same numbers as the report for the live commit; zero
  invented numbers in any state.
- **SC-005**: Constitution budgets hold on every page, including the scorecard.

## Assumptions

- Three shards are enough for fifteen to thirty pages; the number is a single setting.
- Pipeline duration is measured from the run's start (from the GitHub API, read-only) to report
  generation; deployment adds about a minute.
- The scorecard reads the report in the browser because the report is produced after the build;
  the deployed site files stay exactly the tested build, plus the report file.
