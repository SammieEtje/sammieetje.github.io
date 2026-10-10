# Feature Specification: How I Lead

**Feature Branch**: `005-how-i-lead`

**Created**: 2026-10-10

**Status**: Draft

**Input**: User description: "'How I lead': a manager README for engineers who might want to work
for Sander, styled as API docs. Contact goes through LinkedIn."

## Context

Engineers deciding whether to join a team want to know what their manager is like before the
first conversation: what they value, how they give and take feedback, what they expect, and what
their quirks are. A manager README answers that. In the developer-portal metaphor it is the API
documentation of the "Sander" entity: each section is an endpoint with a method, a path and a
plain-language title.

Audiences: primarily engineers and team members; secondarily peers (a concrete example of
leadership made explicit) and decision-makers (leadership style, in his own words).

Out of scope: writing (006), projects (007). No contact form or email address (agreed in 001):
the call to action is LinkedIn.

## Clarifications

### Session 2026-10-10

- Q: How do one-on-ones work? → A: Monthly, one hour, structured; ad hoc whenever needed.
- Q: How do people reach Sander and how fast does he respond? → A: Chat for anything, reply the
  same working day; urgent means call. No expectation of replies in the evening or at weekends,
  and he tries not to send them.
- Q: How does he want feedback and how does he give it? → A: Anytime, anywhere, including in the
  team if it helps everyone learn. Praise in public; correction in private when it is personal.
- Q: Which known issues does he disclose? → A: (1) "I'm direct and can come across as blunt.
  Workaround: tell me when it lands wrong; I'd rather know." (2) "I get impatient with process
  that no longer serves a purpose. Workaround: show me the purpose, and I'm on board."
- Q: What does he expect from his team? → A: Own outcomes, not tickets (choose the systemic fix
  when it matters more); make it visible (share learning and what went wrong early, bad news fast
  is good news); build for others (docs, golden paths, self-service: your impact is what others
  can do because of you); challenge me (disagree with arguments; rather convinced than obeyed).
