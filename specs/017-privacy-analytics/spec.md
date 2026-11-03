# Feature Specification: Privacy-Friendly Analytics

**Feature Branch**: `017-privacy-analytics`

**Created**: 2026-11-03

**Status**: Draft

**Input**: User description (translated from Dutch): "I would like to get web statistics out of the
site. How can I implement this?" Owner's choices on 2026-11-03: first amend the constitution
(v2.0.0, Principle VI now allows one cookieless analytics service under strict conditions), then
build it as its own spec; hosted GoatCounter as the service; statistics visible to Sander only
(see Clarifications).

## Context

Sander cannot see which pages are read or where visitors come from. LinkedIn shows how often a
post is clicked, but not what a visitor does once they arrive, and search engines bring visitors
he never sees at all. GitHub Pages offers no visitor figures and no server logs.

Until constitution v2.0.0 every form of analytics was forbidden. Principle VI now allows exactly
one cookieless analytics service, on conditions that the pipeline checks wherever a machine can:
no cookies or browser storage, no personal data, no stored IP addresses, no cross-site
identifier, self-hosted or hosted in the EU, exactly one named host, nothing measured in CI or
local development, and within the existing budgets. A privacy statement in both languages tells
visitors what is counted.

## Clarifications

### Session 2026-11-03

- Q: Which analytics service? → A: GoatCounter, the hosted service (free for personal use,
  open source). Plausible (paid) and self-hosted Umami were the alternatives.
- Q: Should the statistics dashboard be public? → A: No, visible to Sander only. The privacy page
  describes what is measured.
- Q: Should clicks on article links be counted, since the articles live on LinkedIn? → A: Yes,
  clicks on links to articles are counted as events, named after the article; other outgoing
  links are not counted.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sander sees how the site is used (Priority: P1)

Sander opens the statistics and sees, per day, week or month: how many page views and visitors
the site had, which pages were read, which sites sent visitors (LinkedIn, search engines, GitHub),
and the visitors' country, device type and browser at an aggregate level. He compares languages
through the English and Dutch paths. Because the
articles themselves live on LinkedIn, he also sees how often each article link on the site is
clicked.

**Why this priority**: this is the reason for the feature; without it nothing is measured.

**Independent Test**: after a visit to two pages from a link on another site, both page views and
the referring site appear in the statistics within the service's normal delay.

**Acceptance Scenarios**:

1. **Given** a visitor who opens a page on the live site, **When** Sander opens the statistics,
   **Then** that page view is counted under that page's path.
2. **Given** a visitor who arrives from a LinkedIn post, **When** Sander opens the statistics,
   **Then** LinkedIn is listed as the referring site.
3. **Given** a visitor who reads the English page and then its Dutch counterpart, **When** Sander
   opens the statistics, **Then** both pages are counted separately, so he can compare languages.
4. **Given** a page view, **When** Sander opens the statistics, **Then** no field identifies the
   visitor as a person.
5. **Given** a visitor who clicks a link to an article, in either language, **When** Sander opens
   the statistics, **Then** one article click is counted under that article's name, and the
   article opens as before.
6. **Given** a visitor who clicks any other outgoing link, **When** Sander opens the statistics,
   **Then** no click is counted for it.

---

### User Story 2 - Visitors are counted, not tracked (Priority: P1)

A visitor reads the site as before. Nothing is stored in their browser, no request goes to any
host other than the site and the one named analytics host, and no consent banner is needed.
Visitors who signal that they do not want to be tracked are not counted.

**Why this priority**: this is what the constitution requires; without it the feature may not
ship.

**Independent Test**: on every page, in both languages, the browser holds no cookies and no
stored data after the visit, and every request goes to the site itself or the one named host.

**Acceptance Scenarios**:

1. **Given** any page in either language, **When** a visitor loads it on the live site, **Then**
   the browser holds no cookies and nothing in local storage, session storage or IndexedDB.
2. **Given** any page, **When** it loads, **Then** every runtime request goes to the site's own
   origin or to the one analytics host named in the repository.
3. **Given** a visitor whose browser sends Global Privacy Control or Do Not Track, **When** they
   load a page, **Then** no page view is sent.
4. **Given** a visitor with JavaScript turned off, or whose browser blocks the analytics host,
   **When** they load a page, **Then** the page looks and works exactly as before.

---

### User Story 3 - The figures contain real visits only (Priority: P2)

Builds, tests, Lighthouse runs, local development and preview builds send nothing, so the
statistics show only visits to the live site.

**Why this priority**: the pipeline loads every page dozens of times a day; without this the
figures would be meaningless.

**Independent Test**: a full pipeline run and a local development session leave the counts in the
statistics unchanged.

**Acceptance Scenarios**:

1. **Given** the pipeline's tests and Lighthouse runs, **When** they load pages, **Then** no page
   view is sent.
2. **Given** local development or a local preview, **When** Sander browses the site, **Then** no
   page view is sent.
3. **Given** the live site, **When** a real visitor loads a page, **Then** a page view is sent.

---

### User Story 4 - Visitors can read what is measured (Priority: P2)

A privacy page in English and Dutch, linked from the footer of every page, explains what is
measured, by which service, where the data is stored, how long it is kept, that no cookies are
used, and how a visitor can opt out.

