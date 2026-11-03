---

description: "Task list for 017 Privacy-Friendly Analytics"
---

# Tasks: Privacy-Friendly Analytics

**Input**: Design documents from `/specs/017-privacy-analytics/`

**Tests**: Required (constitution II). Each test task comes before the implementation it covers,
and every test is seen failing first. A guard that passes today is proven by making it fail on
purpose. Code carries `017:T###` comments. Contract: [contracts/analytics.md](./contracts/analytics.md).
Data shapes: [data-model.md](./data-model.md).

## Phase 1: Setup

- [ ] T001 Confirm the precondition: the owner created the GoatCounter site with code `sammieetje`
  (confirmed 2026-11-03 by the owner's snippet). The endpoint is
  `https://sammieetje.goatcounter.com/count`. The vendor snippet (`gc.zgo.at/count.js`) is not
  used anywhere (research R2); `grep -r "gc.zgo.at" src` stays empty.

## Phase 2: Foundational

- [ ] T002 Write failing tests in `tests/unit/analytics.test.ts` for `src/site/analytics.ts`:
  - `endpoint` is exactly `https://sammieetje.goatcounter.com/count`;
  - `productionHost` equals the host of `site` in `astro.config.mjs` (`sammieetje.github.io`);
  - `shouldCount({ hostname, gpc, dnt })` is true only for `hostname === productionHost` with
    `gpc !== true` and `dnt !== '1'`; false for `localhost`, `127.0.0.1`, any other host, `gpc:
    true` or `dnt: '1'`.
- [ ] T003 Implement `endpoint`, `productionHost` and `shouldCount` in `src/site/analytics.ts`
  (makes T002 pass).

## Phase 3: User Story 1 - Sander sees how the site is used (P1) 🎯 MVP

**Independent test**: under the production host (routed to the local build), every page sends
exactly one page view with its path, referrer, title and screen width, and a click on an article
link sends one event named after the article while the link still opens.

- [ ] T004 [P] [US1] Extend `tests/unit/analytics.test.ts` with failing tests for the request
  builders:
  - `pageViewUrl({ pathname, referrer, title, width, ownOrigin })` returns `endpoint` with `p`,
    `r`, `t`, `s` and `rnd`; `p` is the pathname only; `r` is the referrer's origin + path, and
    empty when the referrer's origin is `ownOrigin`; `q` and `ns` are never present;
  - for inputs with `?` and `#` in pathname or referrer, neither `p` nor `r` contains `?` or `#`
    (contract C3);
  - `articleClickUrl({ id, title })` returns `endpoint` with `p=<id>`, `t=<title>`, `e=true` and
    `rnd`, and nothing else.
- [ ] T005 [P] [US1] Write failing tests in `tests/unit/article-links.test.ts` that scan every HTML
  file in `dist/`: every `<a>` whose `href` equals the `url` of an article in
  `src/site/articles.ts` carries `data-article` equal to that article's `id`, and no other `<a>`
  carries `data-article` (research R7).
- [ ] T006 [P] [US1] Write failing tests in `tests/e2e/analytics.spec.ts` (research R6):
  - route `https://sammieetje.github.io/**` to the files in `dist/` and answer every request to
    `https://sammieetje.goatcounter.com/**` with status 204 and record it; abort and record
    anything else that is not the site's origin;
  - for every page in `tests/e2e/pages.ts` plus `/privacy/` and `/nl/privacy/`: exactly one
    request to the endpoint, with `p` equal to the page's path (contract C4);
  - loading `/writing/?utm_source=x#top` sends `p=/writing/` and no `q` (C3);
  - clicking an article link on `/writing/` and on `/nl/schrijven/` sends one request with `e=true`
    and `p` equal to the article's id, and the browser navigates to the article URL (C5); a click
    on a non-article external link sends nothing;
  - the 404 page sends the missing path as `p`.
- [ ] T007 [US1] Add `pageViewUrl` and `articleClickUrl` to `src/site/analytics.ts` (makes T004
  pass).
- [ ] T008 [US1] Add `data-article={a.id}` to the article links in
  `src/components/WritingPage.astro` and `src/components/MethodPage.astro`, with a `017:T008`
  comment (makes T005 pass).
- [ ] T009 [US1] Create `src/components/Analytics.astro` with one bundled `<script>` that imports
  from `src/site/analytics.ts`: when `shouldCount` holds, it sends `pageViewUrl` once on load and
  `articleClickUrl` on `click` and `auxclick` of `a[data-article]` (title from the link's text),
  via `navigator.sendBeacon`, falling back to `new Image().src`; it never calls
  `preventDefault` and catches every error. Include it once in
  `src/layouts/PortalLayout.astro` (makes T006 pass).

## Phase 4: User Story 2 - Visitors are counted, not tracked (P1)

**Independent test**: under the production host, every page contacts only its own origin and
the one analytics host, and no cookies or browser storage exist after a visit; with Global
Privacy Control or Do Not Track set, nothing is sent.

- [ ] T010 [P] [US2] Extend `tests/e2e/analytics.spec.ts` with failing tests:
  - on every page, every request goes to `https://sammieetje.github.io` or
    `https://sammieetje.goatcounter.com`, and nothing else (contract C1, FR-004);
  - with `navigator.globalPrivacyControl` set to `true` by an init script, and separately with
    `navigator.doNotTrack` set to `'1'`, no request reaches the analytics host on any page, and
    no click on an article link sends one (C2);
  - after loading every page and clicking an article link: `context.cookies()` is empty, and
    `localStorage.length`, `sessionStorage.length` and `indexedDB.databases()` are all empty (C6);
  - with every request to the analytics host aborted, the page renders the same headings and
    links, and an article link still navigates (C7).
- [ ] T011 [US2] Update `tests/e2e/meta-privacy.spec.ts`: on `localhost` every page still makes
  zero foreign requests and sets no cookies; the script rule becomes "the analytics script on
  every page, plus one module script on the playground and scorecard pages". Prove the zero-request
  test by temporarily allowing `localhost` in `shouldCount` and seeing it fail, then revert.
- [ ] T012 [US2] Fix whatever T010–T011 expose in `src/components/Analytics.astro` or
  `src/site/analytics.ts`, until both pass.

## Phase 5: User Story 3 - The figures contain real visits only (P2)

**Independent test**: a full `npm run check` and a session on `astro dev` and `astro preview`
send nothing to the analytics host.

- [ ] T013 [P] [US3] Extend `tests/unit/analytics.test.ts` with a failing test that the built
  pages in `dist/` reference the analytics host only through the bundled script, never in an
  `img`, `link` or `script src` (no pixel, no preconnect, no vendor script).
- [ ] T014 [US3] Make T013 pass if it fails. Record in `quickstart.md` that Lighthouse, Playwright
  on `localhost`, `astro dev` and `astro preview` are covered by the hostname rule (research R4).

## Phase 6: User Story 4 - Visitors can read what is measured (P2)

**Independent test**: `/privacy/` and `/nl/privacy/` exist, link to each other, are linked from
every footer in the same language, and name the service, the data, the location, the retention,
no cookies and the opt-out, also without JavaScript.

- [ ] T015 [P] [US4] Write failing tests:
  - in `tests/unit/routes.test.ts`, a route `privacy` with paths `/privacy/` and `/nl/privacy/`
    and no `nav` entry;
  - in `tests/e2e/privacy.spec.ts`, for both languages and with JavaScript disabled: an element
    `data-spec="017:FR-010"` that mentions GoatCounter, Finland and Germany, eight hours, IP
    addresses, cookies, Global Privacy Control and Do Not Track; a link to the counterpart page;
  - in `tests/e2e/privacy.spec.ts`, every page in `tests/e2e/pages.ts` has a footer link
    `data-spec="017:FR-011"` to the privacy page in its own language (SC-006);
  - add `/privacy/` and `/nl/privacy/` to `tests/e2e/pages.ts`, so axe, metadata and the privacy
    checks cover them in both colour schemes.
- [ ] T016 [US4] Add the `privacy` route to `src/site/routes.ts`; the `privacy.*`,
  `page.privacy.*` and `footer.privacy` strings in EN and NL to `src/i18n/ui.ts`;
  `src/components/PrivacyPage.astro` with the statement from contract "Privacy page";
  `src/pages/privacy.astro` and `src/pages/nl/privacy.astro`; and the footer link in
  `src/components/SiteFooter.astro` (makes T015 pass). The copy passes the copy-style guard
  (spec 012) and axe stays at zero.

## Phase 7: Polish & Cross-Cutting

- [ ] T017 [P] Write failing tests in `tests/unit/repo-readme.test.ts` for a `## Analytics`
  section that names GoatCounter, `sammieetje.goatcounter.com`, "no cookies", Global Privacy
  Control and the hostname rule, links to `/privacy/`, and a roadmap with 016 `live` and 017
  `this PR`. Then write the section and roadmap in `README.md` (FR-012).
- [ ] T018 Run `npm run check` locally and see it pass end to end, including the JavaScript budget
  with the analytics script on every page. On the pull request, `quality-gate` is green.
- [ ] T019 Open the pull request. After the owner merges, run quickstart "After deploy" steps 1–5
  and record the result in a follow-up docs commit.

## Dependencies & Execution Order

- T001 → Foundational (T002–T003) → US1 (T004–T009) → US2 (T010–T012) → US3 (T013–T014) → US4
  (T015–T016) → Polish (T017–T019).
- US4 does not depend on US1–US3 and may run in parallel with them after T003; the privacy pages
  join the analytics tests once both exist.
- Within a phase, `[P]` tasks write different files.

## Parallel Examples

- US1: T004 (`tests/unit/analytics.test.ts`), T005 (`tests/unit/article-links.test.ts`) and T006
  (`tests/e2e/analytics.spec.ts`) together.
- US4 with US1: T015 alongside T004–T006.

## Implementation Strategy

- MVP: Phases 1–4 (US1 + US2). Counting is only allowed with the privacy guarantees, so they ship
  together; the constitution also requires the privacy page (US4) before anything goes live.
- Everything lands in one pull request, as every spec does.
