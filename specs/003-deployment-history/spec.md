# Feature Specification: Deployment History

**Feature Branch**: `003-deployment-history`

**Created**: 2026-10-10

**Status**: Draft

**Input**: User description: "Deployment history: Sander's career as a release log across
NOC\*NSF, Rabobank and TenneT. Include the sharing-card polish found after 002 (crisper on
LinkedIn)."

## Context

In a developer portal, every service has a release history: what shipped, when, and why it
mattered. This feature tells Sander's career the same way. Each role is a release with a period,
a short "release note" (context → approach → result) and tags for the recurring pattern that runs
through his work: consolidate, stabilise, design the environment, grow the community.

Audiences: decision-makers check the track record and its continuity; peers look for the pattern
and the approach; engineers see where he comes from and how he leads.

Also in scope, from the 002 follow-up: the sharing card renders soft on LinkedIn, because LinkedIn
re-compresses it. The card gets larger text, fewer elements and a high-quality JPEG.

Out of scope: method in depth (004), "How I lead" (005), writing (006).

## Clarifications

### Session 2026-10-10

- Q: What is the public description of the current role (TenneT, Manager Data & Analytics
  Platform, since 2026-05)? → A: As drafted. Summary: "Leading the team behind TenneT's Data &
  Analytics Platform: data and AI for the energy transition, with the least possible friction."
  Context: "The energy transition makes data, analytics and AI pivotal for a grid operator. Teams
  across TenneT need a platform they can trust and use without waiting." Approach: "Run the
  platform as a product: self-service by default, security and compliance built in, and a team
  that works close to its users. First: a stable team and clear ownership." Result: "In progress.
  This release is still being written." No team size.
- Q: How much detail does the release log show? → A: Group the early years. Releases:
  TenneT — Manager Data & Analytics Platform (2026-05 – present); TenneT — Manager Infrastructure,
  Integration & Cloud (2023-05 – 2026-04); TenneT — Lead Infrastructure Services (2022-01 –
  2023-04); TenneT — Lead Platform Services (2020-09 – 2022-01); Rabobank — Manager Development
  Automation (2016-10 – 2020-08); Rabobank — Manager Unix/Linux (2011-10 – 2016-10); Rabobank —
  Manager Campus LAN (2010-03 – 2011-10); Rabobank — ORMIT management trainee and IT Customer
  Services management team, grouped (2007-02 – 2010-03); NOC\*NSF — policy and knowledge
  management, grouped (2000-05 – 2007-01). Plus education: University of Twente, Public
  Governance (1993 – 2000).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scan the track record (Priority: P1)

A visitor opens the deployment history and, in one scroll, sees every role from newest to
oldest: period, title, organisation and a one-line release note.

**Why this priority**: the track record is the core proof for decision-makers and recruiters.

**Independent Test**: open `/career/`; all releases are listed newest first with period, title,
organisation and a summary line; the current role is marked as current.

**Acceptance Scenarios**:

1. **Given** the deployment history page, **When** it loads, **Then** releases are listed newest
   first, each with period, role title, organisation and a one-line summary.
2. **Given** the current role, **When** the list is shown, **Then** it is marked as current
   ("latest") and its period ends in "present".
3. **Given** each release, **When** it is shown, **Then** it carries a release label derived from
   its start date (for example `v2026.05`).

---

### User Story 2 - Read the release notes (Priority: P1)

A visitor wants more than a line: for any release they open the full release note (context,
approach, result) without leaving the page.

**Why this priority**: the "how" is what distinguishes Sander from a CV; peers come for this.

**Independent Test**: on `/career/`, open and close the release notes of any release using mouse
and keyboard; no scripting is required.

**Acceptance Scenarios**:

1. **Given** a release, **When** the visitor opens its release notes, **Then** the full text
   appears in place and can be closed again.
2. **Given** a keyboard user, **When** they tab to a release and press Enter or Space, **Then** its
   notes open; the state is announced to assistive technology.
3. **Given** JavaScript is disabled, **When** the visitor opens release notes, **Then** it still
   works.

---

### User Story 3 - See the pattern (Priority: P2)

A visitor notices that the same approach repeats in every role: each release is tagged with the
pattern phases it shows, and a short legend explains the four phases.

**Why this priority**: the repeatable pattern is Sander's positioning; making it visible turns a
list of jobs into a method.

**Independent Test**: on `/career/`, every release has at least one pattern tag; a legend explains
the four phases in the page language.

**Acceptance Scenarios**:

1. **Given** the page, **When** the visitor reads the legend, **Then** it names and explains the
   four phases: consolidate, stabilise, design the environment, grow the community.
