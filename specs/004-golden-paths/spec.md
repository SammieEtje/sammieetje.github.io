# Feature Specification: Golden Paths

**Feature Branch**: `004-golden-paths`

**Created**: 2026-10-10

**Status**: Draft

**Input**: User description: "Golden paths: Sander's method in depth — the premise (people take
the path of least resistance), the two levers, the four assumptions, the recurring phases,
compliance as a platform property, and the behavioural science underneath."

## Context

In a developer portal, a golden path is the supported, easiest route to doing the right thing.
Sander's method is the same idea applied to organisations: design the environment so that the
right thing is the easy thing. This page explains the method on one page, in the portal's
vocabulary, with links to where it was proven.

Audiences: peers want concrete patterns they can apply; decision-makers want to see that there is
a credible alternative to mandates; engineers want to know what it is like to work in an
environment designed this way.

Out of scope: an interactive model (008 Playground), individual writing (006), the "How I lead"
README (005).

## Clarifications

### Session 2026-10-10

- Q: How do the phases relate to compliance? → A: Keep the four phases from 003 (consolidate,
  stabilise, design the environment, grow the community). Compliance is a property built into
  "design the environment" and gets its own four-step section; 003 is not retagged.
- Q: How does the science section handle the "90% of decisions" (Kahneman) and "ADKAR leaves 80%
  unused" figures? → A: No numbers, same message: "most everyday decisions are made fast and
  automatically (System 1)"; "ADKAR addresses only the conscious, individual layer of behaviour
  change".
- Q: How is assumption 3 worded? → A: Keep "People are inherently lazy", with the subtitle "Not a
  judgement, a design constraint: people take the path of least resistance."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Get the idea in one minute (Priority: P1)

A visitor opens the method page and, at the top, reads the premise and the one-line principle:
people take the path of least resistance, so make the right thing the easy thing.

**Why this priority**: if the premise does not land, nothing below it will be read.

**Independent Test**: open `/method/`; the premise and principle are the first content, readable
in under a minute, with a simple visual of the two paths.

**Acceptance Scenarios**:

1. **Given** the method page, **When** it loads, **Then** the first section states the premise, the
   principle and why most transformations fail (they assume people change because they are
   convinced or told to).
2. **Given** the first section, **When** it is shown, **Then** a static diagram contrasts the
   desired path and the current habit, labelled in the page language and described for screen
   readers.

---

### User Story 2 - See the two levers (Priority: P1)

A visitor sees what Sander actually does: lower the resistance on the desired route and raise it
on the undesired route, with concrete instruments for each, plus the pragmatism rule.

**Why this priority**: this is the "how" peers come for; it turns a slogan into an approach.

**Independent Test**: on `/method/`, two lever cards list their instruments; the pragmatism rule
is stated.

**Acceptance Scenarios**:

1. **Given** the levers section, **When** it is read, **Then** "lower resistance on the right path"
   lists knowledge, self-service tooling, community, visible value; "raise resistance on the
   wrong path" lists accountability, compliance burden off-path, no support off-path.
2. **Given** the levers section, **When** it is read, **Then** the pragmatism rule is stated: if a
   team deviates but stays compliant and is not more expensive, learn from them.

---

### User Story 3 - Know the assumptions behind every decision (Priority: P1)

A visitor reads the four assumptions that guide every platform decision, each with what it
changes in practice.

**Why this priority**: the assumptions are what makes the method distinctive and what tells
engineers how they will be treated.

**Independent Test**: on `/method/`, four assumptions appear, each with a short "in practice"
line.

**Acceptance Scenarios**:

1. **Given** the assumptions section, **When** it is read, **Then** it lists, in order: users are
   skilled engineers with good intentions; learning requires room to fail safely; people are
   inherently lazy (take the path of least resistance); with great freedom comes great
   responsibility — each with one "in practice" consequence.

---

### User Story 4 - Follow the phases and the proof (Priority: P2)

A visitor sees the recurring phases as a golden-path "template", with compliance built into the
platform, and can jump from each phase to releases in the deployment history where it shows.

**Why this priority**: connects the method to evidence; decision-makers want proof, peers want
sequence.

**Independent Test**: on `/method/`, each phase lists at least one linked release from 003; each
link lands on that release.

**Acceptance Scenarios**:

1. **Given** the phases section, **When** it is read, **Then** each phase has an explanation and
   links to the releases tagged with it in the deployment history.
2. **Given** a release link, **When** it is followed, **Then** the deployment history opens at that
   release.
