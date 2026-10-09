# Research: Platform Foundation

All decisions below resolve the open points in the plan's Technical Context. Versions were
checked against the npm registry and GitHub releases on 2026-10-09.

## R1. Static site generator

- **Decision**: Astro 7 with `output: 'static'`, TypeScript strict.
- **Rationale**: pre-renders plain HTML with zero client JavaScript by default (constitution V);
  built-in i18n routing; content collections for later specs (writing, projects); "islands" give
  a scoped way to add the one interactive feature (playground) without turning the site into an
  SPA. Officially documents GitHub Pages deployment.
- **Alternatives**: Jekyll (native to Pages, but Ruby/Liquid, weak i18n, no islands); Hugo (fast,
  but Go templates and no component islands); Vite + React SPA (heavier, weaker SEO/budgets);
  hand-written HTML (manual i18n and layout duplication).

## R2. TypeScript version

- **Decision**: TypeScript `~6.0.3`.
- **Rationale**: TypeScript 7 (native compiler) is released, but `@astrojs/check` supports
  `^5 || ^6` and `typescript-eslint` supports `<6.1`. 6.0 is the newest version every tool accepts.
- **Alternatives**: 7.0 (breaks type checking and linting today); 5.9 (older for no reason).

## R3. Bilingual routing

- **Decision**: Astro i18n with `locales: ['en', 'nl']`, `defaultLocale: 'en'`,
  `prefixDefaultLocale: false`. English at `/`, Dutch at `/nl/`. A typed dictionary
  (`src/i18n/ui.ts`) in which the Dutch object is typed against the English keys, so a missing
  key is a type error; a unit test additionally asserts equal key sets and non-empty values. An
  end-to-end build test asserts every English HTML page has a Dutch counterpart and vice versa.
- **Rationale**: compile-time and test-time enforcement of parity (constitution VII, FR-010)
  with no runtime cost. No language redirect (needs JS or cookies; spec edge case).
- **Alternatives**: i18next or similar runtime libraries (runtime JS, unnecessary); separate
  sites per language (duplication).

## R4. Colour scheme without scripting

- **Decision**: `color-scheme: light dark` on `:root` and design tokens defined with the CSS
  `light-dark()` function, so the browser picks the scheme before first paint.
- **Rationale**: FR-005 forbids scripting for this; `light-dark()` is Baseline in all current
  browsers and avoids duplicate media-query blocks.
- **Alternatives**: `prefers-color-scheme` media queries (equivalent, more verbose; used as the
  mental model); JS theme toggle (out of scope; would need storage).

## R5. Fonts and visual identity

- **Decision**: own identity (clarification Q3). Self-hosted variable fonts from Fontsource:
  Inter (interface) and JetBrains Mono (metadata chips, code-like labels), Latin subset only,
  `font-display: swap`. Palette: neutral ink/paper surfaces with a single warm "path" accent;
  tokens in `src/styles/tokens.css`. Contrast is verified by the axe checks in both schemes.
- **Rationale**: self-hosting satisfies "no third-party requests" (FR-013); two variable font
  files keep weight low; the mono accent carries the developer-portal feel.
- **Alternatives**: Google Fonts CDN (third-party request); system fonts only (cheapest, but
  weaker identity); Polderworks design system (rejected in clarification).

## R6. Test stack

- **Decision**: Vitest 5 for unit tests (dictionaries, routes, metadata helpers, trace check,
  workflow policy); Playwright 1.64 with `@axe-core/playwright` 4.13 for end-to-end tests
  against the built site served by `astro preview`, run in Chromium; checks cover both
  languages, both colour schemes (`page.emulateMedia({ colorScheme })`), JavaScript disabled,
  320/360 px widths, and network/cookie inspection.
- **Rationale**: the e2e suite runs against the exact artefact that will be deployed.
- **Alternatives**: Jest (slower, ESM friction); Cypress (heavier, no WebKit/axe parity needed).

## R7. Budgets

- **Decision**: Lighthouse CI 0.15 (`lhci autorun`) over `dist/` (`staticDistDir`) for every
  HTML page, mobile emulation, 3 runs per URL (median). Assertions: performance >= 0.90;
  accessibility, best-practices, SEO >= 0.95; `resource-summary:script:size` <= 51200 bytes.
  Results written to `.lighthouseci/` and condensed by `scripts/quality-report.ts` into
  `quality-report.json` (FR-019).
