# Implementation Plan: Privacy-Friendly Analytics

**Branch**: `017-privacy-analytics` | **Date**: 2026-11-03 | **Spec**: [spec.md](./spec.md)

## Summary

A small first-party script, bundled into every page through the portal layout, sends page views
and article clicks to hosted GoatCounter at `https://sammieetje.goatcounter.com/count`. GoatCounter
meets the constitution's conditions as of 2026-11-03: data in Finland and Germany, an Irish
operator, no stored IP addresses (research R1). Its own `count.js` does not: it uses two hosts,
reads and writes local storage, sends query strings and ignores opt-out signals (R2). So the site
sends the same documented requests itself.

The script sends only on `sammieetje.github.io`, which keeps CI, tests and local development out
of the figures (R4). It sends nothing when Global Privacy Control or Do Not Track is set, and it
strips query strings and fragments (R5). Article links get a `data-count-article` attribute at build
time from `articles.ts` (R7). A new privacy page in English and Dutch is linked from every
footer. An end-to-end test serves the build under the production host and answers the analytics
requests itself, so counting is proven without counting (R6). Details: [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 6.0 strict on Node 24 LTS; Astro 7 for pages and the bundled script
**Primary Dependencies**: none new. Hosted GoatCounter as an external service, reached only through its documented `/count` endpoint
**Storage**: none in the site or the browser; aggregate counts at GoatCounter
**Testing**: Vitest for `shouldCount` and the request builders; Playwright (which runs after the build) for the built-HTML scans, the privacy page with axe, the localhost no-request check and the production-host counting test
**Target Platform**: GitHub Pages; evergreen browsers
**Project Type**: static site with CI/CD
**Performance Goals**: script under 1 KB gzip per page; Lighthouse budgets unchanged (SC-005)
**Constraints**: exactly one extra host; no cookies or browser storage; nothing sent outside the production host
**Scale/Scope**: 17 pages plus 2 privacy pages; a handful of article links

## Constitution Check

| Principle | Compliance | Status |
|-----------|-----------|--------|
| I. Right thing easy | `npm run check` covers every new rule; the article attribute comes from `articles.ts`, so `/publish-article` needs no extra step | Pass |
| II. Test-first | unit tests for every decision, end-to-end tests for every contract guarantee; all seen failing first | Pass |
| III. Traceability | `017:` references in code; `data-spec="017:FR-010"` on the privacy statement, `017:FR-011` on the footer link | Pass |
| IV. Accessible | the privacy page and footer link are covered by axe in both languages and schemes; the script adds no UI | Pass |
| V. Fast and light | one small script, allowed by v2.0.0 for the analytics exception; counted by the existing JS measure and Lighthouse budgets | Pass (see Complexity Tracking) |
| VI. Private and secure | one named host, no cookies or storage, no IP addresses, EU-hosted, nothing in CI, bilingual privacy statement; every condition is checked in CI except hosting location and IP retention, which are documented in research R1 | Pass (see Complexity Tracking) |
| VII. Bilingual | privacy page and footer link in EN and NL; article titles in the link's language | Pass |

Re-checked after design: no change. Two of the constitution's conditions (EU hosting, no stored
IP addresses) are facts about GoatCounter that no test in this repository can verify; they are
recorded with sources and dates in research R1 and named in the README.

## Project Structure

### Documentation (this feature)

```text
specs/017-privacy-analytics/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md
├── contracts/analytics.md
└── checklists/requirements.md
```

### Source Code (repository root)

```text
src/site/analytics.ts                 new: endpoint, productionHost, shouldCount, pageViewUrl, articleClickUrl
src/components/Analytics.astro        new: the bundled <script>; page view on load, click listener on a[data-count-article]
src/layouts/PortalLayout.astro        + <Analytics /> on every page
src/components/WritingPage.astro      + data-count-article on article links
src/components/MethodPage.astro       + data-count-article on article links
src/components/PrivacyPage.astro      new: the privacy statement (017:FR-010)
src/pages/privacy.astro               new
src/pages/nl/privacy.astro            new
src/site/routes.ts                    + route `privacy` (no nav entry)
src/components/SiteFooter.astro       + privacy link (017:FR-011)
src/i18n/ui.ts                        + privacy.* and footer.privacy strings, EN and NL
README.md                             Analytics section; roadmap 017
tests/unit/analytics.test.ts          new: shouldCount, request builders, no ? or # in p and r
tests/e2e/article-links.spec.ts       new: every built link to an article carries data-count-article and data-count-title, no other does
tests/unit/repo-readme.test.ts        + Analytics section
tests/e2e/meta-privacy.spec.ts        script rule: the analytics script on every page; localhost: zero foreign requests
tests/e2e/analytics.spec.ts           new: production-host routing; one page view, article event, opt-out, one extra host, no storage
tests/e2e/privacy.spec.ts             new: both languages, footer link from every page, without JavaScript
```

**Structure Decision**: the existing single Astro project. Pure logic sits in `src/site/` like the
other features, the script in one component, and the layout includes it once.

## Complexity Tracking

| Deviation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| A script on every page (V) | Counting needs it; v2.0.0 allows exactly this script | The no-JavaScript pixel cannot respect Global Privacy Control or Do Not Track, or strip referrer query strings (R2) |
| A runtime request to a third-party host (VI) | The one exception the constitution allows | Self-hosted Umami would need a server to run and maintain; the owner chose GoatCounter |
| Own script instead of the vendor's `count.js` | `count.js` uses two hosts and local storage and sends query strings (R2) | A patched copy of `count.js` would need re-patching on every upstream change |
| EU hosting and IP retention verified by research, not by CI | They are properties of the service, not of the site | No machine check exists; research R1 records the sources with dates, and the README tells a reader where to check |
