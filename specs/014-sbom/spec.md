# Feature Specification: Software Bill of Materials

**Feature Branch**: `014-sbom`

**Created**: 2026-10-24

**Status**: Draft

**Input**: User description: "Software bill of materials (SBOM) per build. Every pipeline run
generates an SBOM of the site's dependencies as a standard step of the golden path, in a standard
format (CycloneDX), so the question "do we ship component X, and in which version?" is answered by
a query instead of by asking around. On main, the SBOM ships with the site at a stable public URL
next to the quality report, so visitors can inspect what the site is built from. The quality gate
fails if the SBOM cannot be generated or is incomplete. The site shows where to find it."

## Context

When a critical vulnerability in a widely used component becomes public, the first question is
"where do we use it, and which version?". Organisations that can answer it with a query patch in
minutes; the rest ask every team and wait. A software bill of materials (SBOM), generated for every
build, is the standard way to make that answer a query. European rules are moving the same way: the
Cyber Resilience Act will require manufacturers to maintain one.

The site already checks every build for known vulnerabilities in what it ships (011), but it keeps
no record of what a build contained. Once a build is replaced, nobody can say which component
versions it carried, and a visitor cannot see what the site is built from. This feature adds that
record to the golden path, publishes it with the site, and lets the gate refuse a build whose record
is missing or incomplete.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every build produces a bill of materials (Priority: P1)

Sander (the owner) gets an SBOM for every pipeline run, in a standard format any SBOM tool can read.
When a vulnerability in some component becomes public, he answers "do we ship it, and which
version?" from that file without reading lock files by hand.

**Why this priority**: this is the core of the request; without the file, nothing else in this
feature exists.

**Independent Test**: run the pipeline (or the local check) on any change; the run produces one SBOM
file in the standard format that lists every shipped component with its exact version, and a query
for a known component returns its version.

**Acceptance Scenarios**:

1. **Given** any change, **When** the quality gate runs, **Then** it produces one SBOM for exactly the
   build it checked.
2. **Given** the SBOM of a run, **When** someone looks up a component the site ships, **Then** it is
   listed with its exact installed version and a package identifier that vulnerability databases use.
3. **Given** the same commit, **When** the check runs locally or in the pipeline, **Then** both
   produce an SBOM with the same components and versions.

---

### User Story 2 - The gate refuses a build without a complete bill of materials (Priority: P1)

A build whose SBOM cannot be generated, is not valid in the standard format, or leaves out a
component the site ships, fails the quality gate and is not deployed.

**Why this priority**: a record that is sometimes missing or incomplete cannot be relied on; the
gate makes the record as dependable as the tests.

**Independent Test**: break generation, or remove a shipped component from the SBOM; the gate fails
locally and in the pipeline, and the summary names the SBOM check as the cause.

**Acceptance Scenarios**:

1. **Given** a run in which the SBOM cannot be generated, **When** the gate evaluates it, **Then**
   the gate fails and nothing is deployed.
2. **Given** an SBOM that does not list every shipped component with a version, **When** it is
   checked, **Then** the gate fails and names what is missing.
3. **Given** an SBOM that is not valid in the standard format, **When** it is checked, **Then** the
   gate fails.
4. **Given** a passing run, **When** its summary is read, **Then** it shows the SBOM check with its
   outcome and the command to run it locally.

---

### User Story 3 - Visitors can inspect what the live site is built from (Priority: P2)

On main, the SBOM of the deployed build ships with the site at a stable public address next to the
quality report. A visitor, for example an engineer or an auditor, can download it and read it in
their own tools.

**Why this priority**: publishing the record shows the practice instead of describing it; it
depends on Story 1.

**Independent Test**: after a deploy, the stable address returns the SBOM of the deployed build,
and its build reference matches the one in the published quality report.

**Acceptance Scenarios**:

1. **Given** a deploy from main, **When** a visitor requests the stable SBOM address, **Then** they
   receive the SBOM of exactly that deployed build.
2. **Given** a pull request run, **When** it finishes, **Then** its SBOM is kept with the run's
   results and nothing is published.
3. **Given** the published SBOM and the published quality report, **When** both are compared,
   **Then** they refer to the same build.

---

### User Story 4 - The site shows where to find it (Priority: P3)

