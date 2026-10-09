# Feature Specification: Catalog Overview

**Feature Branch**: `002-catalog-overview`

**Created**: 2026-10-09

**Status**: Draft

**Input**: User description: "Catalog overview: turn the home page into the entity overview of the
developer portal, with Sander's profile photo, a short 'about', his key numbers and his links.
Profile photo attached."

## Context

001 delivered an identity card on the home page. A developer-portal entity page (as in Backstage)
shows more than a name: an "About" card, links, and a scorecard of facts. This feature turns the
home page into that overview, so that each audience gets its answer within one screen:
decision-makers see proof (numbers with context), peers see the approach, engineers see the
person they would work for.

It also gives the site a face: the profile photo on the page, and a sharing image so that a link
posted on LinkedIn or in a chat shows a proper preview card.

Out of scope (later specs): career history (003), method (004), "How I lead" (005), writing
(006), projects (007), playground (008), live scorecard (009).

## Clarifications

### Session 2026-10-09

- Q: Which key numbers does the overview show? → A: Three: (1) 10,000 voluntary users on the
  CI/CD platform in an IT organisation of 7,600, without a mandate — Rabobank, 2016–2020;
  (2) 5× infrastructure growth (500 → 2,500 Linux nodes) with a 15% smaller team — Rabobank,
  2011–2016; (3) 2.5× service volume with minimal team growth — TenneT, Infrastructure,
  Integration & Cloud, 2023–2026.
- Q: What is the About text? → A: Two sentences on work and approach plus one on the current
  role; no Rabobank sentence (the numbers card carries the proof). EN: "For nearly twenty years
  I have turned IT departments in banking and energy into platform organisations that teams
  actually want to use. My thesis on behaviour change taught me that people take the path of
  least resistance, so I don't push change: I redesign the environment until the right thing is
  the easy thing. Today I lead the Data & Analytics Platform at TenneT, where data and AI power
  the energy transition." NL: "Al bijna twintig jaar maak ik van IT-afdelingen in bankwezen en
  energie platformorganisaties die teams echt willen gebruiken. Mijn afstudeeronderzoek naar
  gedragsverandering leerde me dat mensen de weg van de minste weerstand kiezen; daarom duw ik
  niet, maar herontwerp ik de omgeving tot het juiste het makkelijkste is. Vandaag leid ik het
  Data & Analytics Platform bij TenneT, waar data en AI de energietransitie aandrijven."
- Q: How is the photo cropped? → A: Head only (hair to chin), shown as a rounded square. Source
  crop: 490 × 490 px at offset (45, 72) of the original 613 × 903 photo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Put a face to the name (Priority: P1)

A visitor opens the home page and sees Sander's photo next to his name, sharp on any screen,
without the page jumping while it loads.

**Why this priority**: a face builds trust faster than any text; recruiters, peers and future
team members all expect one.

**Independent Test**: open `/` and `/nl/` on a phone and a high-density desktop screen; the photo
is visible in the identity card, crisp, described for screen readers, and the layout does not
shift while it loads.

**Acceptance Scenarios**:

1. **Given** a visitor on `/` or `/nl/`, **When** the page loads, **Then** the identity card shows
   Sander's photo with a text alternative in the page language.
2. **Given** a high-density screen, **When** the photo loads, **Then** the browser receives a
   version at least twice the displayed size in a modern image format.
3. **Given** a slow connection, **When** the photo loads, **Then** the space it takes is reserved
   from the start and nothing on the page moves.
4. **Given** a 360 px wide screen, **When** the home page loads, **Then** name, headline and the
   LinkedIn link are still visible without scrolling (001 SC-001 keeps holding).

---

### User Story 2 - See the proof (Priority: P1)

A decision-maker scanning the page sees a small set of key numbers, each with enough context to
be credible: what the number is, where and when it was achieved.

**Why this priority**: the audience research says decision-makers want "proof, not theory";
the numbers are the strongest differentiator Sander has.

**Independent Test**: on `/`, read the key-numbers card; every number has a label and a context
line; the same card on `/nl/` is fully Dutch with Dutch number formatting.

**Acceptance Scenarios**:

1. **Given** the home page, **When** a visitor reaches the key-numbers card, **Then** they see
   each number with a short label and a context line (organisation and period).
2. **Given** the Dutch home page, **When** the card is shown, **Then** labels and context are
   Dutch and numbers use Dutch formatting (for example `10.000`).
3. **Given** a screen reader, **When** it reads a key number, **Then** value, label and context are
   read as one understandable statement.

---

### User Story 3 - Understand the person in three sentences (Priority: P2)

A visitor reads a short "About" text that explains what Sander does, why he does it that way, and
where he does it now.

**Why this priority**: numbers prove, but the story explains; peers and engineers need the why.

**Independent Test**: on `/` and `/nl/`, find the About card; it has at most three sentences and
links nowhere unexpected.

**Acceptance Scenarios**:

1. **Given** the home page, **When** a visitor reads the About card, **Then** it describes his work,
   his approach and his current role in at most three sentences, in the page language.

---

### User Story 4 - Find him elsewhere (Priority: P2)

A visitor wants to connect or look further and finds Sander's public profiles in a "Links" card.

**Why this priority**: the call to action (LinkedIn) is already in the identity card; the links
card completes it with GitHub for engineers.

