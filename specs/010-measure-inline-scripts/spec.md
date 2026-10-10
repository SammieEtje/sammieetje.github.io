# Feature Specification: Measure Inline Scripts

**Feature Branch**: `010-measure-inline-scripts`

**Created**: 2026-10-10

**Status**: Draft

**Input**: User description: "Fix this gap: the scorecard shows 0 KB of JavaScript for the
playground, while it actually ships about 1.2 KB inline. Lighthouse only counts separate script
files. A test still enforces the budget correctly, but the public number understates it. Have
the report measure inline scripts too, so the scorecard is exact."

## Context

The scorecard (009) promises that its numbers come from the pipeline and that "nothing is typed
in by hand". One of those numbers is wrong: the JavaScript per page. The measuring tool only
counts script delivered as separate files, while the playground and the scorecard deliver their
script embedded in the page. The public table therefore reports 0 KB for both pages, although
each ships about 1–2 KB.

The budget itself is safe: a separate end-to-end test measures embedded script and fails above
50 KB. But a site that claims to show its measured quality must not understate it, and having two
different definitions of "JavaScript per page" (one for the public number, one for the gate) is
exactly the kind of drift the constitution forbids (principle I: one rule, checked one way).

## Clarifications

### Session 2026-10-10

- No critical ambiguities: the measure (compressed, embedded plus separate, executable script
  only), the 50 KB budget and the scope follow from constitution V and spec 009. The owner chose
  to proceed without questions.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The scorecard shows the JavaScript a page really ships (Priority: P1)

A visitor reads the scorecard and sees, for every page, the total JavaScript that page delivers,
whether it comes as a separate file or embedded in the page.

**Why this priority**: this is the gap; the scorecard's credibility depends on it.

**Independent Test**: after a pipeline run, the scorecard's JavaScript value for the playground
and the scorecard pages is greater than zero and matches an independent measurement of what those
pages deliver; every other page shows 0 KB.

**Acceptance Scenarios**:

1. **Given** a page that embeds script, **When** the pipeline measures it, **Then** the report's
   JavaScript value for that page includes the embedded script's compressed size.
2. **Given** a page that loads script from separate files, **When** the pipeline measures it,
   **Then** those files still count, exactly as before.
3. **Given** a page with both, **When** the pipeline measures it, **Then** the value is the sum.
4. **Given** a page with no script, **When** the pipeline measures it, **Then** the value is 0.

---

### User Story 2 - One definition of "JavaScript per page" for the gate and the scorecard (Priority: P1)

Sander (the owner) knows that the number the public sees and the number that can block a merge
are the same measurement.

**Why this priority**: two definitions drift apart; the gap exists precisely because they did.

**Independent Test**: inflate a page's embedded script above the budget in a local experiment; the
budget step fails and the report shows the same over-budget value.

**Acceptance Scenarios**:

1. **Given** a page whose total JavaScript exceeds the 50 KB budget, **When** the pipeline runs,
   **Then** the budget check fails on that page and the report marks it over budget with the same
   value.
2. **Given** the pipeline and the local check command, **When** each measures the same build,
   **Then** they report the same JavaScript values.

---

### User Story 3 - The scorecard says what is counted (Priority: P3)

A curious engineer reads, next to the JavaScript column, that the value includes embedded and
separate script, compressed.

**Why this priority**: transparency; small.

**Independent Test**: the scorecard explains the JavaScript measure in one short line, in both
languages.

**Acceptance Scenarios**:

1. **Given** the scorecard table, **When** a visitor reads it, **Then** a short note states that
   JavaScript is the compressed size of all script a page delivers, embedded and separate.

### Edge Cases

- Non-executable data embedded in script elements (for example structured data or JSON
  configuration) does not count as JavaScript.
- Script from another origin cannot occur (constitution VI); if it ever did, it is counted, never
  silently dropped.
- An empty script element counts as 0 bytes.
- The report produced before this feature (schema without the breakdown) is still displayed
  correctly by the scorecard until the next deploy replaces it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The quality report's JavaScript value per page MUST equal the compressed size of all
  executable script the page delivers: separate first-party script files plus script embedded in
  the page.
- **FR-002**: Non-executable content inside script elements (data blocks such as JSON) MUST NOT be
  counted.
- **FR-003**: The JavaScript budget check that gates merging and deployment MUST use the same
  measurement as the report, so a page over 50 KB fails the gate and appears over budget on the
  scorecard with the same value.
- **FR-004**: The local check command and the pipeline MUST produce identical JavaScript values for
  the same build.
- **FR-005**: The scorecard MUST state, in both languages, what the JavaScript value includes.
- **FR-006**: The separate end-to-end test that measured embedded script for the budget MUST be
  replaced by, or derive from, the single shared measurement, so that only one definition
  remains.

### Key Entities

- **Page script measurement**: per page, the compressed size of separate script files, of embedded
  script, and their total; the total is what the report publishes and the gate checks.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 pages in the live report understate their JavaScript; the playground and scorecard
  values are greater than 0 and within 0.1 KB of an independent measurement of the deployed pages.
- **SC-002**: Exactly one definition of "JavaScript per page" exists across the gate, the report and
  the tests.
- **SC-003**: A page made to exceed 50 KB fails the gate in 100% of runs.
- **SC-004**: Every page keeps its Lighthouse scores and stays within the JavaScript budget.

## Assumptions

- "Compressed size" means gzip, as in the existing end-to-end budget test and the constitution's
  50 KB budget; the site is served compressed by GitHub Pages.
- The current pages with embedded script are the playground and the scorecard (two languages
  each); their values are expected at roughly 1–2 KB.
- The breakdown (separate versus embedded) may be kept in the report for transparency; the
  scorecard shows the total.
