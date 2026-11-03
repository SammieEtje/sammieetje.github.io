# Research: Privacy-Friendly Analytics

All sources were read on 2026-11-03. Volatile facts carry that date.

## R1. Does hosted GoatCounter meet the constitution's conditions?

**Decision**: yes, provided the site does not use GoatCounter's own `count.js` (see R2).

**Findings** (as of 2026-11-03):

- **EU hosting**: "Data is stored on servers at Hetzner Online GmbH in Finland and Germany.
  GoatCounter.com is operated by Martin Tournoij, located in Ireland."
  ([privacy](https://www.goatcounter.com/help/privacy)). The terms say "This service is operated
  out of the Republic of Ireland." ([terms](https://www.goatcounter.com/terms)).
- **No IP addresses stored**: "GoatCounter _doesn't_ store IP addresses, the full User-Agent
  header, or any tracker ID." ([privacy](https://www.goatcounter.com/help/privacy)).
- **Sessions**: to count unique visitors, the server keeps site, User-Agent and IP together, in
  memory only, mapped to a random ID for up to eight hours
  ([sessions](https://www.goatcounter.com/help/sessions)). Nothing is written to disk and nothing
  follows a visitor to other sites. The privacy page states this in plain words.
- **No cross-site identifier**: the session key includes the site ID, so it cannot link visits
  across sites.
- **Cost**: free "for reasonable public usage. Running your personal website [...] on it is fine"
  ([terms](https://www.goatcounter.com/terms)).
- **Retention**: no fixed retention period is published. The owner can delete all data from the
  site settings; backups go after 30 days. The privacy page says so.
- **Dashboard**: requires a login; the site does not link to it (spec clarification: visible to
  Sander only).

**Alternatives considered**: Plausible (paid) and self-hosted Umami, settled in the spec's
clarifications.

## R2. GoatCounter's script or our own?

**Decision**: a small first-party script, bundled into the site, that sends the same requests to
GoatCounter's `/count` endpoint. GoatCounter's `count.js` is not used.

**Rationale**: `count.js` breaks three of the constitution's conditions as it stands:

1. **Two hosts.** It loads from `gc.zgo.at` and reports to `<code>.goatcounter.com`. The
   constitution allows exactly one host.
2. **Browser storage.** It reads `localStorage.skipgc` on every page load and writes it when a
   visitor opens `#toggle-goatcounter` (from the source of
   [count.js](https://gc.zgo.at/count.js)). The constitution forbids writing to local storage.
3. **Query strings and opt-out signals.** It sends `location.search` in the `q` parameter on
   every request and ignores Do Not Track by default
   ([FAQ](https://www.goatcounter.com/help/faq)); it has no Global Privacy Control check.

GoatCounter documents self-hosting and promises that "the `/count` endpoint is guaranteed to
remain compatible" ([countjs-host](https://www.goatcounter.com/help/countjs-host)). Our own
script needs only what the site uses: a page view on load and an event on article links. It fits
in well under 1 KB compressed, which a pure TypeScript module makes testable.

**Alternatives considered**:

- Self-host a copy of `count.js`: solves the two hosts, but keeps the localStorage access and
  the query string, and would need patching on every upstream change. Rejected.
- The no-JavaScript pixel (`<img src=".../count?p=...">`): it cannot check Do Not Track or Global
  Privacy Control, and it cannot strip query strings from referrers. Rejected; visitors without
  JavaScript are not counted (spec assumption).

## R3. How does a page view reach GoatCounter?

**Decision**: `navigator.sendBeacon(url)` with an image request as fallback, to
`https://<code>.goatcounter.com/count` with the query parameters in
[contracts/analytics.md](./contracts/analytics.md).

**Rationale**: `count.js` does the same; the beacon survives a navigation, so an article click is
sent even though the browser leaves the page. Neither path sets cookies or reads storage. Neither
blocks rendering, and a failure is silent (FR-008, edge case "analytics host is down").

## R4. How do we keep CI, tests and local development out of the figures?

**Decision**: the script sends only when `location.hostname` equals the production host derived
from `site` in `astro.config.mjs` (`sammieetje.github.io`).

**Rationale**: every test, Lighthouse run, `astro dev` and `astro preview` runs on `localhost`, so
nothing is sent (FR-005). A single rule is easier to test than a list of environment flags.
`navigator.webdriver` is deliberately **not** used: it would also stop the end-to-end test that
proves counting works under the production host (R6). GoatCounter itself ignores self-identified
bots ([FAQ](https://www.goatcounter.com/help/faq)).

## R5. What is sent, and what is stripped?

**Decision**:

- `p`: `location.pathname` only, never the query string or fragment (FR-007). On the 404 page
  that is the missing path, so broken incoming links show up.
- `r`: `document.referrer` reduced to origin and path; empty when the referrer is the site
  itself.
- `t`: `document.title`.
- `s`: screen width, which GoatCounter uses to derive the device type.
- `e=true`, `p=<article id>`, `t=<article title>` for an article click (FR-013).
- `q` (query string) is never sent. `ns` is not sent, so GoatCounter can count unique visitors
  with its in-memory session (R1).
- Nothing is sent when `navigator.globalPrivacyControl === true` or
  `navigator.doNotTrack === '1'` (FR-006).

## R6. How do we test counting without counting?

**Decision**: an end-to-end test serves the built site under `https://sammieetje.github.io` with
Playwright's request routing and answers every request to the analytics host itself, so nothing
reaches GoatCounter. Unit tests cover the pure decisions.

**Rationale**: this tests the real browser path (beacon, click, navigation, opt-out signals,
stripped query strings, the single extra host) without polluting the statistics or depending on
the network. The existing localhost test keeps proving that tests send nothing at all.

## R7. Where does the article-click hook come from?

**Decision**: at build time, every link whose `href` is a URL in `src/site/articles.ts` gets a
`data-count-article="<id>"` attribute with the article's existing `id`, wherever it is rendered
(writing page; the method page already looks articles up with `articleById`). The script
listens to clicks on `a[data-count-article]` and does not prevent navigation. A unit test scans the
built HTML: every link to an article URL carries the attribute, and no other link does.

**Rationale**: one source of truth for what an article is (spec 006), and no need to edit
`articles.ts` by hand when `/publish-article` adds one.

## R8. Which host is named in the repository?

**Decision**: `src/site/analytics.ts` exports the endpoint `https://sammieetje.goatcounter.com/count`
and the production host. Both the script and the tests import them; the README names them.

**Open precondition**: Sander creates the GoatCounter account and site with code `sammieetje`
before implement. If that code is taken, the constant changes and nothing else does.