2. **Given** a release, **When** it is shown, **Then** its pattern tags use the legend's names.

---

### User Story 4 - Read it in Dutch and find it from anywhere (Priority: P2)

The page exists in Dutch with the same content, appears in the navigation, and the home page
points to it.

**Why this priority**: constitution VII; and a page nobody can find does not exist.

**Independent Test**: from `/`, follow the navigation and the overview link to the history; switch
language; the Dutch page shows the same releases in Dutch.

**Acceptance Scenarios**:

1. **Given** any page, **When** the visitor opens the navigation, **Then** "Deployment history —
   my career" (NL: "Releasegeschiedenis — mijn loopbaan") is listed and marked current on the
   history page.
2. **Given** the home page, **When** the visitor reads the Key numbers card, **Then** it links to
   the deployment history.
3. **Given** `/career/`, **When** the visitor switches to Dutch, **Then** `/nl/loopbaan/` opens with
   the same releases in Dutch.

---

### User Story 5 - A sharper sharing card (Priority: P3)

When someone shares a page on LinkedIn, the preview card stays legible after LinkedIn
re-compresses it.

**Why this priority**: polish from the 002 post-merge check; the card works but renders soft.

**Independent Test**: the sharing images are 1200 × 630 high-quality JPEGs with larger text and
fewer elements; the page metadata points to them.

**Acceptance Scenarios**:

1. **Given** a sharing image, **When** it is generated, **Then** it is a 1200 × 630 JPEG showing
   only the photo, the name and the headline, with the headline at least 40 px high per line.
2. **Given** any page, **When** a platform reads its sharing metadata, **Then** it points to the
   JPEG in the page language.

### Edge Cases

- Roles that overlapped in the public profile (NOC\*NSF, 2005) are grouped into one release, so
  periods never overlap; ordering uses the start date.
- Very long role titles wrap on 320 px without horizontal scrolling.
- Release notes that are opened then printed: all text remains readable.
- A future role is added: only the data changes; labels, ordering and "current" marking follow.

## Requirements *(mandatory)*

### Functional Requirements

**Release log**

- **FR-001**: The site MUST have a deployment history page at `/career/` (EN) and
  `/nl/loopbaan/` (NL) listing exactly the nine releases from Clarifications, newest first.
- **FR-002**: Each release MUST show period (start – end or "present"), role title, organisation,
  location and a one-line summary in the page language.
- **FR-003**: Each release MUST show a release label `vYYYY.MM` derived from its start date.
- **FR-004**: The current role (no end date) MUST be marked as current, and there MUST be exactly
  one current role.
- **FR-005**: Each release MUST offer full release notes (context, approach, result) that open
  and close in place, operable by keyboard and without scripting, with their open state exposed
  to assistive technology.
- **FR-006**: Education MUST appear as the first entry in the log (the oldest), visually distinct
  from roles.

**Pattern**

- **FR-007**: Each role MUST carry one or more pattern tags from a fixed set of four phases;
  the page MUST include a legend naming and explaining each phase.

**Findability**

- **FR-008**: The deployment history MUST appear in the primary navigation with a portal term and
  plain subtitle in both languages, and have its own title, description and sharing metadata.
- **FR-009**: The Key numbers card on the home page MUST link to the deployment history.

**Sharing card (002 follow-up)**

- **FR-010**: Sharing images MUST be 1200 × 630 JPEGs of high quality without embedded metadata,
  showing only photo, name and headline, with the headline set at 40 px or larger.
- **FR-011**: Page sharing metadata MUST point to the JPEG in the page language.

### Key Entities

- **Release**: organisation, role title (per language), start (year-month), end (year-month or
  none), location, summary (per language), release notes (context, approach, result per
  language), pattern tags, kind (role or education).
- **Pattern phase**: id, name and one-sentence explanation per language.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All nine releases and the education entry appear, in reverse chronological order,
  in both languages, with no overlapping periods.
- **SC-002**: A visitor can reach the deployment history from any page in one action.
- **SC-003**: Every release has at least one pattern tag; the legend covers all four phases.
- **SC-004**: The page meets all constitution budgets with zero client-side JavaScript.
- **SC-005**: Sharing images are JPEG, 1200 × 630, and at most half the size of the 002 PNGs.

## Assumptions

- Career content comes from Sander's approved LinkedIn experience rewrite (vault, 2026-03), plus
  the current role since 1 May 2026, whose wording is confirmed in clarification.
- Internal HR details (grades, salary scales, performance agreements, mobility status) are never
  published.
- Location is Arnhem for TenneT and NOC\*NSF, Utrecht for Rabobank, as on LinkedIn.
- Native disclosure elements provide open/close without scripting.
