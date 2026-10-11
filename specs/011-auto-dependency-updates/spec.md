# Feature Specification: Automatic Dependency Updates

**Feature Branch**: `011-auto-dependency-updates`

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description (translated from Dutch): "Is it possible to automatically merge
non-breaking Dependabot updates into main? I want this environment to always be secure."

## Context

Since 001, Dependabot proposes weekly updates for npm packages and pipeline actions, grouped into
one pull request per ecosystem. Every proposal waits for the owner to merge it, majors and patches
alike. Updates that would never break anything wait as long as risky ones, and a security fix
can sit unmerged for days.

At the same time, nothing tells the owner when a dependency already on main becomes vulnerable.
Vulnerability alerts, security update proposals and secret scanning were switched off, and the
quality gate does not check for known vulnerabilities. An advisory published on a quiet week goes
unnoticed until the next change.

The site's existing gate already decides whether a change is safe: tests, accessibility, budgets
and links on the exact build that ships. This feature lets that gate, not a person, approve the
routine updates. People keep the decisions that need judgement, and the gate watches for new
vulnerabilities even when nothing changes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Non-breaking updates land on main without manual work (Priority: P1)

Sander (the owner) no longer merges patch and minor updates by hand. When Dependabot proposes one
and the quality gate passes, the update is merged into main automatically.

**Why this priority**: this is the request; it removes the routine and shortens the time a known
fix waits.

**Independent Test**: a Dependabot pull request with a patch or minor update is merged without any
human action once the quality gate is green; a pull request whose gate fails stays open.

**Acceptance Scenarios**:

1. **Given** a Dependabot pull request with only patch or minor updates, **When** the quality gate
   passes, **Then** the pull request is merged into main without human action.
2. **Given** such a pull request, **When** the quality gate fails, **Then** it stays open and is
   not merged.
3. **Given** a security update from Dependabot that is a patch or minor update, **When** the gate
   passes, **Then** it is merged the same way.
4. **Given** a pull request that was not opened by Dependabot, **When** it passes the gate,
   **Then** it is not merged automatically.

---

### User Story 2 - Breaking updates stay a human decision (Priority: P1)

Major updates, which may break the build or change behaviour, keep waiting for Sander's review.

**Why this priority**: auto-merging a breaking change would trade safety for convenience; the
owner chose patch and minor only.

**Independent Test**: a Dependabot pull request containing a major update is never merged
automatically, even with a green gate.

**Acceptance Scenarios**:

1. **Given** a Dependabot pull request with a major update, **When** the gate passes, **Then** it
   stays open for the owner.
2. **Given** a pull request whose update type cannot be determined, **When** the gate passes,
   **Then** it stays open (unknown is treated as breaking).
3. **Given** a week with both minor and major updates for one ecosystem, **When** Dependabot
   proposes them, **Then** the majors arrive separately, so they cannot hold back the
   non-breaking ones.

---

### User Story 3 - A known vulnerability in what the site ships blocks it (Priority: P1)

The quality gate fails when a dependency that the site is built from has a known high or critical
vulnerability. The check runs on every change and once a day on main, so a new advisory is
noticed even in a week without changes.

**Why this priority**: "always secure" means a vulnerable build never goes live and the owner
learns about new advisories without having to look.

**Independent Test**: with a shipped dependency pinned to a version that has a published high
advisory, the gate fails locally and in the pipeline; with the advisory resolved, it passes.

**Acceptance Scenarios**:

1. **Given** a shipped dependency with a known high or critical vulnerability, **When** the gate
   runs, **Then** it fails and nothing is deployed.
2. **Given** no change to the repository, **When** a day passes, **Then** the full gate runs on
   main and fails visibly if an advisory was published since the last run.
3. **Given** the same build, **When** the check runs locally or in the pipeline, **Then** the
   outcome is the same.

---

### User Story 4 - Automatically merged updates go live (Priority: P2)

An update merged by automation reaches the live site without anyone starting a deploy.

**Why this priority**: an update on main that never ships does not make the live site safer.

**Independent Test**: after an automatic merge, the live site's build reference matches main
within one day.

**Acceptance Scenarios**:

1. **Given** an automatically merged update, **When** the next daily run passes the gate,
   **Then** main is deployed.
2. **Given** a daily run whose gate fails, **When** it finishes, **Then** nothing is deployed and
   the live site stays on the last passing build.

---

### User Story 5 - New releases wait a few days before they are proposed (Priority: P2)

Version updates are proposed only after a release has been public for 3 days. Security updates
are exempt and arrive at once.

**Why this priority**: hijacked package releases are usually detected and withdrawn within days;
waiting avoids merging one automatically.

**Independent Test**: the update configuration declares a 3-day waiting period for version updates
of both ecosystems.

**Acceptance Scenarios**:

1. **Given** a package released today, **When** Dependabot checks for updates, **Then** it is not
   proposed until 3 days have passed.
