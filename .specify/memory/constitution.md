# sammieetje.github.io Constitution

This site is Sander Ettema's public profile, and it is also a working example of how he builds
platforms: the repository is the golden path, the pipeline is the guardrail, and every
decision can be traced back to a spec.

## Core Principles

### I. Make the Right Thing the Easy Thing

- The repository MUST offer one documented command per concern (`test`, `check`, `build`,
  `dev`) and CI MUST run exactly those commands, so local and pipeline results never disagree.
- Every rule in this constitution that can be checked by a machine MUST be checked in CI. A rule
  that only lives in a document is a wish.
- Conventions MUST be enforced by tooling (formatter, linter, type checker, tests) rather than by
  review comments.

**Rationale**: the site has to practise what it preaches. Contributors (human or agent) follow
the path of least resistance, so that path has to be the correct one.

### II. Test-First (NON-NEGOTIABLE)

- Every functional requirement (`FR-xxx`) MUST be covered by at least one automated test.
- Tests MUST be written before the implementation and MUST be seen failing first. In
  `tasks.md` every test task precedes the task that makes it pass.
- A requirement that cannot be phrased as a test MUST be sharpened in `/speckit-clarify` before
  planning.
- Unit and component logic is tested with a unit test runner; user-visible behaviour, routing,
  accessibility and both languages are tested end-to-end in a real browser.

**Rationale**: a spec you cannot verify is a wish, not an agreement.

### III. Traceability

- Every rendered element that implements a requirement MUST carry `data-spec="<NNN>:<ID>"`, for
  example `data-spec="001:FR-004"`. A test MUST fail when the code references an ID that does not
  exist in the corresponding `spec.md`.
- Code that implements a task MUST reference the task ID in a comment, for example `// T012`.
- Every Spec Kit phase MUST end with exactly one commit and a git tag `<NNN>-<phase>`, for example
  `001-plan`. Every spec MUST be delivered through exactly one pull request.

**Rationale**: a visitor who opens the developer tools must be able to reason from any element
back to the requirement and the decision that produced it.

### IV. Accessible to Everyone

- Every page MUST meet WCAG 2.2 level AA. Automated accessibility checks MUST report zero
  violations on every page, in both languages and in both light and dark colour schemes.
- All functionality MUST be operable with the keyboard alone, with a visible focus indicator.
- Motion MUST respect `prefers-reduced-motion`; colour MUST never be the only carrier of meaning.

**Rationale**: the audience includes executives on phones, engineers on keyboards and people
using assistive technology. Accessibility is cheap in the spec and expensive afterwards.

### V. Fast and Light by Default

- Pages MUST be pre-rendered static HTML. Client-side JavaScript is allowed only for an
  explicitly specified interactive feature and MUST be scoped to that feature.
- Budgets, enforced in CI on every page: Lighthouse performance >= 0.90 and accessibility,
  best practices and SEO >= 0.95; total first-party JavaScript <= 50 KB compressed per page.
- A new runtime dependency MUST be justified in `plan.md` under "Complexity Tracking".

**Rationale**: speed is the first thing a visitor experiences and the easiest proof of
engineering judgement.

### VI. Private and Secure by Default

- The site MUST NOT use analytics, trackers, cookies or third-party runtime requests. Fonts and
  other assets are self-hosted.
- Content MUST only contain information Sander has approved for public use. Private notes,
  assessments, performance agreements, family names and employment negotiations MUST NOT
  appear in the repository or on the site.
- GitHub Actions MUST use least-privilege `permissions`, third-party actions MUST be pinned to a
  full commit SHA, and dependencies MUST be kept current through automated update PRs.
- No secrets, local absolute paths or agent-session links may be committed.

**Rationale**: a profile in a regulated sector must be trustworthy in what it shows and in how it
is built.

### VII. Bilingual Parity

- English is the default language; Dutch is a full equal. Every user-facing string and page MUST
  exist in both languages, and a test MUST fail when a translation is missing.
- Each page MUST declare its language and link to its counterpart in the other language.

**Rationale**: the primary market is the Netherlands; the professional conversation is
international.

## Technology Frame

- Static site generator: Astro, with TypeScript in strict mode.
- Tests: Vitest for units and components; Playwright with axe-core for end-to-end and
  accessibility; Lighthouse CI for budgets.
- Hosting: GitHub Pages, published only through a GitHub Actions workflow that deploys with
  `actions/deploy-pages` after every quality gate has passed.
- Runtime: the active Node.js LTS version, pinned in the repository.
- Language of code, specs and documentation: English. Site content: English and Dutch.

## Development Workflow

- Order per feature: `specify` → `clarify` → `plan` → `tasks` → `analyze` → `implement`.
- Each feature lives on its own branch `<NNN>-<short-name>` and is merged into `main` through one
  pull request after the quality gate passes and the owner has reviewed it.
- `main` is always deployable; every push to `main` deploys to production.
- A feature is done when all tests pass, all budgets are met, the trace check reports no unknown
  IDs, and every task in `tasks.md` is checked off.

## Governance

- This constitution supersedes other working agreements. `/speckit-plan` and `/speckit-analyze`
  check every plan against these principles; any deviation MUST be justified in `plan.md` under
  "Complexity Tracking".
- Amendments are made with `/speckit-constitution`, land in their own commit, and are explained
  in the pull request that carries them.
- Versioning follows semver: MAJOR when a principle is removed or redefined, MINOR when a
  principle or section is added or materially expanded, PATCH for clarifications.

**Version**: 1.0.0 | **Ratified**: 2026-10-09 | **Last Amended**: 2026-10-09
