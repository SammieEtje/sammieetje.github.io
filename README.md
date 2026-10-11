# sammieetje.github.io

[![Pipeline](https://github.com/SammieEtje/sammieetje.github.io/actions/workflows/pipeline.yml/badge.svg)](https://github.com/SammieEtje/sammieetje.github.io/actions/workflows/pipeline.yml)

The public profile of Sander Ettema, live at **<https://sammieetje.github.io>**.

> People take the path of least resistance. I build environments where the right thing is the
> easy thing — together.

This repository is part of the profile. The site is styled as an internal developer portal with
Sander as the catalog entity, and it is built the way he builds platforms: the golden path is
the only path, every rule that a machine can check is checked, and every element on the page
traces back to a spec.

## The golden path

```bash
npm ci
npx playwright install chromium
npm run check
```

`npm run check` is the whole quality gate, and the pipeline runs exactly the same scripts (the
audit needs network access to the npm advisory database):

| Script                 | Checks                                                               |
| ---------------------- | -------------------------------------------------------------------- |
| `npm run audit`        | No known high or critical vulnerability in shipped dependencies      |
| `npm run format:check` | Prettier formatting                                                  |
| `npm run lint`         | ESLint for TypeScript and Astro                                      |
| `npm run typecheck`    | `astro check`, TypeScript strict, translation completeness           |
| `npm run test:unit`    | Vitest: dictionaries, routes, metadata, trace check, workflow policy |
| `npm run trace`        | Every `data-spec` and task reference exists in the specs             |
| `npm run build`        | Static build into `dist/`                                            |
| `npm run test:e2e`     | Playwright + axe: behaviour, both languages, both colour schemes     |
| `npm run links`        | Internal links in the built site                                     |
| `npm run budgets`      | Lighthouse budgets per page (`LHCI_SHARD=i/n` for one shard)         |

Use `npm run dev` for a local server at <http://localhost:4321>.

## Pipeline

[`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml) runs the gate on every pull
request, every push to `main` and once a day on `main`, as five jobs:

```text
checks ──► budgets 1/3 · 2/3 · 3/3 (parallel Lighthouse shards) ──► report ──► quality-gate ──► deploy
```

`checks` runs everything except the budgets and uploads the built site; the budget shards measure
that exact build in parallel; `report` merges their results with the test counts and pipeline
timing into one quality report, which on `main` is deployed with the site at
[`/quality/report.json`](https://sammieetje.github.io/quality/report.json) and shown on the
[scorecard](https://sammieetje.github.io/scorecard/). `quality-gate` is the single required check:
it is green only when every job above succeeded. `main` is protected: nothing merges without it,
administrators included, and a merge is live within ten minutes.

Guardrails that are tested, not just agreed:

- workflows grant no permissions at the top level and the minimum per job;
- every third-party action is pinned to a full commit SHA;
- the CI steps and `npm run check` cannot drift apart;
- pages load no scripts (except the playground and the scorecard, within a 50 KB budget), make no
  third-party requests and set no cookies;
- dependency updates follow the policy below, and the workflow token is the only credential.

## Dependencies

Routine updates do not wait for a person; the quality gate approves them.

- **Proposals**: Dependabot proposes npm updates on Monday and Actions updates on Wednesday
  ([`.github/dependabot.yml`](.github/dependabot.yml)). Patch and minor updates are grouped per
  ecosystem. A new release is only proposed after it has been public for 3 days, because hijacked
  releases are usually caught and withdrawn within that time. Security updates do not wait.
- **Merging itself**: [`dependency-updates.yml`](.github/workflows/dependency-updates.yml) turns on
  auto-merge for Dependabot's patch and minor pull requests, version and security updates alike.
  GitHub merges only when `quality-gate` is green and the branch is up to date. The job never
  checks out the pull request's code and uses no stored secrets.
- **Waiting for the owner**: major updates arrive one by one, and so does anything whose update
  type is unknown. They wait for a review.
- **Catching up**: an approved update that fell behind `main` is brought up to date and re-checked
  by a daily catch-up job.
- **Going live**: merges made by automation start no pipeline of their own, so the daily pipeline
  run on `main` ships them within a day.
- **Vulnerabilities**:
  - The gate fails on any known high or critical vulnerability in the dependencies the site is
    built from (`npm run audit`). Because the gate also runs daily, a new advisory is caught
    within a day even when nothing changes, and nothing vulnerable is deployed.
  - Development tooling is covered by Dependabot alerts and security updates.
  - Secret scanning with push protection is on.

## Spec-driven

Every feature is built with [Spec Kit](https://github.com/github/spec-kit):
`specify → clarify → plan → tasks → analyze → implement`, with one commit and one git tag
(`<NNN>-<phase>`) per phase and one pull request per spec. The rules live in the
[constitution](.specify/memory/constitution.md); the specs live in [`specs/`](specs/).

Open the developer tools on any page: elements carry `data-spec="001:FR-004"`-style attributes
that point to the requirement they implement, and the `trace` check fails when one points
nowhere.

## Roadmap

| Spec | Section                                   | Status  |
| ---- | ----------------------------------------- | ------- |
| 001  | Platform foundation: shell, i18n, gate    | live    |
| 002  | Catalog overview: photo, key numbers      | live    |
| 003  | Deployment history: career as release log | live    |
| 004  | Golden paths: the method                  | live    |
| 005  | API docs: "How I lead" manager README     | live    |
| 006  | TechDocs: writing, by content pillar      | live    |
| 007  | Plugins: open-source projects             | live    |
| 008  | Playground: the path of least resistance  | live    |
| 009  | Scorecard: live quality metrics           | live    |
| 010  | Exact JavaScript measurement on scorecard | live    |
| 011  | Automatic dependency updates              | this PR |

## Stack

Astro 7 (static output), TypeScript 6 strict, Vitest, Playwright with axe-core, Lighthouse CI,
GitHub Actions and GitHub Pages. Fonts are self-hosted. Images are optimised at build time
(AVIF/WebP), and the sharing cards are rendered by the build with Satori and resvg. Client-side
JavaScript exists on two pages only. On the playground, the same adoption model that renders the
default chart at build time re-runs in the browser. The scorecard loads the live quality report.
Each ships about 1 KB compressed. Every other page ships zero scripts, and a test keeps it that
way.

## Content

The text and identity on this site describe a real person and are not licensed for reuse.
