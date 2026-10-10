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

`npm run check` is the whole quality gate, and the pipeline runs exactly the same scripts:

| Script                 | Checks                                                               |
| ---------------------- | -------------------------------------------------------------------- |
| `npm run format:check` | Prettier formatting                                                  |
| `npm run lint`         | ESLint for TypeScript and Astro                                      |
| `npm run typecheck`    | `astro check`, TypeScript strict, translation completeness           |
| `npm run test:unit`    | Vitest: dictionaries, routes, metadata, trace check, workflow policy |
| `npm run trace`        | Every `data-spec` and task reference exists in the specs             |
| `npm run build`        | Static build into `dist/`                                            |
| `npm run test:e2e`     | Playwright + axe: behaviour, both languages, both colour schemes     |
| `npm run links`        | Internal links in the built site                                     |
| `npm run budgets`      | Lighthouse budgets per page, written to `quality-report.json`        |

Use `npm run dev` for a local server at <http://localhost:4321>.

## Pipeline

[`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml) runs the gate on every pull
request and every push to `main`. Only a push to `main` that passed every check is deployed to
GitHub Pages, and what gets deployed is the exact build that was tested. `main` is protected:
nothing merges without a green `quality-gate`, administrators included.

Guardrails that are tested, not just agreed:

- workflows grant no permissions at the top level and the minimum per job;
- every third-party action is pinned to a full commit SHA;
- the CI steps and `npm run check` cannot drift apart;
- pages load no scripts, make no third-party requests and set no cookies;
- Dependabot proposes grouped updates for npm and Actions every week.

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
| 005  | API docs: "How I lead" manager README     | this PR |
| 006  | TechDocs: writing, by content pillar      | planned |
| 007  | Plugins: open-source projects             | planned |
| 008  | Playground: the path of least resistance  | planned |
| 009  | Scorecard: live quality metrics           | planned |

## Stack

Astro 7 (static output), TypeScript 6 strict, Vitest, Playwright with axe-core, Lighthouse CI,
GitHub Actions and GitHub Pages. Fonts are self-hosted. Images are optimised at build time
(AVIF/WebP), and the sharing cards are rendered by the build with Satori and resvg. There is no
client-side JavaScript yet.

## Content

The text and identity on this site describe a real person and are not licensed for reuse.
