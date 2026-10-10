# Research: Plugins

## R1. Curated data, no volatile numbers

- **Decision**: typed data in `src/site/projects.ts`; no stars, commit counts or CI badges (badges
  are third-party image requests, forbidden by constitution VI; counts go stale). Live repository
  metrics belong to 009 Scorecard.
- Lifecycle: this site `production` (it is live); `my-specdriven-app` `experimental` (a
  demonstration); `myPool` `experimental` (deployment status unknown, flagged for review).

## R2. Links

- Repository links and spec links are external (github.com) and not crawled by the link gate; a
  unit test checks URL shape (`https://github.com/SammieEtje/<repo>`) and uniqueness, and that every
  URL belongs to the allowlist of own repositories (so no fork or family project can appear).
- This site's card does not link to itself as a "live page"; it says "you're looking at it".

## R3. Route

- `{ id: 'plugins', paths: { en: '/plugins/', nl: '/nl/projecten/' } }`, sixth navigation
  section; six items keep three rows in the two-column phone navigation (no fold regression).
