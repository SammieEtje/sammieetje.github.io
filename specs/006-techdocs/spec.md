# Feature Specification: TechDocs

**Feature Branch**: `006-techdocs`

**Created**: 2026-10-10

**Status**: Draft

**Input**: User description: "TechDocs: Sander's writing, grouped by content pillar, with short
excerpts that link to the full articles on LinkedIn." Ten published article URLs provided.

## Context

In a developer portal, TechDocs is where the documentation lives. On this site it is where
Sander's thinking lives: ten published LinkedIn articles (March–June 2026), grouped by the
content pillars of his positioning, each with a short excerpt and a link to the full article.
The site does not republish the articles; LinkedIn stays the place to read, react and follow.

Audiences: peers want the depth; decision-makers want a quick sense of his point of view;
engineers want to know how he thinks before they talk to him.

Out of scope: projects (007), playground (008), scorecard (009). No comments, no newsletter, no
full-text copies.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse the writing by theme (Priority: P1)

A visitor opens TechDocs and sees the articles grouped under the content pillars, each pillar
introduced in one sentence, each article with its title, date, reading time and a short excerpt.

**Why this priority**: the grouping turns a list of posts into a coherent point of view.

**Independent Test**: open `/writing/`; every published article appears exactly once, under its
pillar, with title, date, reading time and excerpt.

**Acceptance Scenarios**:

1. **Given** the TechDocs page, **When** it loads, **Then** each pillar with articles is a section
   with a title and a one-sentence introduction.
2. **Given** a pillar section, **When** it is read, **Then** its articles are listed newest first,
   each with title, publication date, reading time and an excerpt of one or two sentences.
3. **Given** the ten provided articles, **When** the page is built, **Then** each appears exactly
   once.

---

### User Story 2 - Read the full article (Priority: P1)

A visitor picks an article and reads it on LinkedIn.

**Why this priority**: the page exists to send readers to the articles.

**Independent Test**: every article card links to its LinkedIn URL; the link says it opens
LinkedIn.

**Acceptance Scenarios**:

1. **Given** an article card, **When** the visitor activates its title, **Then** the LinkedIn
   article opens.
2. **Given** an article link, **When** a screen reader announces it, **Then** the accessible name
   includes the title and indicates that it is on LinkedIn.

---

### User Story 3 - Follow a series (Priority: P2)

A visitor recognises that five articles form one series and can read them in order.

**Why this priority**: the five-part series on running a platform as a product is the deepest
material; reading it out of order loses the argument.

**Independent Test**: the five series articles show "Part n of 5" and the series name.

**Acceptance Scenarios**:

1. **Given** a series article, **When** its card is shown, **Then** it displays the series name and
   its part number out of the total.

---

### User Story 4 - Find it, read it in Dutch (Priority: P2)

**Why this priority**: constitution VII, and findability.

**Independent Test**: navigation lists "TechDocs — what I write"; `/nl/schrijven/` exists with
Dutch pillar names, introductions and excerpts; article titles remain in English and are marked
as English.

**Acceptance Scenarios**:

1. **Given** any page, **When** the visitor opens the navigation, **Then** "TechDocs — what I
   write" (NL: "TechDocs — wat ik schrijf") is listed.
2. **Given** the Dutch page, **When** it is read, **Then** pillar names, introductions, excerpts and
   dates are Dutch; article titles stay in their original English and are marked `lang="en"`.

### Edge Cases

- A pillar without published articles: handled as decided in clarification.
- An article published late in the evening UTC: its date is shown in Dutch time (Europe/Amsterdam),
  so "8 March 23:00 UTC" shows as 9 March.
- A LinkedIn URL changes or disappears: the external link is not checked by the gate (LinkedIn
  blocks automated checks); URLs are validated for shape and uniqueness only.
- Long English titles on 320 px screens wrap without horizontal scrolling.

## Requirements *(mandatory)*

### Functional Requirements

**Page and grouping**

- **FR-001**: The site MUST have a TechDocs page at `/writing/` (EN) and `/nl/schrijven/` (NL).
- **FR-002**: Articles MUST be grouped by content pillar; each pillar section MUST have a title and
  a one-sentence introduction in the page language.
- **FR-003**: Within a pillar, articles MUST be ordered newest first.

**Articles**

- **FR-004**: Each of the ten provided articles MUST appear exactly once, with its original title
  (marked as English), publication date (Europe/Amsterdam, formatted per language), estimated
  reading time and an excerpt of at most two sentences in the page language.
- **FR-005**: Each article title MUST link to its LinkedIn URL; the accessible name MUST state that
  the link opens LinkedIn.
- **FR-006**: Articles that belong to a series MUST show the series name and "part n of total".
- **FR-007**: Excerpts MUST be original summaries, not copied passages of the articles.

**Findability**

- **FR-008**: The page MUST appear in the navigation with term and subtitle in both languages, and
  have its own title, description and sharing metadata.

### Key Entities

- **Article**: id, title (original language), URL, published date, reading time (minutes), pillar,
  series (optional: name, part, total), excerpt per language.
- **Pillar**: id, name and one-sentence introduction per language, order.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 10 of 10 provided articles appear exactly once, each under a pillar.
- **SC-002**: Every article reaches LinkedIn in one action from the page.
- **SC-003**: Constitution budgets hold with zero client-side JavaScript.
- **SC-004**: Zero excerpts exceed two sentences.

## Assumptions

- Titles and publication dates come from the public LinkedIn article metadata (checked
  2026-10-10); pillar assignment and reading times come from the vault (word counts at about 230
  words per minute, rounded up).
- The ten articles are all in English; excerpts are written in English and Dutch.
- Pillars (from the approved content strategy): the wrong image of people; the environment as
  the instrument; regulated and fast; community as the engine.
