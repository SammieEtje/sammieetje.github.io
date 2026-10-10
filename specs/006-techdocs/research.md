# Research: TechDocs

## R1. Article data

- **Decision**: typed data in `src/site/articles.ts`. Titles, URLs and publication timestamps from
  LinkedIn's public article metadata (`og:title`, `datePublished`), fetched 2026-10-10; dates stored
  as the Europe/Amsterdam calendar date (the elite-sports article, 2026-03-08T23:00Z, is 9 March).
  Reading time = words ÷ 230, rounded up, from the vault texts. Pillars from the vault tags.
- Excerpts are written fresh (FR-007), one or two sentences per language; a unit test caps them at
  two sentences.

| id | Published | Pillar | Series | Min |
|----|-----------|--------|--------|-----|
| intake-form | 2026-06-02 | wrong image of people | — | 5 |
| developer-portal | 2026-05-18 | environment | platform-as-product 5/5 | 5 |
| it4it-conversations | 2026-05-13 | environment | 4/5 | 5 |
| uptime | 2026-04-28 | environment | 3/5 | 6 |
| teaches-by-doing | 2026-04-21 | environment | 2/5 | 4 |
| shipped-platform | 2026-04-14 | environment | 1/5 | 6 |
| community | 2026-03-31 | community | — | 6 |
| golden-cage | 2026-03-24 | environment | — | 6 |
| people-lazy | 2026-03-17 | wrong image of people | — | 5 |
| elite-sports | 2026-03-09 | community | — | 4 |

## R2. Links out

- **Decision**: article titles link to LinkedIn with `rel="noopener"`; a visually hidden suffix
  "(on LinkedIn)" / "(op LinkedIn)" completes the accessible name; titles carry `lang="en"`. The link
  gate skips external URLs (LinkedIn blocks automation); a unit test validates URL shape
  (`https://www.linkedin.com/pulse/<slug>`) and uniqueness.

## R3. Method cross-links (FR-009)

- `MethodPage.astro` renders a "Further reading" link from article ids: premise → `elite-sports`,
  levers → `golden-cage`, assumptions → `people-lazy`, community phase → `community`.
