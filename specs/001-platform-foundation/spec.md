# Feature Specification: Platform Foundation

**Feature Branch**: `001-platform-foundation`

**Created**: 2026-10-09

**Status**: Draft

**Input**: User description: "Walking skeleton for the personal profile site: a bilingual (English/Dutch)
developer-portal shell that introduces Sander Ettema, published to GitHub Pages through a gated
CI/CD pipeline from day one. Work fully test-driven. Every later section of the site (career,
method, leadership README, writing, projects, playground, scorecard) is built on top of this
foundation in its own spec."

## Context

The site serves three audiences: platform and DevOps leaders (peers), IT directors and CTOs
(decision-makers), and engineers who might want to work for Sander. Its visual metaphor is an
internal developer portal in which Sander is the catalog entity. This first feature delivers the
smallest version of that portal that is real, public and protected by the same quality gates
every later feature will pass through.

Later features, each in its own spec, are out of scope here: catalog overview with photo and key
numbers, career history, method ("golden paths"), "How I lead" README, writing excerpts,
open-source projects, interactive playground, and the live scorecard.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recognise who this is (Priority: P1)

A visitor follows a link to the site. Within seconds they see whose site it is, the one-line
idea that defines Sander's work, and how to reach him, inside a layout that reads as a developer
portal.

**Why this priority**: without this the site has no reason to exist; it is the smallest slice
that is useful to every audience.

**Independent Test**: open the home page on a phone-sized and a desktop-sized screen and confirm
that name, headline and contact link are visible without scrolling, inside the portal layout.

**Acceptance Scenarios**:

1. **Given** a visitor opens the site root, **When** the page loads, **Then** they see Sander's
   name, his role line, his headline statement and a link to his LinkedIn profile, in English.
2. **Given** a visitor on a 360 px wide screen, **When** the home page loads, **Then** name,
   headline and the LinkedIn link are visible without scrolling and the page does not scroll
   horizontally.
3. **Given** any page, **When** it loads, **Then** it shows the portal layout: a header with the
   site identity, a primary navigation, the main content area and a footer.

---

### User Story 2 - Changes reach production only through the gate (Priority: P1)

Sander (the owner) proposes a change in a pull request. Automated checks verify tests, types,
code style, accessibility, performance budgets, links, traceability and translations. Only a
change that passes every check can be merged, and once merged it goes live without manual steps.

**Why this priority**: the constitution requires that every later feature is built and shipped
through this gate; it has to exist before anything else is added. It is also a core part of what
the site demonstrates.

**Independent Test**: open a pull request that breaks one rule (for example a failing test) and
confirm it cannot be merged; fix it, merge, and confirm the change is live without further action.

**Acceptance Scenarios**:

1. **Given** a pull request to `main`, **When** it is opened or updated, **Then** every quality
   check runs and its outcome is reported on the pull request.
2. **Given** a pull request in which any check fails, **When** the owner tries to merge, **Then**
   merging is blocked.
3. **Given** a change merged into `main` that passes every check, **When** the pipeline finishes,
   **Then** the new version is live on the public site.
4. **Given** a push to `main` in which a check fails, **When** the pipeline runs, **Then** nothing
   is deployed and the previously live version stays online.
5. **Given** a fresh clone, **When** a contributor installs dependencies and runs the single
   documented check command, **Then** the same checks run locally as in the pipeline.

---

### User Story 3 - Read the site in Dutch (Priority: P2)

A Dutch-speaking visitor switches the language and stays on the equivalent page, fully in Dutch.

**Why this priority**: the primary market is the Netherlands, but the site is usable in English
alone, so this comes after the two P1 stories.

**Independent Test**: from any English page, use the language switch and confirm the
equivalent Dutch page opens with all interface text in Dutch, and back again.

**Acceptance Scenarios**:

1. **Given** a visitor on an English page, **When** they choose Dutch in the language switch,
   **Then** the equivalent Dutch page opens and all visible interface text is Dutch.
2. **Given** a visitor on a Dutch page, **When** they choose English, **Then** the equivalent
   English page opens.
