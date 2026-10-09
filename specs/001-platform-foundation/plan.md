# Implementation Plan: Platform Foundation

**Branch**: `001-platform-foundation` | **Date**: 2026-10-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-platform-foundation/spec.md`

## Summary

Build the walking skeleton of the profile site: a statically generated, bilingual (EN at `/`,
NL at `/nl/`) developer-portal shell with an identity home page and a bilingual 404 page, and a
GitHub Actions pipeline that runs the full quality gate (format, lint, types, unit, trace,
build, end-to-end with axe, links, Lighthouse budgets) on every pull request and deploys the
exact gated build to GitHub Pages on `main`. Everything is developed test-first.

## Technical Context

**Language/Version**: TypeScript 6.0 (strict); Node.js 24 LTS in CI (`>=24` locally)

**Primary Dependencies**: Astro 7.3 (static output, i18n), `@astrojs/sitemap`; self-hosted fonts
via `@fontsource-variable/inter` and `@fontsource-variable/jetbrains-mono`

**Storage**: N/A (static files; content in the repository)

**Testing**: Vitest 5 (unit), Playwright 1.64 + `@axe-core/playwright` 4.13 (end-to-end and
accessibility), Lighthouse CI 0.15 (budgets), linkinator 8 (links), custom trace check

**Target Platform**: GitHub Pages (static hosting); evergreen browsers, mobile first

**Project Type**: static website

**Performance Goals**: Lighthouse performance >= 0.90, accessibility/best-practices/SEO >= 0.95
on every page; 0 KB JavaScript in this feature (budget 50 KB)

**Constraints**: no client JS for this feature; no third-party requests or cookies; WCAG 2.2 AA;
reflow at 320 px; all actions SHA-pinned; least-privilege workflow permissions

**Scale/Scope**: 3 HTML pages (`/`, `/nl/`, `/404.html`); ~40 interface strings; 1 workflow

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | How this plan complies | Status |
|-----------|------------------------|--------|
| I. Right thing easy | `npm run check` chains the exact scripts CI runs step by step; every machine-checkable rule is a script | Pass |
| II. Test-first | `tasks.md` orders every test task before its implementation task; unit + e2e cover each FR | Pass |
| III. Traceability | `data-spec="001:FR-xxx"` on elements, `001:T###` in code comments, `trace` script fails on unknown IDs; one commit + tag per phase; one PR | Pass |
| IV. Accessible | axe in both languages × both colour schemes; skip link; keyboard focus; reduced motion; 320 px reflow test | Pass |
| V. Fast and light | static output, no scripts; LHCI assertions per page incl. script size | Pass |
| VI. Private & secure | self-hosted fonts; e2e asserts same-origin requests and no cookies; workflow policy test; no secrets; local settings ignored | Pass |
| VII. Bilingual parity | typed dictionary + key-parity unit test + page-parity build test; `lang`, `hreflang`, canonical | Pass |

Post-design re-check (after Phase 1): unchanged, all pass. No violations to track.

## Project Structure

### Documentation (this feature)

```text
specs/001-platform-foundation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── routes.md
│   ├── ui-shell.md
│   └── quality-gate.md
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
astro.config.mjs            # static output, site URL, i18n, sitemap
package.json                # scripts = the golden path (contracts/quality-gate.md)
tsconfig.json               # extends astro/tsconfigs/strictest
eslint.config.js
.prettierrc.json
lighthouserc.cjs
playwright.config.ts
vitest.config.ts
.nvmrc
src/
├── i18n/
│   ├── ui.ts               # typed EN/NL dictionaries
│   └── utils.ts            # t(), locale helpers, counterpart paths
├── site/
│   ├── routes.ts           # route registry → navigation
│   ├── profile.ts          # name, role line, headline, LinkedIn
│   ├── meta.ts             # PageMeta builder (title, canonical, hreflang, og)
│   └── build-info.ts       # commit SHA → footer link
├── layouts/PortalLayout.astro
├── components/
│   ├── SkipLink.astro
│   ├── SiteHeader.astro
│   ├── LanguageSwitch.astro
│   ├── PrimaryNav.astro
│   ├── SiteFooter.astro
│   └── EntityHeader.astro  # home identity block
├── pages/
│   ├── index.astro
│   ├── nl/index.astro
│   └── 404.astro
└── styles/
    ├── tokens.css          # light-dark() design tokens
    └── global.css
public/robots.txt
scripts/
├── trace-check.ts
└── quality-report.ts
tests/
├── unit/                   # *.test.ts (Vitest)
└── e2e/                    # *.spec.ts (Playwright)
.github/
├── workflows/pipeline.yml
└── dependabot.yml
```

**Structure Decision**: single static-site project at the repository root. Shared logic is in
plain TypeScript modules under `src/i18n` and `src/site` so it can be unit-tested without
rendering; Astro components stay thin. Tests sit in `tests/unit` and `tests/e2e`; repository
tooling scripts in `scripts/`.

## Complexity Tracking

No constitution violations. Runtime dependencies added (justification required by V): only the
two self-hosted font packages, because the identity needs them and the alternative (a font CDN)
violates VI.
