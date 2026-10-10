# Feature Specification: Plugins

**Feature Branch**: `007-plugins`

**Created**: 2026-10-10

**Status**: Draft

**Input**: User description: "Plugins: Sander's public open-source projects."

## Context

In a developer portal, plugins extend what the portal can do. On this site, "plugins" are the
side projects that keep Sander's hands on the tools: things he builds to learn how modern
delivery works from the inside, so he can lead the people who do it every day. The page shows a
curated set of his public repositories as plugin cards, and is honest about scale: these are
learning projects, not products.

Audiences: engineers check whether their future manager understands their world; peers see how a
senior leader stays technically curious; decision-makers see someone who experiments with new
ways of working (spec-driven development with an AI assistant) before asking teams to adopt them.

Out of scope: live repository statistics (009 Scorecard), private repositories, contribution
graphs.

## Clarifications

### Session 2026-10-10

- Q: Which projects appear? → A: Three: this site (`sammieetje.github.io`), `my-specdriven-app`
  and `myPool`. Not `microbit_compas`.
- Q: Is the family member's project (a fork with own contributions) shown? → A: No; it stays
  off the site and out of this repository (constitution VI: no family names).
- Q: How does the introduction frame the projects? → A: "I'm technically curious, not technically
  deep. I build side projects to understand what my teams deal with every day, and to try new
  ways of working, like spec-driven development with an AI assistant, before I ask anyone else
  to."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See what he builds (Priority: P1)

A visitor opens Plugins and sees a short framing ("why a manager still builds") and a set of
project cards, each with name, one-line purpose, what it demonstrates, main technologies, status
and a link to the repository.

**Why this priority**: the page's reason to exist.

**Independent Test**: open `/plugins/`; every selected project has a card with all fields and a
working repository link.

**Acceptance Scenarios**:

1. **Given** the page, **When** it loads, **Then** an introduction explains why Sander builds side
   projects, in at most three sentences.
2. **Given** a project card, **When** it is read, **Then** it shows name, purpose, what it
   demonstrates, technologies, lifecycle status and a link to the repository.
3. **Given** a project with a live page, **When** its card is shown, **Then** it also links to the
   live page.

---

### User Story 2 - Recognise the way of working (Priority: P2)

A visitor sees which projects follow the spec-driven way of working of this site and can jump to
its specifications.

**Why this priority**: connects the side projects to the site's own showcase.

**Independent Test**: spec-driven projects are marked and link to their specifications folder.

**Acceptance Scenarios**:

1. **Given** a spec-driven project, **When** its card is shown, **Then** it carries a "spec-driven"
   marker and a link to its specifications.

---

### User Story 3 - Find it, read it in Dutch (Priority: P2)

**Why this priority**: constitution VII and findability.

**Independent Test**: navigation lists "Plugins — what I build"; `/nl/projecten/` shows the same
in Dutch.

**Acceptance Scenarios**:

1. **Given** any page, **When** the visitor opens the navigation, **Then** "Plugins — what I build"
   (NL: "Plugins — wat ik bouw") is listed and marked current on this page.

### Edge Cases

- A project's repository disappears or is renamed: the link check does not crawl external links;
  repository URLs are validated for shape and uniqueness only.
- Forks without own work are never shown as own projects.
- Projects involving family members are shown only as clarified.
- Volatile numbers (stars, commit counts) are not shown; they go stale without a live source.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST have a Plugins page at `/plugins/` (EN) and `/nl/projecten/` (NL).
- **FR-002**: The page MUST open with an introduction of at most three sentences on why Sander
  builds side projects.
- **FR-003**: The page MUST show one card per selected project with name, purpose, what it
  demonstrates, technologies, lifecycle status (`production`, `experimental` or `archived`) and a
  repository link; projects with a live page MUST also link to it.
- **FR-004**: Spec-driven projects MUST carry a "spec-driven" marker and link to their
  specifications folder.
- **FR-005**: Exactly the three repositories selected in clarification MUST appear; forks and the
  family member's project MUST NOT appear.
- **FR-006**: The page MUST appear in the navigation with term and subtitle in both languages, and
  have its own title, description and sharing metadata.

### Key Entities

- **Project**: id, name, repository URL, live URL (optional), purpose, demonstrates, technologies,
  lifecycle, spec-driven flag with specs URL, started year; text per language.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of selected projects have a complete card; 0 unselected repositories appear.
- **SC-002**: Every repository is reachable in one action.
- **SC-003**: Constitution budgets hold with zero client-side JavaScript.

## Assumptions

- Candidates (public, own work): this site; `my-specdriven-app` (spec-driven to-do demo, 57
  commits, quality gate); `myPool` (F1 betting pool, Django, 203 commits, CI/CD);
  `microbit_compas` (MakeCode tutorial, live at `sammieetje.github.io/microbit_compas/`).
  One further fork carries own commits and merged pull requests on a family member's project.
  Home Assistant repositories are forks without own commits.
- The selection and the framing are confirmed in clarification.
