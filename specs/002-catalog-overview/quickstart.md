# Quickstart: Catalog Overview

## Local validation

```bash
npm ci
npm run check
npm run dev            # http://localhost:4321 and /nl/
```

## Manual scenarios

| # | Scenario | Expected | Spec |
|---|----------|----------|------|
| 1 | Open `/` at 1280 × 800 | Photo, name, headline and the first key number visible without scrolling | SC-001 |
| 2 | Open `/` at 360 px | Name, headline, LinkedIn link still above the fold; cards stack | US1, 001 SC-001 |
| 3 | Open `/nl/` | Key numbers `10.000`, `5×`, `2,5×`; About and card titles in Dutch | US2, US3 |
| 4 | Open `/og/en.png` and `/og/nl.png` | 1200 × 630 card with photo, name and headline in that language | US5 |
| 5 | Paste `https://sammieetje.github.io/` into LinkedIn Post Inspector (after merge) | Preview shows the English card | SC-004 |
| 6 | DevTools → Performance, reload | No layout shift from the photo | SC-002 |