3. **Given** any page, **When** a search engine or assistive technology reads it, **Then** the
   page declares its language and points to its counterpart in the other language.

---

### User Story 4 - Use the site in any way that suits the visitor (Priority: P2)

A visitor who navigates by keyboard, uses a screen reader, or has dark mode enabled can use
every part of the site comfortably.

**Why this priority**: accessibility is a constitutional requirement and cheapest to get right
in the shell that every page shares.

**Independent Test**: navigate every page by keyboard only, with the system set to light and to
dark mode, and run an automated accessibility check on each.

**Acceptance Scenarios**:

1. **Given** a keyboard user on any page, **When** they press Tab first, **Then** a "skip to
   content" link appears and moves focus to the main content.
2. **Given** a visitor whose system prefers a dark colour scheme, **When** any page loads,
   **Then** it renders in dark colours from the first paint, without a flash of light colours.
3. **Given** any page in either language and either colour scheme, **When** an automated
   accessibility check runs, **Then** it reports zero violations.

---

### User Story 5 - Recover from a wrong address (Priority: P3)

A visitor follows a broken or mistyped link and lands on a helpful page instead of a generic
error.

**Why this priority**: rare, but a portal that fails gracefully supports the craft story.

**Independent Test**: open a non-existent address and confirm the not-found page shows in both
languages with links back to both home pages.

**Acceptance Scenarios**:

1. **Given** a non-existent address, **When** a visitor opens it, **Then** a not-found page
   explains the problem in English and Dutch and links to both home pages.

---

### User Story 6 - See how this site is built (Priority: P3)

A curious engineer wants to look under the hood: which version is live, where the source is,
and that it was built from specs.

**Why this priority**: a seed for the later scorecard feature; small, but it makes the
"site as a platform" claim verifiable from the first release.

**Independent Test**: on any page, find in the footer the identifier of the deployed version and
links to the source repository and the specifications, and confirm they lead to the right places.

**Acceptance Scenarios**:

1. **Given** any page, **When** a visitor looks at the footer, **Then** they see a short
   identifier of the deployed version that links to that exact version of the source.
2. **Given** any page, **When** a visitor looks at the footer, **Then** they find links to the
   source repository and to the specifications folder.

### Edge Cases

- A visitor whose browser prefers Dutch opens the site root: the English page is shown (no
  automatic redirect); the language switch is visible without scrolling.
- A page exists in one language only: the build fails, so this cannot reach production.
- The page is opened with JavaScript disabled: every requirement in this feature still works.
- A section listed in the navigation does not exist yet: it is not listed; the navigation only
  contains pages that exist.
- The deploy step fails after the checks passed: the previously live version stays online and
  the failure is visible in the pipeline.
- The site is viewed at 200% zoom or on a 320 px wide screen: content reflows without horizontal
  scrolling.

## Requirements *(mandatory)*

### Functional Requirements

**Identity and shell**

- **FR-001**: The site root MUST show, in English, Sander Ettema's name, his role line, his
  headline statement and a link to his LinkedIn profile (`https://www.linkedin.com/in/sanderettema/`).
- **FR-002**: Every page MUST use the shared portal layout: a header with the site identity, a
  primary navigation, a single main content region and a footer.
- **FR-003**: Every page MUST start with a "skip to content" link that becomes visible on focus
  and moves focus to the main content region.
- **FR-004**: The primary navigation MUST be generated from the list of pages that exist, MUST
  NOT link to pages that do not exist, and MUST mark the current page.
- **FR-005**: Every page MUST follow the visitor's system colour-scheme preference (light or
  dark) from the first paint, without client-side scripting.
- **FR-006**: Every page MUST have a unique title and a meta description in its own language,
  plus social-sharing metadata (title, description, type, URL, locale).

**Bilingual**

- **FR-007**: Every English page MUST have a Dutch counterpart under the `/nl/` path with the
  same content in Dutch, and vice versa.
- **FR-008**: Every page MUST contain a language switch that links to its counterpart page and
  marks the current language.
