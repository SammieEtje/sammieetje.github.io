# Implementation Plan: Software Bill of Materials

**Branch**: `014-sbom` | **Date**: 2026-10-24 | **Spec**: [spec.md](./spec.md)

## Summary

The plan adds one golden-path step, `npm run sbom`. It works in five parts:

- **Generate**: the step generates a CycloneDX 1.5 SBOM with npm's built-in `npm sbom`.
- **Mark shipped**: it marks what a production install installs as `required` and everything else
  as `excluded`, using the installed lock file instead of npm's own markers (which label
  5 shipped packages as development tooling).
- **Add actions**: it adds the SHA-pinned pipeline actions as components.
- **Stamp the build**: it records the build's commit, using the same source as the quality report.
- **Check**: it validates the result against the official schema and checks that it is complete.
  The gate fails, with a named cause, on any gap.

The file is written into `public/quality/`, so it ships inside the tested `dist` artifact at
`/quality/sbom.cdx.json`. The scorecard page reads its counts at build time and shows them
statically, with a link. Details: [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 6.0 strict, run natively by Node 24 LTS; GitHub Actions YAML; Astro 7 for the page
**Primary Dependencies**: npm 11's built-in `npm sbom`; new dev dependencies `ajv` 8.20.0 and `ajv-formats` 3.0.1; vendored CycloneDX 1.5 schemas
**Storage**: generated file `public/quality/sbom.cdx.json` (git-ignored), published with the site
**Testing**: Vitest for the enrichment, check, workflow policy and README; Playwright for the scorecard section (both languages, no JavaScript, counts equal the built file)
**Target Platform**: GitHub Actions (ubuntu-latest), GitHub Pages
**Project Type**: static site with CI/CD
**Performance Goals**: the step adds a few seconds to `checks` (`npm sbom` plus schema validation of about 870 KB); no page budget changes
**Constraints**: no runtime dependency, no client-side JavaScript, no secrets (SC-005); no local paths in the file (FR-005)
**Scale/Scope**: about 720 components today (npm plus 7 actions)

## Constitution Check

| Principle | Compliance | Status |
|-----------|-----------|--------|
| I. Right thing easy | one command, `npm run sbom`; `check` and CI run the same script | Pass |
| II. Test-first | unit tests for marking, actions, stamp, schema, completeness and privacy, and an e2e test for the page, all written and seen failing first | Pass |
| III. Traceability | `014:` references in the code; `data-spec="014:FR-011"` on the section | Pass |
| IV. Accessible | a static section with a heading, text and a link; covered by the existing axe run in both languages and colour schemes | Pass |
| V. Fast and light | no script on the page; the file is not loaded by any page; no runtime dependency (two dev dependencies, see Complexity Tracking) | Pass |
| VI. Private and secure | the file is checked for local paths; actions stay SHA-pinned; no new permissions or secrets | Pass |
| VII. Bilingual | new strings in EN and NL; the existing completeness test covers them | Pass |

Re-checked after design: no change.

## Project Structure

### Documentation (this feature)

```text
specs/014-sbom/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md
├── contracts/sbom.md
└── checklists/requirements.md
```

### Source Code (repository root)

```text
scripts/sbom.ts                       new: generate, markScope, pinnedActions, stamp, validate, check, summary
scripts/sbom-schema/1.5/*.json        new: vendored CycloneDX 1.5, spdx and jsf schemas (Prettier-ignored)
scripts/quality-report.ts             export currentCommit() for the shared build identity
src/site/sbom.ts                      new: build-time counts from public/quality/sbom.cdx.json
src/components/ScorecardPage.astro    + static SBOM section (014:FR-011)
src/i18n/ui.ts                        + scorecard.sbom.* strings, EN and NL
.github/workflows/pipeline.yml        + "Bill of materials" step, summary row, sbom artifact
package.json                          + "sbom"; check runs it before build; dev runs it first; + ajv, ajv-formats
.gitignore, .prettierignore           + public/quality/sbom.cdx.json; + scripts/sbom-schema/
README.md                             SBOM section; roadmap 014
tests/unit/sbom.test.ts               new: fixtures for every rule in research R2–R5
tests/unit/workflow-policy.test.ts    + step order, summary row, artifact; check order
tests/unit/readme.test.ts             + SBOM section
tests/e2e/scorecard.spec.ts           + section, link and counts in both languages, without JavaScript
```

**Structure Decision**: the rules live in pure functions in `scripts/sbom.ts`, with a thin CLI around
them, as in `quality-report.ts` and `trace-check.ts`. The functions are unit-tested with small
fixtures, so no test needs a real `npm sbom` run.

## Complexity Tracking

| Deviation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Two new dev dependencies (`ajv`, `ajv-formats`) | FR-006 requires validity in the CycloneDX format, which the official JSON Schema defines | A hand-written structural check only proves the fields we thought of; `@cyclonedx/cyclonedx-library` pulls in the same Ajv plus a larger library |
| Vendored schema files (about 185 KB) | Validation must work offline and give the same result locally and in CI | Fetching the schema at run time adds a network dependency to the gate |
| Scope marking overrides npm's development markers | npm marks 5 shipped packages as development, and `--omit dev` drops 42 shipped ones (R2) | Using npm's markers would publish a wrong answer to "do we ship X?" |
| Local and CI SBOMs differ in platform-specific binaries (R6) | The SBOM describes what was installed for that build | A lock-only SBOM lists binaries no build installed |
