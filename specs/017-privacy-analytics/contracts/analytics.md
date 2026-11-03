# Contract: Analytics Requests and Privacy Page

## Requests to the analytics host

Base: `https://sammieetje.goatcounter.com/count`, the only host besides the site's own origin
that a page may contact (FR-004). Sent with `navigator.sendBeacon`, falling back to an image
request. GoatCounter documents this endpoint as stable
([countjs-host](https://www.goatcounter.com/help/countjs-host)).

### Page view

```text
GET|POST /count?p=<pathname>&r=<referrer origin+path>&t=<title>&s=<screen width>&rnd=<random>
```

### Article click

```text
GET|POST /count?p=<article id>&t=<article title>&e=true&rnd=<random>
```

### Guarantees

| # | Guarantee | Requirement |
|---|---|---|
| C1 | No request at all unless `location.hostname` is `sammieetje.github.io` | FR-005 |
| C2 | No request when Global Privacy Control or Do Not Track is set | FR-006 |
| C3 | `p` and `r` never contain `?` or `#`; `q` is never sent | FR-007 |
| C4 | Exactly one page view per page load | FR-001 |
| C5 | Exactly one event per article-link click; the link still navigates | FR-013 |
| C6 | No cookies, no local storage, session storage or IndexedDB | FR-003 |
| C7 | A failed or blocked request changes nothing on the page | FR-008 |

## Privacy page

| Element | Rule |
|---|---|
| Route | `privacy`: `/privacy/` (EN), `/nl/privacy/` (NL), counterparts of each other |
| `data-spec` | `017:FR-010` on the statement; `017:FR-011` on the footer link |
| Content | Names GoatCounter and its operator, the data counted (page, referring site, title, screen width, article clicks, country, browser and device derived by GoatCounter), the storage location (Finland and Germany), the in-memory session of up to eight hours, that no IP addresses are stored, that no cookies or browser storage are used, the retention, and the opt-out (Global Privacy Control or Do Not Track, or blocking the host) |
| Without JavaScript | All content present |
| Copy | Passes the copy-style guard (spec 012) |