- **FR-009**: Every page MUST declare its language and reference both language versions and its
  own canonical address in its metadata.
- **FR-010**: The build MUST fail when an interface string or page is missing in either
  language.

**Not found**

- **FR-011**: Requests for non-existent addresses MUST show a not-found page with text in both
  languages and links to both home pages, using the portal layout.

**Under the hood**

- **FR-012**: Every page footer MUST show the short identifier of the deployed source version,
  linked to that version in the public repository, and links to the repository and to its
  `specs/` folder.

**Privacy**

- **FR-013**: Pages MUST NOT set cookies, load analytics or trackers, or request any resource
  from another origin.

**Pipeline**

- **FR-014**: Every pull request to `main` and every push to `main` MUST run the quality gate:
  unit tests, end-to-end tests, type checking, linting, formatting, accessibility checks, the
  performance and JavaScript budgets defined in the constitution, internal link checking, the
  traceability check and the translation check.
- **FR-015**: A pull request MUST NOT be mergeable into `main` unless every quality-gate check
  has passed.
- **FR-016**: After the quality gate passes on `main`, the site MUST be deployed to GitHub Pages
  automatically; if any check or the build fails, nothing MUST be deployed.
- **FR-017**: The repository MUST provide one documented command that runs the same quality
  gate locally as the pipeline does.
- **FR-018**: The traceability check MUST fail when a page or code file references a
  requirement or task ID that does not exist in the corresponding spec or task list.
- **FR-019**: The pipeline MUST publish, for every run, a summary of each check's outcome and
  the measured budget scores, and MUST keep the measured scores as a downloadable,
  machine-readable result.
- **FR-020**: Pipeline definitions MUST grant only the permissions each job needs and MUST pin
  every third-party action to a full commit identifier; a test MUST fail otherwise.
- **FR-021**: The repository MUST receive automated weekly update proposals for its
  dependencies and pipeline actions.

### Key Entities

- **Page**: a route that exists in both languages; has a title, description, language and a
  counterpart; appears in the navigation when it is a top-level section.
- **Interface string**: a piece of user-facing text with an English and a Dutch value.
- **Quality gate result**: the outcome of one pipeline run: each check with pass/fail and the
  measured budget scores per page.
- **Build identity**: the short identifier and link of the source version that is live.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a 360 px wide screen, a first-time visitor can see whose site it is, the
  headline and the way to make contact without scrolling.
- **SC-002**: 100% of pages exist in both languages, and switching language takes one action
  and lands on the equivalent page.
- **SC-003**: Automated accessibility checks report zero violations on 100% of pages, in both
  languages and both colour schemes.
- **SC-004**: Every page scores at or above the constitution's performance, accessibility,
  best-practice and search budgets on a simulated mid-range mobile device.
- **SC-005**: A change merged into `main` is live on the public site within 10 minutes without
  any manual step.
- **SC-006**: 100% of production deployments come from runs in which every check passed; a
  deliberately failing pull request is shown to be blocked from merging.
- **SC-007**: From a fresh clone, a contributor runs the full local quality gate with at most
  two commands.
- **SC-008**: Loading any page makes zero requests to other origins and sets zero cookies.

## Assumptions

- The site is published at `https://sammieetje.github.io/` from the public repository
  `SammieEtje/sammieetje.github.io`; a custom domain is out of scope.
- The role line and headline come from Sander's approved public positioning: role "Platform
  transformation in highly regulated contexts" and headline "People take the path of
  least resistance. I build environments where the right thing is the easy thing — together."
  The Dutch versions are translations of these.
- English is served at the root; Dutch under `/nl/`. There is no automatic language redirect,
  because that would need client-side scripting or cookies; search engines and the switch guide
  visitors instead.
- A manual light/dark toggle is out of scope for this feature; the system preference is
  followed.
- The navigation contains only the home page ("Overview") in this feature; later features add
  their sections.
- The owner is the only person who merges pull requests; branch protection on `main` enforces
  the gate.
