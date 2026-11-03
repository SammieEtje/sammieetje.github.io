# Data Model: Privacy-Friendly Analytics

Nothing is stored by the site. These are the shapes the script builds and GoatCounter receives.

## Analytics config (`src/site/analytics.ts`)

| Field | Value | Rule |
|---|---|---|
| `endpoint` | `https://sammieetje.goatcounter.com/count` | The one analytics host (FR-004); https only |
| `productionHost` | `sammieetje.github.io` | Derived from `site` in `astro.config.mjs`; the only host that sends (FR-005) |

## Environment (read once per page load)

| Field | Source | Effect |
|---|---|---|
| `hostname` | `location.hostname` | Must equal `productionHost`, otherwise nothing is sent |
| `gpc` | `navigator.globalPrivacyControl` | `true` → nothing is sent (FR-006) |
| `dnt` | `navigator.doNotTrack` | `'1'` → nothing is sent (FR-006) |

`shouldCount(environment)` is a pure function: true only when the host matches and neither
signal is set.

## Page view

| Parameter | Content | Rule |
|---|---|---|
| `p` | `location.pathname` | No query string, no fragment (FR-007) |
| `r` | Referrer origin + path | Empty for same-site referrers; never a query string or fragment |
| `t` | `document.title` | As rendered |
| `s` | `screen.width` | Integer |
| `rnd` | Random string | Cache-buster, as `count.js` sends |

One per page load on the live site (FR-001).

## Article click

| Parameter | Content | Rule |
|---|---|---|
| `p` | Article id from `data-count-article` | Must be an id from `src/site/articles.ts` |
| `t` | Article title | As in `articles.ts`, in the link's language |
| `e` | `true` | Marks the request as an event |
| `rnd` | Random string | Cache-buster |

One per click on an `a[data-count-article]` (FR-013). Navigation is never prevented.

## Article link (build time)

Every `<a>` whose `href` equals an article URL in `src/site/articles.ts` carries
`data-count-article="<id>"` and `data-count-title="<title>"`. No other link carries either. The
script reads the title from the attribute, never from the link text, which can hold visually
hidden extras.

## Privacy statement (route `privacy`)

| Field | EN | NL |
|---|---|---|
| Path | `/privacy/` | `/nl/privacy/` |
| Content | service, data counted, location, retention, no cookies, opt-out | same, in Dutch |
| Linked from | footer of every page (FR-011) | same |

Not in the primary navigation.