- Q: What can people expect from him? → A: Context, not instructions (the why and the
  boundaries; you decide the how); remove what's in the way (staffing, priorities, politics,
  blockers); fair and transparent (if I can't share something, I'll say that I can't).
- Q: Is the LinkedIn recommendation used, and how? → A: Yes, with the author's name: Chris
  Stapper, community manager in Sander's team at Rabobank, linked to
  `https://www.linkedin.com/in/chrisstapper` (tracking parameters removed).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Know what working for Sander is like (Priority: P1)

An engineer opens the README and, section by section, learns what Sander values, what they can
expect from him and what he expects from them.

**Why this priority**: this is the page's reason to exist and the hiring audience's main question.

**Independent Test**: open `/how-i-lead/`; sections for values, what you can expect from me and
what I expect from you are present, each written in the first person.

**Acceptance Scenarios**:

1. **Given** the page, **When** it loads, **Then** it opens with a short introduction and a version
   line ("last updated" date) like API documentation.
2. **Given** the page, **When** the reader scans it, **Then** each section is presented as an
   endpoint (method badge, path) with a plain-language title, for example `GET /values — What I
   value`.
3. **Given** the values, expectations-of-me and expectations-of-you sections, **When** they are
   read, **Then** each lists concrete statements, not slogans.

---

### User Story 2 - Know how to work with him day to day (Priority: P1)

An engineer learns the practicalities: how one-on-ones work, how to reach him and how fast he
responds, and how to give him feedback.

**Why this priority**: practical expectations remove the most friction in a new working
relationship.

**Independent Test**: on `/how-i-lead/`, sections for one-on-ones, communication and feedback each
state concrete practices.

**Acceptance Scenarios**:

1. **Given** the one-on-ones section, **When** it is read, **Then** it states cadence, whose agenda
   it is and what it is for.
2. **Given** the communication section, **When** it is read, **Then** it states preferred channels
   and response expectations ("rate limits").
3. **Given** the feedback section, **When** it is read, **Then** it states how Sander wants to
   receive feedback and how he gives it.

---

### User Story 3 - Read the known issues (Priority: P2)

An engineer reads Sander's own description of his quirks and blind spots, and how to work around
them.

**Why this priority**: honesty about weaknesses builds trust; it is what makes a manager README
credible. Optional in content, but the section must exist.

**Independent Test**: on `/how-i-lead/`, a "Known issues" section lists issues, each with a
workaround.

**Acceptance Scenarios**:

1. **Given** the known-issues section, **When** it is read, **Then** each issue has a description
   and a workaround, written by Sander in his own words.

---

### User Story 4 - See how mistakes are handled (Priority: P2)

An engineer reads how Sander responds when things go wrong ("error handling").

**Why this priority**: psychological safety is a core part of the method; this makes it concrete.

**Independent Test**: on `/how-i-lead/`, an error-handling section describes the response to
mistakes in practice.

**Acceptance Scenarios**:

1. **Given** the error-handling section, **When** it is read, **Then** it describes what happens
   when someone makes a mistake, consistent with the "room to fail safely" assumption on the
   method page, and links to it.

---

### User Story 5 - Get in touch, find it, read it in Dutch (Priority: P2)

**Why this priority**: the page must convert interest into contact and be reachable.

**Independent Test**: the page ends with a LinkedIn call to action; navigation lists "API docs —
how I lead"; `/nl/zo-leid-ik/` exists in Dutch; the home overview links to it.

**Acceptance Scenarios**:

1. **Given** the end of the page, **When** the reader wants to talk, **Then** a call to action
   links to LinkedIn.
2. **Given** any page, **When** the visitor opens the navigation, **Then** "API docs — how I lead"
   (NL: "API-docs — zo leid ik") is listed and marked current on this page.
3. **Given** the home page, **When** an engineer looks for this page, **Then** the identity card
   links to it.

### Edge Cases

- A reader skims only the endpoint list: a table of contents at the top lists every endpoint with
  its plain-language title and links to it.
- Method badges must not rely on colour alone: the method name is always written out.
- Code-styled fragments (paths, example payloads) are decoration; every statement of substance is
  in plain prose.
- The README changes over time: the version line shows the last-updated date, set in the content.

## Requirements *(mandatory)*

### Functional Requirements

**Page and structure**

- **FR-001**: The site MUST have a "How I lead" page at `/how-i-lead/` (EN) and `/nl/zo-leid-ik/`
  (NL).
- **FR-002**: The page MUST open with an introduction and a version line with a last-updated date.
- **FR-003**: Each section MUST be presented as an endpoint: HTTP-style method written out, a
  path, and a plain-language title in the page language.
- **FR-004**: A table of contents MUST list every endpoint and link to it with a stable anchor.

**Content**

- **FR-005**: The page MUST contain these endpoints: values; what you can expect from me; what I
  expect from you; one-on-ones; communication and response times; feedback; error handling;
  known issues.
- **FR-006**: All content MUST be in the first person and use only facts Sander has approved in
  clarification; nothing from private assessments, performance agreements or internal notes.
- **FR-007**: Known issues MUST each have a description and a workaround.
- **FR-008**: Error handling MUST link to the "room to fail safely" assumption on the method page.

**Contact and findability**

- **FR-009**: The page MUST end with a call to action that links to LinkedIn.
- **FR-010**: The page MUST appear in the navigation with term and subtitle in both languages, have
  its own title, description and sharing metadata, and be linked from the home identity card.
- **FR-011**: The page MUST show the clarified LinkedIn recommendation as a quote with the
  author's name, role and a link to the author's LinkedIn profile.

### Key Entities

- **Endpoint**: id (anchor), method, path, title, body (paragraphs and/or list items), per
  language.
- **Known issue**: description, workaround, per language.
- **Testimonial**: quote (original English, quoted verbatim in both languages), author, role per
  language, profile URL.
- **README meta**: last-updated date, introduction per language.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An engineer can find how to give Sander feedback within one action from the top of the
  page (table of contents).
- **SC-002**: 100% of endpoints have a written-out method, a path and a plain-language title in
  both languages.
- **SC-003**: Zero statements on the page come from private sources (assessment, performance
  agreement, internal notes); every statement traces to Sander's approval.
- **SC-004**: Constitution budgets hold with zero client-side JavaScript.
- **SC-005**: An engineer who wants to talk can reach the LinkedIn call to action from the page
  in one action.

## Assumptions

- Source material: Sander's published and drafted LinkedIn posts (performance development, the
  sysadmin-to-platform-engineer identity shift, the self-sustaining community, the four
  assumptions) and his public positioning. Personal practices (one-on-one rhythm, response times,
  feedback preferences, known issues, expectations) come from Sander in clarification.
- The navigation term "API docs" is portal vocabulary; the subtitle "how I lead" carries the
  meaning.