3. **Given** the compliance section, **When** it is read, **Then** it explains compliance as a
   built-in platform property in four steps.

---

### User Story 5 - Check the science underneath (Priority: P3)

A curious visitor sees which behavioural-science models the method builds on, presented as the
page's "dependencies", each with a one-line takeaway and no unsourced statistics.

**Why this priority**: credibility for sceptical readers; a distinctive touch, but not essential.

**Independent Test**: on `/method/`, a dependencies list names each model and author with a
takeaway.

**Acceptance Scenarios**:

1. **Given** the science section, **When** it is read, **Then** each model shows its name, authors
   and one practical takeaway, without percentages that the source does not state.

---

### User Story 6 - Find it and read it in Dutch (Priority: P2)

A visitor reaches the method from anywhere — the navigation, the home About card, the
deployment-history legend — and reads it in Dutch if they prefer.

**Why this priority**: constitution VII, and the page must be reachable.

**Independent Test**: navigation lists "Golden paths — how I work"; `/nl/methode/` shows the same
in Dutch; the home About card and the deployment-history legend link to the method.

**Acceptance Scenarios**:

1. **Given** any page, **When** the visitor opens the navigation, **Then** "Golden paths — how I
   work" (NL: "Golden paths — hoe ik werk") is listed and marked current on the method page.
2. **Given** the home About card and the deployment-history legend, **When** they are read,
   **Then** each links to the method page in the page language.

### Edge Cases

- A phase has no tagged release: the quality gate fails (every phase must be proven by at least
  one release).
- The diagram fails to render or is read by a screen reader: its text alternative carries the
  same message.
- Very narrow screens: lever cards and assumption cards stack; no horizontal scrolling.
- A deep link to a release in the deployment history opens the right release even with
  JavaScript disabled.

## Requirements *(mandatory)*

### Functional Requirements

**Page and premise**

- **FR-001**: The site MUST have a method page at `/method/` (EN) and `/nl/methode/` (NL).
- **FR-002**: The first section MUST state the premise, the principle "make the right thing the
  easy thing" and the diagnosis of why transformations fail.
- **FR-003**: The first section MUST include a static diagram of the desired path versus the
  current habit, with labels in the page language and a text alternative; no client-side script.

**Levers**

- **FR-004**: The page MUST show two lever cards (lower resistance on the right path; raise
  resistance on the wrong path), each listing its instruments, and state the pragmatism rule.

**Assumptions**

- **FR-005**: The page MUST list the four assumptions in the agreed order, each with one "in
  practice" consequence.

**Phases, compliance, proof**

- **FR-006**: The page MUST present the recurring phases (the same set and names as the
  deployment-history legend), each with an explanation and links to every release tagged with
  that phase.
- **FR-007**: Every release in the deployment history MUST be addressable by a stable link that
  scrolls to it, without scripting.
- **FR-008**: The page MUST explain compliance as a built-in platform property in four steps.

**Science**

- **FR-009**: The page MUST list the behavioural-science models it builds on, each with name,
  authors and a one-line takeaway, and MUST NOT contain any percentage or other statistic about
  behaviour (clarified: same message, no numbers).

**Findability**

- **FR-010**: The method MUST appear in the navigation with term and subtitle in both languages,
  and have its own title, description and sharing metadata.
- **FR-011**: The home About card and the deployment-history legend MUST link to the method page.

### Key Entities

- **Lever**: direction (lower / raise), title, instruments, per language.
- **Assumption**: order, statement, "in practice" consequence, per language.
- **Phase**: reused from 003 (id, name, explanation) plus the releases tagged with it.
- **Compliance step**: order, text, per language.
- **Model ("dependency")**: name, authors, takeaway, per language.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The premise and principle are readable without scrolling on a 1280 × 800 screen.
- **SC-002**: 100% of phases link to at least one release, and 100% of those links land on the
  right release.
- **SC-003**: Zero statistics on the page lack a basis in the cited source.
- **SC-004**: Constitution budgets hold with zero client-side JavaScript.
- **SC-005**: The method is reachable in one action from every page.

## Assumptions

- Content comes from Sander's approved positioning (vault: Kernpositionering, Content Pilaren,
  the published post "Four assumptions").
- The phases are the four from 003; compliance lives inside "design the environment".
- "People are inherently lazy" is Sander's own published wording; the page pairs it with "take
  the path of least resistance" so it is not read as a moral judgement.
- The 003 post-merge check (LinkedIn preview of `/career/`) passed on 2026-10-10 and is recorded
  in this feature's polish.
