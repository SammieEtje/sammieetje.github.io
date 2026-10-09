# Contract: Public URLs

Base URL: `https://sammieetje.github.io`

| Route id | English | Dutch | In navigation | Notes |
|----------|---------|-------|---------------|-------|
| overview | `/` | `/nl/` | yes — "Overview — who I am" / "Overzicht — wie ik ben" | FR-001, FR-007 |
| not-found | `/404.html` | — (bilingual page) | no | Served by GitHub Pages for any unknown path (FR-011) |

Rules:

- Every page except `404.html` exists in both languages at the paths above.
- Trailing slashes: directory-style URLs (`/nl/`), as GitHub Pages serves `index.html`.
- `sitemap-index.xml` lists every page in both languages; `robots.txt` references it.
- Later specs add rows to this table; they never change existing URLs without a redirect page.
