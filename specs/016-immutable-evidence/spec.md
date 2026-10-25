# Feature Specification: Immutable Evidence

**Feature Branch**: `016-immutable-evidence`

**Created**: 2026-10-25

**Status**: Draft

**Input**: User description (translated from Dutch): "Evidence the team cannot change itself. Today
the pipeline keeps its artifacts for 7 days and each deploy overwrites the quality report. Store
the evidence of every deploy permanently and unalterably." Owner's choices on 2026-10-25: an
immutable release per deploy plus a signed evidence record in the public transparency log; a full
record including where the change came from; a fixed retention period of five years.

## Context

The pipeline already produces strong evidence on every run: the outcome of every gate check, the
quality report, test results, the bill of materials (014) and signed provenance (015). Almost all
of it is short-lived. Run artifacts expire after 7 days and logs after 90. The published quality
report and SBOM describe only the build that is live now, and are replaced on every deploy.

An auditor asks different questions from an engineer. Are these all the changes? Could the
evidence have been altered afterwards? Can I follow one change from its pull request to
production? The site cannot answer those yet for anything older than a week. This feature keeps a
complete, signed evidence record of every deploy. It lives somewhere that neither the pipeline nor
the owner can quietly change, for a fixed period.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every deploy leaves a complete evidence record (Priority: P1)

Sander (the owner) gets one evidence record for every deploy from main. It holds the outcome of
every gate check, the quality report, the test results, the bill of materials, the manifest with
its signatures, and where the change came from: commit, pull request, who merged it, the run and
what triggered it.

**Why this priority**: without the record there is nothing to keep; the other stories store and
check it.

**Independent Test**: after a deploy, its evidence record exists, lists every gate check with its
outcome, and contains the files and change details named above for exactly the deployed build.

**Acceptance Scenarios**:

1. **Given** a deploy from main, **When** it completes, **Then** exactly one evidence record exists
   for it, naming the commit, the run, the trigger (push, daily run or manual) and the time.
2. **Given** a deploy of a merged pull request, **When** its record is read, **Then** it names the
   pull request, its author, who merged it, and whether the gate passed on the pull request.
3. **Given** a deploy without a new pull request (the daily run), **When** its record is read,
   **Then** it says so, and names the commits that changed since the previous deploy.
4. **Given** the record, **When** it is compared with the live site at that moment, **Then** its
   quality report, SBOM and manifest are byte-identical to what was published.

---

### User Story 2 - The record cannot be changed afterwards (Priority: P1)

The record is signed and logged in a public, append-only transparency log. It is stored as an
immutable release, whose files and tag cannot be changed after publication, by anyone, the owner
included.

**Why this priority**: evidence the team can edit is not evidence; this is the property auditors
test first.

**Independent Test**: an attempt to change or replace a file of a published record is refused;
the record's signature verifies against its transparency log entry; a removed record leaves a
detectable trace.

**Acceptance Scenarios**:

1. **Given** a published record, **When** anyone tries to change, replace or add one of its files,
   or move its tag, **Then** the platform refuses.
2. **Given** a record, **When** its signature is verified with standard public tooling, **Then** it
   shows this repository's pipeline, the commit and the run, and the log entry's time.
3. **Given** a record that was deleted, **When** the sequence of records is checked against the
   transparency log, **Then** the gap is visible and its tag name cannot be reused.
4. **Given** the evidence step, **When** the pipeline publishes a record, **Then** it uses no stored
   secret, and the permission to publish exists only in the job that needs it.

---

### User Story 3 - Evidence is kept for five years, and no longer (Priority: P2)

Records are kept for five years from their deploy. A scheduled clean-up removes older records,
and only those, and logs what it removed.

**Why this priority**: a fixed retention period is a policy the owner chose; it also bounds what
the repository accumulates.

**Independent Test**: with records older and younger than five years, the clean-up removes only
the older ones, says which, and leaves the transparency log entries in place.

**Acceptance Scenarios**:

1. **Given** records younger than five years, **When** the clean-up runs, **Then** none is removed.
2. **Given** a record older than five years, **When** the clean-up runs, **Then** it is removed and
   the run lists it by tag, deploy date and commit.