The scorecard page tells visitors, in both languages, that a bill of materials exists for the live
build, what it contains, and links to it.

**Why this priority**: a file nobody can find is only half published; it is a small addition on an
existing page.

**Independent Test**: the scorecard page in English and Dutch shows a short explanation and a link
that resolves to the published SBOM.

**Acceptance Scenarios**:

1. **Given** the scorecard page in either language, **When** a visitor reads it, **Then** it explains
   in one or two sentences what the SBOM is and links to it.
2. **Given** a visitor without JavaScript, **When** they open the scorecard page, **Then** the link
   to the SBOM is still there.

### Edge Cases

- A dependency update changes a component version: the next run's SBOM lists the new version, and
  the published SBOM changes only when that build is deployed.
- A shipped component without a version or package identifier in the lock file: the SBOM check fails
  and names it, so the record never silently loses precision.
- Development tooling (test runners, linters, Lighthouse) never reaches visitors but does run in
  the pipeline: it is listed and marked as not shipped. A component used both by the site and by
  the tooling counts as shipped.
- Fonts and other self-hosted assets come from shipped packages, so they appear through those
  packages.
- The SBOM must not contain local absolute paths, machine names or other details of the machine
  that built it.
- A daily run without changes produces a fresh SBOM with the same components; only the generation
  time and build reference differ.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every run of the quality gate MUST generate one SBOM for the build it checks, in the
  CycloneDX format, as a standard step of the pipeline.
- **FR-002**: The SBOM MUST list every installed component, shipped dependencies and the
  development tooling that runs in the pipeline alike, with its exact installed version and a
  package identifier (package URL) usable for vulnerability lookups. Development tooling MUST be
  marked as not shipped, so the SBOM answers both "do we ship X?" and "does X run anywhere in our
  pipeline?".
- **FR-003**: The SBOM MUST identify the build it describes (the site, its version and the commit it
  was built from) and MUST NOT contain local absolute paths or machine-specific details.
- **FR-004**: The quality gate MUST fail when the SBOM cannot be generated, is not valid in the
  CycloneDX format, omits an installed component or its version, or marks a shipped component as
  not shipped; the failure MUST name the cause.
- **FR-005**: The local check command MUST generate and check the SBOM in the same way as the
  pipeline.
- **FR-006**: The run summary MUST show the outcome of the SBOM check and the command to run it
  locally.
- **FR-007**: Every run MUST keep its SBOM with the run's results; runs on main MUST publish it with
  the deployed site at a stable address next to the quality report.
- **FR-008**: The published SBOM and the published quality report MUST refer to the same build.
- **FR-009**: The scorecard page MUST explain, in English and Dutch, what the SBOM is and link to the
  published file, also without JavaScript.
- **FR-010**: The README MUST describe the SBOM: what it contains, where it is published and how to
  generate and check it locally.

### Key Entities

- **Bill of materials**: per build; identifies the site, version and commit; lists components.
- **Component**: a package the build contains; has a name, an exact version, a package URL and,
  where known, a licence.
- **SBOM check**: per run; passes when the SBOM is valid and complete against the installed
  dependencies, fails with a named cause otherwise.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of quality gate runs produce an SBOM; 0 deploys happen without one.
- **SC-002**: 100% of installed components appear in the SBOM with their exact version, and 100% of
  development tooling is marked as not shipped.
- **SC-003**: "Do we ship component X, and which version?" is answered from the published SBOM in
  under one minute, without access to the repository.
- **SC-004**: The published SBOM always describes the build that is live: 0 mismatches with the
  published quality report.
- **SC-005**: The feature adds 0 runtime dependencies, 0 client-side JavaScript and 0 stored secrets.

## Assumptions

- "Shipped components" are the production dependencies the site is built from, the same scope the
  vulnerability check from 011 audits. "Development tooling" is everything else that is installed
  for the pipeline. The owner chose (2026-10-24) one SBOM covering both, with tooling marked.
- The package manager's built-in SBOM generation is acceptable if it meets the requirements; the
  plan decides the tool.
- The stable address is a sibling of the published quality report, for example `/quality/sbom.json`;
  the exact path is a plan decision.
- Signing or attesting the SBOM and the build is out of scope; it is the next feature.
- Earlier builds' SBOMs do not need to stay published; the run's kept results cover recent history
  (retention is a separate feature).
