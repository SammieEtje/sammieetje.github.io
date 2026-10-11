# Feature Specification: Humanise the Site Copy

**Feature Branch**: `012-humanise-copy`

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description: "I see a lot of AI patterns in the writing of the site. Please apply
/humanise-text on all pages."

## Context

The site's copy was drafted with an AI assistant across specs 001–010. The facts are Sander's and
approved, but the sentences share a rhythm that readers recognise as machine-written:

- **Contrasts**: constructions such as "Context, not instructions", "Not more people, but a
  different way of working" and "a design problem, not a people problem" appear on almost every
  page.
- **Slogans**: one-line aphorisms such as "Bad news fast is good news" and reframes such as
  "compliance … a brake. Built into the platform, it becomes an accelerator".
- **Formula sentences**: colon summaries in the shape "X: Y, Z and W".
- **Punctuation**: em dashes.

For an audience of platform leads, IT directors and engineers, copy that sounds generated
undermines the one thing the site exists to show: that a real person with real experience wrote
it. Sander's own writing rules already forbid these patterns for his LinkedIn work. The site
should follow the same rules, in both languages.

## Clarifications

### Session 2026-10-11

- Q: Which fixed phrases must stay word for word? → A: The core message ("people take the path of
  least resistance", "make the right thing the easy thing"), "People are inherently lazy" and the
  four assumption statements as published. "Technically curious, not technically deep" (007) is
  rewritten in the same spirit, without the contrast. Chris Stapper's quote and the published
  article titles stay because they are someone else's words or already published.
- Q: How personal may the tone become? → A: Direct and plain: first person, mixed sentence
  lengths, an opinion where it fits. No invented anecdotes and no hedging words that weaken a
  leader's voice.
- Q: How does the owner review the rewritten copy? → A: A private before/after page, next to the
  pull request.
- Q: Should a test keep these patterns out from now on? → A: Yes, as a guard in the quality gate,
  with exceptions for quotes, article titles and the protected phrases.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitors read a person, not a generator (Priority: P1)

A visitor on any page, in English or Dutch, reads copy that sounds like Sander: first person,
plain, direct, sentences of varying length, with an opinion where it fits and no slogans.

**Why this priority**: this is the request; it affects every page.

**Independent Test**: every visitor-facing text on every page, in both languages, passes the
style rules (no forbidden constructions, words or em dashes), and the facts are unchanged.

**Acceptance Scenarios**:

1. **Given** any page in either language, **When** a visitor reads it, **Then** it contains no
   em dashes, none of the forbidden words, and no "not X, but Y" or "X, not Y" constructions
   outside the protected phrases.
2. **Given** a rewritten text, **When** it is compared with the original, **Then** every fact,
   number, name, date and claim is the same; nothing is added or exaggerated.
3. **Given** the Dutch and English versions of a text, **When** both are read, **Then** they say
   the same thing in natural language for each, rather than one being a literal translation.

---

### User Story 2 - Sander's signature phrases stay intact (Priority: P1)

Phrases that are Sander's brand and that he chose deliberately stay word for word.

**Why this priority**: rewriting them would erase the positioning the site is built on.

**Independent Test**: the protected phrases appear exactly as before.

**Acceptance Scenarios**:

1. **Given** the rewrite, **When** the core message is shown, **Then** "People take the path of
   least resistance" and "make the right thing the easy thing" (Dutch: "de weg van de minste
   weerstand", "het juiste het makkelijkste") are unchanged.
2. **Given** the method page, **When** the four assumptions are shown, **Then** their statements
   are word for word as published, including "People are inherently lazy".
3. **Given** the manager README, **When** the testimonial is shown, **Then** the quote is Chris
   Stapper's text, unchanged.
4. **Given** the writing page, **When** articles are listed, **Then** their published titles are
   unchanged.

---

### User Story 3 - The patterns cannot creep back (Priority: P2)

When copy is added or changed later, the quality gate fails if it uses a forbidden construction,
word or em dash.

**Why this priority**: the patterns came in one sentence at a time; a guard keeps the fix.

**Independent Test**: adding a sentence such as "It's not speed, it's precision." or an em dash to
any visitor-facing text fails the gate; the protected phrases and quotes do not trigger it.

**Acceptance Scenarios**:

1. **Given** a new text with a forbidden pattern in either language, **When** the gate runs,
   **Then** it fails and names the text and the pattern.
2. **Given** the protected phrases, the testimonial and the article titles, **When** the gate
   runs, **Then** they are not flagged.

---

### User Story 4 - Sander reviews before and after side by side (Priority: P2)

Before merging, Sander can read every changed text as before and after, per page and language, in
one private review page.

**Why this priority**: a code diff of dictionary strings is hard to judge as writing.

**Independent Test**: the review page lists every changed text with its old and new version, in
both languages, grouped by page.

**Acceptance Scenarios**:

1. **Given** the pull request, **When** Sander opens the review page, **Then** he sees each
   changed text as before and after, grouped by page and language.

### Edge Cases

- Interface labels that are part of the portal metaphor (for example "Catalog entity",
  "Endpoints", "Release notes") are names, not prose; they stay unless they contain a forbidden
  pattern.
- Search-result titles and descriptions, the sharing card and the 404 page count as visitor-facing
  copy and follow the same rules.
- Ranges of years or numbers ("2016–2020") use an en dash; that is not an em dash and stays.
- Technical names that contain a forbidden word as a proper noun (for example "business–IT
  alignment" as the name of a rotation, "HEART framework") may stay when rewording would change
  the meaning; the guard's word list leaves such terms out.
- A protected phrase that itself uses a contrast (none at the time of writing) stays protected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every visitor-facing text on every page, in English and Dutch, MUST follow the style
  rules: no em dashes; none of the forbidden words and expressions; no contrast constructions ("not
  X, but Y", "X, not Y", "not X; it is Y", and their Dutch forms); no elliptical setups,
  revelation hooks, reframes or aphoristic reductions.
- **FR-002**: The voice MUST be direct and plain: first person where Sander speaks, sentences of
  varying length, an opinion where it fits, and no invented anecdotes, hedges or hero framing.
- **FR-003**: Facts MUST NOT change: numbers, names, dates, organisations, claims and links stay
  exactly as approved; no new claims are added.
- **FR-004**: The protected phrases MUST stay word for word: the core message (path of least
  resistance; the right thing the easy thing), the four assumption statements, Chris Stapper's
  quote and the published article titles.
- **FR-005**: English and Dutch MUST stay equivalent in meaning, each written naturally in its own
  language.
- **FR-006**: The quality gate MUST check every visitor-facing text against the style rules and
  fail with the offending text and pattern, excluding the protected phrases, the quote and the
  article titles.
- **FR-007**: A private review page MUST show every changed text before and after, grouped by page
  and language, for the owner's review before merge.

### Key Entities

- **Visitor-facing text**: any string shown on a page, in metadata or on the sharing card, per
  language.
- **Protected phrase**: a text that must stay word for word, with the reason it is protected.
- **Style rule**: a forbidden construction, word or punctuation mark, per language.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 em dashes, 0 forbidden words and 0 forbidden constructions in visitor-facing text,
  in both languages, outside the protected phrases.
- **SC-002**: 100% of facts (numbers, names, dates, organisations, links) unchanged, verified text
  by text on the review page.
- **SC-003**: 100% of protected phrases unchanged.
- **SC-004**: A forbidden pattern added to any text fails the gate in 100% of runs.
- **SC-005**: Every page keeps its accessibility, performance and bilingual-parity results.

## Assumptions

- The style rules are those of Sander's "Writing Rules - Humanise" and the humanise-text skill
  (forbidden constructions, words and em dashes), applied to both languages.
- The voice reference is Sander's own published writing: first person, concrete, candid, with
  mixed sentence lengths.
- Scope is the site's visitor-facing copy. The repository README, specs and code comments are out
  of scope.
- The review page is a private page shared with the owner only; it contains copy that is already
  public or about to be.