3. **Given** a clean-up run, **When** it ends, **Then** its own run is the evidence of what was
   removed.

---

### User Story 4 - Anyone can find and check the evidence (Priority: P3)

The scorecard and the README say where the records are, what each contains, how long they are
kept, and how to verify one.

**Why this priority**: evidence nobody can find helps nobody; it is a small addition to existing
pages.

**Independent Test**: the scorecard (EN and NL) and the README explain the records and link to the
list of releases, and the verification command works on the latest record.

**Acceptance Scenarios**:

1. **Given** the scorecard in either language, **When** a visitor reads it, **Then** it explains the
   records, the five-year retention and links to them, also without JavaScript.
2. **Given** the README, **When** an auditor reads it, **Then** it states what a record contains,
   where it is, that it cannot be changed, and how to verify it.

### Edge Cases

- A deploy fails after signing but before publishing to Pages: no record is created, because
  nothing went live.
- The record cannot be published (the platform is unavailable): the deploy still happens, the run
  fails visibly, and the missing record shows as a gap.
- Two deploys of the same commit (push and daily run): two records, one per deploy, each with its
  own run and trigger.
- A deploy triggered manually: the record names the person who started it.
- Test result files that contain local paths or personal data: the record contains only what the
  pipeline publishes today, and is checked for local paths like the SBOM (014).
- The five-year boundary falls between two scheduled clean-ups: the record is removed at the next
  run after it turns five.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every deploy from main MUST produce exactly one evidence record, published after the
  site is live.
- **FR-002**: A record MUST contain the outcome of every gate check, the quality report, the unit
  and end-to-end test results, the SBOM, and the manifest with its three signature bundles,
  byte-identical to what was published.
- **FR-003**: A record MUST name the commit, the run, the trigger and the time. For a deploy of a
  merged pull request, it MUST also name the pull request, its author, the person who merged it and
  the gate outcome on the pull request. For a deploy without a new pull request, it MUST name the
  commits since the previous record.
- **FR-004**: A record MUST be signed with the pipeline's own identity, without a stored key, and
  logged in the public transparency log.
- **FR-005**: A record MUST be stored as an immutable release, so its files and tag cannot be
  changed, replaced, added to or moved after publication.
- **FR-006**: Only the job that publishes records MAY have permission to create releases, and only
  on main; only the clean-up job MAY delete them.
- **FR-007**: Records MUST be kept for five years from their deploy. A scheduled clean-up MUST
  remove records older than that, only those, and MUST list each removed record by tag, date and
  commit in its run.
- **FR-008**: The record MUST NOT contain local absolute paths or stored secrets; a record that
  does MUST fail the step and MUST NOT be published.
- **FR-009**: The scorecard (EN and NL) MUST explain the records, their retention and how to verify
  one, and link to them, without JavaScript. The README MUST describe the same.

### Key Entities

- **Evidence record**: per deploy; the tag, the commit, run, trigger and time, the change
  details, the gate outcomes and the evidence files.
- **Gate outcome**: per check per run; the name, the outcome and the local command.
- **Change details**: the pull request, its author, who merged it and the gate outcome on it; or
  the commits since the previous record.
- **Clean-up run**: scheduled; the records removed, each with its tag, date and commit.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of deploys from main have exactly one evidence record within 15 minutes of going
  live.
- **SC-002**: 0 changes to a published record's files or tag succeed.
- **SC-003**: For any live version in the past five years, an auditor finds its record and follows
  it to the pull request in under five minutes.
- **SC-004**: 0 records older than five years remain after the next scheduled clean-up; 0 younger
  records are removed.
- **SC-005**: The feature adds 0 stored secrets and 0 client-side JavaScript.

## Assumptions

- The repository setting for immutable releases is switched on by the owner's decision. It is off
  today; whether the pipeline or the owner switches it on is a clarify question.
- Removing an immutable release is possible; its tag name then cannot be reused, and its
  transparency log entry stays.
- About two deploys a day (push and daily run) give about 730 releases a year at roughly 1–2 MB
  each.
- Retaining data beyond the platform's own guarantees (for example an off-platform copy) is out of
  scope.
- Records are evidence of deploys. Evidence for pull requests that never merged is out of scope.
