# Feature Specification: Playground

**Feature Branch**: `008-playground`

**Created**: 2026-10-10

**Status**: Draft

**Input**: User description: "Playground: an interactive model of the path of least resistance —
the one feature that may use client-side JavaScript, within the 50 KB budget."

## Context

The method page explains "make the right thing the easy thing" in words and a static diagram.
The playground lets a visitor try it: switch the levers on and off and watch how a team's
adoption of the golden path develops over a year. It turns the method into something a sceptic
can poke at, and it shows engineering craft: a small, honest model, tested like production code,
that works without JavaScript and stays inside a strict budget.

The model is illustrative, not a forecast. It encodes the method's claims (lower resistance on
the right path, raise it on the wrong path, social influence accelerates adoption) in a few
transparent rules, and says so.

Audiences: peers and engineers explore; decision-makers see in one minute why mandates and
golden paths behave differently.

Out of scope: live pipeline metrics (009), saving or sharing scenarios, multiple teams.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Try the levers (Priority: P1)

A visitor toggles the levers from the method page and immediately sees the adoption curve over
52 weeks and a plain-language summary change.

**Why this priority**: interaction is the point of the page.

**Independent Test**: on `/playground/`, switching any lever changes the curve and the summary
without reloading the page.

**Acceptance Scenarios**:

1. **Given** the playground, **When** it loads, **Then** it shows the levers (the four that lower
   resistance on the right path and the three that raise it on the wrong path) with the default
   scenario selected, the adoption curve and a summary.
2. **Given** any lever, **When** the visitor switches it, **Then** the curve and the summary update
   within 100 ms.
3. **Given** the summary, **When** it changes, **Then** assistive technology announces it.

---

### User Story 2 - Compare a mandate with a golden path (Priority: P1)

A visitor switches on "mandate" and sees adoption jump, while the summary shows how much of it
is reluctant: people who use the platform because they must, not because it is easier.

**Why this priority**: the golden path versus golden cage distinction is the method's sharpest
point.

**Independent Test**: with weak levers and a mandate, adoption is high but the reluctant share
is high; with strong levers and no mandate, adoption is high and the reluctant share is zero.

**Acceptance Scenarios**:

1. **Given** weak levers, **When** the visitor switches on the mandate, **Then** adoption rises and
   the summary reports a reluctant share above zero.
2. **Given** strong levers and no mandate, **When** the model runs, **Then** adoption is reached
   voluntarily and the reluctant share is zero.

---

### User Story 3 - Understand the model (Priority: P2)

A curious visitor reads how the model works: its rules in plain language, its assumptions, and
a link to the source.

**Why this priority**: an unexplained model is a toy; an explained one is an argument.

**Independent Test**: on `/playground/`, a "How the model works" section lists the rules and
links to the source file in the repository.

**Acceptance Scenarios**:

1. **Given** the explanation section, **When** it is read, **Then** it states that the model is
   illustrative, lists its rules and links to its source code.

---

### User Story 4 - Works without JavaScript, findable, in Dutch (Priority: P2)

**Why this priority**: constitution IV, V and VII.

**Independent Test**: with JavaScript disabled, the page shows the default scenario's curve and
summary plus a note that interaction needs JavaScript; navigation lists "Playground — try it";
`/nl/speeltuin/` exists in Dutch; the method diagram links to the playground.

**Acceptance Scenarios**:

1. **Given** JavaScript is disabled, **When** the page loads, **Then** the default curve and summary
   are visible and the controls explain that they need JavaScript.
2. **Given** any page, **When** the visitor opens the navigation, **Then** "Playground — try it"
   (NL: "Speeltuin — probeer het") is listed.
3. **Given** the method page, **When** the visitor reads the premise, **Then** a link invites them to
   try it in the playground.

### Edge Cases

- All levers off and no mandate: adoption stays near the early adopters; the summary says so.
- Reduced motion: the curve updates without animation.
- Keyboard only: every lever and the mandate are operable and focus is visible.
- The model must give identical results at build time and in the browser (same code, no
  randomness).

## Requirements *(mandatory)*

### Functional Requirements

**Model**

- **FR-001**: The adoption model MUST be deterministic and shared between the build (default
  scenario) and the browser.
- **FR-002**: The model MUST simulate 52 weeks and return weekly adoption and, per week, the share
  of adopters who are reluctant (on the platform only because of a mandate).
- **FR-003**: Each lever that lowers resistance on the right path MUST increase final adoption or
  leave it equal, each lever that raises resistance on the wrong path MUST do the same, and
  adoption MUST never exceed 100% or drop below 0%.

**Page**

- **FR-004**: The site MUST have a playground page at `/playground/` (EN) and `/nl/speeltuin/`
  (NL) with the seven levers and a mandate switch as native, labelled controls.
- **FR-005**: The page MUST show the adoption curve (with the reluctant share distinguishable
  without relying on colour) and a summary sentence, updated on every change and announced
  politely to assistive technology.
- **FR-006**: Without JavaScript, the page MUST show the default scenario's curve and summary,
  rendered at build time, and a note that changing the scenario needs JavaScript.
- **FR-007**: The page MUST explain the model's rules in plain language, state that it is
  illustrative, and link to the model's source file.
- **FR-008**: Client-side JavaScript MUST exist only on the playground pages and stay within the
  constitution's 50 KB budget; every other page keeps zero scripts.

**Findability**

- **FR-009**: The playground MUST appear in the navigation with term and subtitle in both
  languages, have its own title, description and sharing metadata, and be linked from the method
  page's premise.

### Key Entities

- **Scenario**: the on/off state of seven levers and the mandate.
- **Result**: 52 weekly points (adoption, reluctant share), final values, and a summary.
- **Lever**: id, direction (lower / raise), label per language (from the method page).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A change to any control updates curve and summary within 100 ms on a mid-range
  device.
- **SC-002**: The playground ships at most 50 KB of compressed JavaScript; every other page ships
  0 KB.
- **SC-003**: With all levers on and no mandate, final adoption is at least 80% with 0% reluctant;
  with all levers off and a mandate, the reluctant share is at least 50%.
- **SC-004**: The page passes the accessibility checks in both languages and colour schemes, with
  and without JavaScript.

## Assumptions

- Lever names and directions come from the method page (004). The mandate is an additional
  switch, representing the top-down alternative.
- Numbers in the model are illustrative constants chosen to make the method's claims visible,
  documented in the source and on the page; they are not measurements.