**Independent Test**: on `/` and `/nl/`, the Links card lists LinkedIn and GitHub with accessible
names; both open the right profiles.

**Acceptance Scenarios**:

1. **Given** the home page, **When** a visitor opens the Links card, **Then** they find LinkedIn
   (`https://www.linkedin.com/in/sanderettema/`) and GitHub (`https://github.com/SammieEtje`),
   each marked as a profile of the site owner.

---

### User Story 5 - Share a link that looks right (Priority: P2)

Someone shares `https://sammieetje.github.io/` (or `/nl/`) on LinkedIn, Slack or Teams. The preview
card shows Sander's photo, name and headline in the language of the shared page.

**Why this priority**: most visitors arrive through a shared link; the preview is the first
impression.

**Independent Test**: inspect the sharing metadata of `/` and `/nl/`; each points to a
1200 × 630 image that exists, shows photo, name and headline in that language, and is declared
as a large-image card.

**Acceptance Scenarios**:

1. **Given** the English home page, **When** a platform reads its sharing metadata, **Then** it
   finds an absolute URL to a 1200 × 630 image with the English headline, plus its width, height
   and a text alternative.
2. **Given** the Dutch home page, **When** a platform reads its sharing metadata, **Then** the image
   carries the Dutch headline.

### Edge Cases

- The photo fails to load: the text alternative is shown and the card layout stays intact.
- A visitor prefers reduced data or has images disabled: all text content remains complete.
- A number's context changes (for example a role ends): the number keeps its organisation and
  period, so it never reads as a current claim when it is not.
- Very narrow screens (320 px): the number tiles stack; no horizontal scrolling.
- The published images must never carry camera or location metadata, even if a future source
  photo does.

## Requirements *(mandatory)*

### Functional Requirements

**Photo**

- **FR-001**: The identity card on `/` and `/nl/` MUST show Sander's profile photo, cropped
  head-only and shown as a rounded square, with a text alternative in the page language.
- **FR-002**: The photo MUST be delivered in at least one modern image format with a fallback,
  in sizes covering 1× and 2× the displayed size, with explicit dimensions so its space is
  reserved before it loads.
- **FR-003**: Every published image MUST be free of camera, location and other embedded metadata.

**Key numbers**

- **FR-004**: The home page MUST show a key-numbers card with exactly the three numbers listed in
  Clarifications, each with a value, a label and a context line naming the organisation and the
  period.
- **FR-005**: Numbers MUST be formatted for the page language (English `10,000`, Dutch `10.000`).
- **FR-006**: Each number MUST be readable by assistive technology as one statement combining
  value, label and context.

**About and links**

- **FR-007**: The home page MUST show an About card with the three-sentence text from
  Clarifications in the page language, covering what Sander does, his approach, and his current
  role.
- **FR-008**: The home page MUST show a Links card with LinkedIn and GitHub, each with an
  accessible name and `rel="me"`.

**Layout**

- **FR-009**: The overview MUST be laid out as developer-portal cards (identity, About, Key
  numbers, Links) with a card title per card, in a single column on narrow screens and a
  multi-column grid on wide screens.

**Sharing**

- **FR-010**: Each home page MUST declare a 1200 × 630 sharing image in its own language,
  showing the photo, the name and the headline, with absolute URL, width, height, alternative
  text, and a large-image card type.
- **FR-011**: Sharing images MUST be produced by the build from the same photo and dictionary
  text as the page, so they can never go stale.

**Budgets**

- **FR-012**: All constitution budgets from 001 MUST keep holding on every page, including no
  client-side JavaScript and zero layout shift caused by the photo.

### Key Entities

- **Profile photo**: one square source image (cropped, metadata-free) from which every displayed
  and shared variant is derived.
- **Key number**: value (number plus optional unit or prefix/suffix), label, context
  (organisation, period), per language.
- **About text**: up to three sentences per language.
- **Profile link**: platform name, URL, accessible name.
- **Sharing image**: 1200 × 630, per language, derived from photo and dictionary.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a 1280 × 800 screen, photo, name, headline and at least the first key number are
  visible without scrolling.
- **SC-002**: The photo causes no layout shift (cumulative layout shift of the page stays 0).
- **SC-003**: The home pages keep the constitution budgets; the photo adds at most 60 KB transfer
  per page at 2× density.
- **SC-004**: Sharing `/` or `/nl/` produces a preview with photo, name and headline in that
  language, verified by the metadata and the image dimensions.
- **SC-005**: 100% of key numbers carry an organisation and a period.
- **SC-006**: Zero published images contain embedded metadata.

## Assumptions

- The source photo is the selfie Sander provided on 2026-10-09 (613 × 903 px, no embedded
  metadata). The 490 px head-only crop is enough for display up to 240 px at 2×. Small parts of
  other people at the edge of the crop are accepted; Sander can swap the source photo later
  and every variant regenerates.
- Key numbers and About text come from Sander's approved public LinkedIn narrative; past-role
  numbers are labelled with their organisation and period.
- GitHub profile: `https://github.com/SammieEtje`. No email address is published (contact goes
  through LinkedIn, as agreed).
- Dependabot follow-up from 001: major updates the toolchain cannot accept yet (TypeScript ≥ 6.1,
  `@types/node` majors above the Node runtime) are ignored until the tools support them.