- **Rationale**: one tool covers all constitution V budgets and produces machine-readable output
  the later scorecard spec can display.
- **Alternatives**: PageSpeed Insights API (external, needs a deployed URL); custom size script
  only (does not measure performance scores).

## R8. Link checking

- **Decision**: linkinator 8 over `dist/`, recursive, skipping external URLs.
- **Rationale**: internal links must never break (FR-004, FR-011); external sites (LinkedIn)
  block bots and would make the gate flaky.
- **Alternatives**: lychee (Rust binary, extra install step in CI); Playwright crawl (reinvents).

## R9. Traceability check

- **Decision**: `scripts/trace-check.ts` (run with Node's built-in type stripping) scans `src/`,
  `tests/`, `scripts/` and `.github/` for `data-spec="NNN:ID"` attributes and `NNN:T###`
  comments, and fails when the feature folder or the ID does not exist in that feature's
  `spec.md` (FR/SC/US) or `tasks.md` (T). The feature prefix on task comments (`// 001:T012`)
  makes the reference unambiguous across specs; the constitution's `// T012` example is honoured
  in spirit. Exposed for unit testing as a pure function.
- **Alternatives**: plain `// T012` comments (ambiguous once several specs exist).

## R10. Pipeline shape and deployment

- **Decision**: one workflow `.github/workflows/pipeline.yml`:
  - `quality-gate` job on `pull_request` to `main`, `push` to `main` and `workflow_dispatch`:
    runs the same npm scripts that `npm run check` chains, one step each, writes a step summary,
    uploads `quality-report.json` and Lighthouse output as an artefact, and (on `main` only)
    uploads the built `dist/` with `actions/upload-pages-artifact`.
  - `deploy` job, `needs: quality-gate`, only for `push` to `main`, with `pages: write` and
    `id-token: write`, deploying via `actions/deploy-pages` into the `github-pages` environment.
  - Top-level `permissions: {}`; each job declares its own minimum. `concurrency` cancels
    superseded PR runs but never cancels an in-progress deployment.
  - Actions pinned by full SHA: checkout v7.0.1 `3d3c42e5…`, setup-node v7.1.0 `949feb24…`,
    configure-pages v6.0.0 `45bfe019…`, upload-pages-artifact v5.0.0 `fc324d35…`,
    deploy-pages v5.0.1 `368f8252…`, upload-artifact v7.0.2 `cf430e03…`.
- **Rationale**: the deployed artefact is exactly the one that passed the gate (FR-016); the
  deploy job cannot run when the gate fails.
- **Alternatives**: separate workflows chained with `workflow_run` (harder to reason about);
  `withastro/action` (convenient, but hides the steps the site is meant to show).

## R11. Merge protection

- **Decision**: a branch protection rule on `main` requiring the `quality-gate` status check and
  an up-to-date branch, applied with the GitHub API during implementation and verified with a
  deliberately failing pull request (SC-006).
- **Alternatives**: repository rulesets (equivalent; protection rules are simpler to read for
  visitors of the repo).

## R12. Build identity

- **Decision**: at build time, `src/site/build-info.ts` reads `GITHUB_SHA` (CI) or falls back to
  `git rev-parse HEAD`, and `local` when neither exists; the footer shows the first 7 characters
  linking to `https://github.com/SammieEtje/sammieetje.github.io/commit/<sha>`.
- **Alternatives**: runtime fetch of the latest commit (third-party request, forbidden).

## R13. Runtime and tooling versions

- **Decision**: Node 24 LTS in CI (`.nvmrc` = `24`), `engines.node` `>=24`. Astro 7.3,
  `@astrojs/check` 0.9, `@astrojs/sitemap` 3.7, Vitest 5.0, Playwright 1.64, axe 4.13, LHCI 0.15,
  ESLint 10 + typescript-eslint 8.71 + eslint-plugin-astro 3.2, Prettier 3.9 +
  prettier-plugin-astro 1.1, linkinator 8.1, yaml 2.9.
- **Rationale**: latest compatible releases; Node 24 is the active LTS line.

## R14. Dependency updates

- **Decision**: `.github/dependabot.yml` with weekly `npm` and `github-actions` updates, grouped
  per ecosystem to keep PR noise low. Dependabot updates SHA-pinned actions with version comments.