2. **Given** a security fix released today, **When** a vulnerability alert exists, **Then** the
   update is proposed without waiting.

---

### User Story 6 - Updates that fall behind main catch up by themselves (Priority: P3)

Main must be up to date in a pull request before it can merge. An approved update that has fallen
behind (because something else merged first) is brought up to date and checked again, without
human action.

**Why this priority**: without it, an occasional update waits for a manual click; rare, but it
breaks "without manual work".

**Independent Test**: an update pull request with automatic merging enabled that is behind main is
updated and re-checked within one day and then merges if the gate passes.

**Acceptance Scenarios**:

1. **Given** an update pull request that is approved for automatic merging and behind main,
   **When** the daily catch-up runs, **Then** it is brought up to date and the gate runs again.
2. **Given** npm and pipeline-action updates, **When** Dependabot proposes them, **Then** they
   arrive on different weekdays, so they rarely wait on each other.

### Edge Cases

- A grouped update containing several packages: it merges automatically only if every update in
  it is patch or minor.
- A vulnerability with no fix available in a shipped dependency: the gate fails and stays failing
  until the owner resolves it (update, replace or explicitly accept); there is no silent bypass.
- Vulnerabilities in development-only tooling (never shipped to visitors): reported through
  vulnerability alerts and fixed through Dependabot's security updates, but they do not block the
  gate.
- A daily run fails for a reason unrelated to dependencies (for example a flaky measurement): the
  live site stays on the last passing build and the owner is notified, as for any failed run.
- The existing exclusions (TypeScript 6.1 and later, major `@types/node` updates) keep applying.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Pull requests opened by Dependabot for this repository whose updates are all patch or
  minor, version and security updates alike, MUST be merged into main automatically once every
  required check passes.
- **FR-002**: Major updates, updates whose type cannot be determined, and pull requests not opened
  by Dependabot MUST NOT be merged automatically.
- **FR-003**: Automatic merging MUST NOT bypass or weaken the required quality gate or the rule
  that a pull request must be up to date with main.
- **FR-004**: The automation MUST use only the permissions it needs, MUST NOT execute code from the
  pull request it acts on, and MUST NOT introduce new long-lived credentials.
- **FR-005**: Version updates MUST be proposed only after a release has been public for 3 days;
  security updates MUST NOT wait.
- **FR-006**: Patch and minor updates MUST be grouped per ecosystem, majors MUST be proposed
  separately, and the existing exclusions MUST be kept.
- **FR-007**: npm and pipeline-action updates MUST be proposed on different weekdays.
- **FR-008**: The quality gate MUST fail when a shipped dependency has a known vulnerability of high
  or critical severity; the local check command MUST run the same check.
- **FR-009**: The full quality gate MUST run on main once a day, and main MUST be deployed when it
  passes.
- **FR-010**: Once a day, update pull requests that are approved for automatic merging but behind
  main MUST be brought up to date and checked again.
- **FR-011**: The README MUST describe the dependency update policy: what merges automatically,
  what waits for the owner, and how vulnerabilities are caught.

### Key Entities

- **Update proposal**: a pull request from Dependabot; has an ecosystem, an update type (patch,
  minor, major or unknown), a kind (version or security) and a state relative to main (current or
  behind).
- **Merge policy**: patch and minor merge automatically after the gate; everything else waits for
  the owner.
- **Vulnerability check**: per build, the known high and critical vulnerabilities in shipped
  dependencies; any finding fails the gate.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A patch or minor update with a green gate needs 0 human actions to reach main.
- **SC-002**: 0 major updates reach main without the owner's merge.
- **SC-003**: 0 deploys contain a shipped dependency with a known high or critical vulnerability at
  the time of the deploy.
- **SC-004**: A newly published high or critical advisory against a shipped dependency fails a
  pipeline run within 24 hours, without any repository change.
- **SC-005**: An automatically merged update is live within 24 hours of merging.
- **SC-006**: The feature adds 0 stored secrets or personal access tokens.

## Assumptions

- The repository's security features (vulnerability alerts, Dependabot security updates, secret
  scanning with push protection), the "allow auto-merge" and "allow update branch" settings and
  automatic branch deletion after merge were enabled by the owner's decision on 2026-10-11, before
  this spec; this feature builds on them and does not change repository settings.
- "Shipped dependencies" are the production dependencies the site is built from; development tooling
  (test runners, Lighthouse, linters) never reaches visitors.
- "Known vulnerability" means a published advisory in the npm registry's advisory database, the same
  source Dependabot's alerts use.
- A merge performed by the pipeline's own credentials does not start a new pipeline run on main;
  the daily run therefore carries automatically merged updates to the live site.
- A failed scheduled run notifies the owner through GitHub's standard notifications.
- GitHub pauses scheduled runs in public repositories after 60 days without activity; weekly
  dependency merges keep the repository active.