**Why this priority**: the constitution requires it, and it is what makes the measurement honest
towards visitors.

**Independent Test**: the privacy page exists in both languages, is linked from every page's
footer, and names the service, the data, the location, the retention and the opt-out.

**Acceptance Scenarios**:

1. **Given** any page in either language, **When** a visitor looks at the footer, **Then** it links
   to the privacy page in the same language.
2. **Given** the privacy page in either language, **When** a visitor reads it, **Then** it names the
   service, every kind of data that is counted, where it is stored, how long, that there are no
   cookies, and how to opt out.
3. **Given** the privacy page, **When** it is read without JavaScript, **Then** all of it is there.

### Edge Cases

- The analytics host is down or slow: pages load and work as before, and the page view is lost
  rather than retried.
- An ad blocker blocks the analytics host: the page works as before; that visit is not counted.
- A visitor opens the 404 page: the missing path is counted, so broken incoming links show up.
- A URL with query parameters (for example tracking codes added by LinkedIn): the page is counted
  under its path; query parameters that could carry personal data are not sent.
- Sander's own visits: the site cannot recognise him without storing something in his browser,
  so his visits are counted like anyone else's.
- The service changes its terms, moves out of the EU or stops: the constitution's conditions no
  longer hold, and the analytics must be removed or replaced through a new spec.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every page in both languages MUST send one page view to the analytics service when
  loaded on the live site, with the page's path and the referring site.
- **FR-002**: The analytics service MUST be hosted GoatCounter, with its data hosted in the EU,
  and MUST NOT store IP addresses or any identifier that follows a visitor across sites. The
  statistics MUST be visible to Sander only.
- **FR-003**: Pages MUST NOT set cookies or write to local storage, session storage or IndexedDB.
- **FR-004**: Every runtime request a page makes MUST go to the site's own origin or to the one
  analytics host named in the repository; a check in the pipeline MUST fail on any other host.
- **FR-005**: Page views MUST NOT be sent from the pipeline, tests, Lighthouse runs, local
  development or local previews.
- **FR-006**: Page views MUST NOT be sent when the browser signals Global Privacy Control or Do
  Not Track.
- **FR-007**: Query parameters and fragments MUST NOT be sent with a page view.
- **FR-008**: Pages MUST look and work the same when the analytics script fails, is blocked or
  JavaScript is off.
- **FR-009**: The analytics script MUST count towards the JavaScript budget and the Lighthouse
  budgets on every page, and every page MUST stay within them.
- **FR-010**: A privacy page MUST exist in English and Dutch, each linking to the other, and MUST
  name the service, every kind of data counted, where it is stored, how long it is kept, that no
  cookies are used, and how to opt out.
- **FR-011**: The footer of every page MUST link to the privacy page in the same language.
- **FR-012**: The README MUST name the analytics service and host, and explain how the pipeline
  checks the constitution's conditions.
- **FR-013**: A click on a link to an article, on any page in either language, MUST send one
  article click named after the article to the same analytics host, under the same conditions as
  page views (FR-005 to FR-007). The link MUST open the article as before, also when the event
  cannot be sent. Clicks on other outgoing links MUST NOT be counted.

### Key Entities

- **Page view**: one per page load on the live site; the path, the referring site, and the
  aggregate visitor details the service derives (country, device type, browser). No
  personal data.
- **Article click**: one per click on a link to an article; the article's name, the page it was
  clicked on, and the same aggregate details as a page view. No personal data.
- **Analytics host**: the single named host the script loads from and reports to; recorded in the
  repository and checked by the pipeline.
- **Privacy statement**: one page per language; what is counted, by whom, where, for how long, and
  how to opt out.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Within a day of going live, Sander can see page views per page and per referring
  site for the past day, and article clicks per article.
- **SC-002**: 0 cookies and 0 stored browser items on any page, in both languages.
- **SC-003**: 0 runtime requests to any host other than the site and the one named analytics host.
- **SC-004**: 0 page views counted from pipeline runs, tests or local development.
- **SC-005**: Every page keeps a Lighthouse performance score of at least 0.90 and at least 0.95
  for accessibility, best practices and SEO, with the analytics included.
- **SC-006**: A visitor finds the privacy statement in one click from any page, in their language.

## Assumptions

- Visitor figures are aggregate. Individual visitor journeys, heatmaps, session recordings and
  conversion funnels are out of scope.
- Counting clicks on outgoing links other than article links (LinkedIn profile, GitHub, other
  sites) is out of scope.
- The privacy page lives at `/privacy/` and `/nl/privacy/`, following the existing route table.
- Visitors with JavaScript turned off are not counted, so that the opt-out signals (FR-006) are
  always respected.
- Sander's own visits are counted, because excluding them would require storing something in his
  browser.
- The service's own retention period applies; the privacy page states it.
- Hosted GoatCounter keeps its data in the EU and stores no IP addresses. The plan MUST confirm
  both from the service's own documentation; if either does not hold, the constitution rules it
  out and the choice of service returns to Sander.
- Sander creates the GoatCounter account and site code himself; no stored secret is needed,
  because sending page views requires none.
- Interactive pages (playground, scorecard) keep their own script; the analytics script is the
  only other script any page may load.
- The existing check that pages stay on their own origin is extended with the one named host,
  not removed.
