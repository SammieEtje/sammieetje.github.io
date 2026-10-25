# Implementation Plan: Immutable Evidence

**Branch**: `016-immutable-evidence` | **Date**: 2026-10-25 | **Spec**: [spec.md](./spec.md)

## Summary

A new last job, `evidence`, runs only after a successful deploy from `main`. It builds one
evidence record and publishes it as an immutable pre-release `evidence/<date>-<run id>`. The
record contains:

- every job and step outcome of the run, read from the platform's own API;
- the change details: the pull request, its author and merger, the gate on the pull request, or
  the commits since the previous record;
- the published quality report, SBOM, manifest and 015 signatures, byte-identical, taken from
  the Pages artifact itself;
- the test results, with the runner's paths normalised.

The record is signed with `actions/attest` (Rekor), and GitHub adds its own release attestation.
Immutable releases (switched on 2026-10-25) stop anyone from changing the assets or the tag. A
weekly retention workflow deletes records older than two years, and nothing else. The scorecard
and README say where the records are and how to verify one. Details: [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 6.0 strict on Node 24 LTS; GitHub Actions YAML; Astro 7 for the page
**Primary Dependencies**: none new. `actions/attest` (015's pin), `gh` on the runner, GitHub REST API (runs, pulls, check runs, compare, releases)
**Storage**: immutable GitHub pre-releases, about 2 MB each, about 1,460 kept at any time
**Testing**: Vitest for `buildRecord`, normalisation, the local-path check, `expired` and the workflow policy; Playwright for the scorecard section
**Target Platform**: GitHub Actions (ubuntu-latest), GitHub Releases, GitHub Pages
**Project Type**: static site with CI/CD
**Performance Goals**: a record within 15 minutes of going live (SC-001); `evidence` itself under 2 minutes
**Constraints**: no stored secrets (SC-005); release creation only in `evidence`, release deletion only in `clean-up` (FR-006)
**Scale/Scope**: about 2 records a day

## Constitution Check

| Principle | Compliance | Status |
|-----------|-----------|--------|
| I. Right thing easy | the record is a by-product of the pipeline; nothing to do by hand | Pass |
| II. Test-first | every rule is a pure function with fixture tests, and the workflow policy is asserted; all tests are seen failing first | Pass |
| III. Traceability | `016:` references in code; `data-spec="016:FR-009"` on the section | Pass |
| IV. Accessible | a static section, covered by axe in both languages and schemes | Pass |
| V. Fast and light | no page script, no runtime dependency | Pass |
| VI. Private and secure | SHA-pinned actions; per-job least privilege (`contents: write` only in `evidence` and `clean-up`); no secrets; no local paths in records | Justified (see Complexity Tracking) |
| VII. Bilingual | new strings in EN and NL | Pass |

Re-checked after design: no change.

## Project Structure

### Documentation (this feature)

```text
specs/016-immutable-evidence/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md
├── contracts/evidence.md
└── checklists/requirements.md
```

### Source Code (repository root)

```text
scripts/evidence.ts                        new: buildRecord, normaliseReport, findLocalPaths, expired, releaseNotes; CLI record|expired
scripts/sbom.ts                            export the local-path pattern for reuse
src/site/evidence.ts                       new: tag format, releases URL, verification command
src/components/ScorecardPage.astro         + static evidence section (016:FR-009)
src/i18n/ui.ts                             + scorecard.evidence.* strings, EN and NL
.github/workflows/pipeline.yml             + evidence job after deploy
.github/workflows/evidence-retention.yml   new: weekly clean-up
README.md                                  Evidence section; pipeline diagram; roadmap 015 live, 016 this PR
tests/unit/evidence-record.test.ts         new
tests/unit/evidence-privacy.test.ts        new
tests/unit/evidence-retention.test.ts      new
tests/unit/workflow-policy.test.ts         evidence job; retention workflow; who may write releases
tests/unit/repo-readme.test.ts             + Evidence section, diagram, roadmap
tests/e2e/scorecard.spec.ts                + evidence section in both languages, without JavaScript
```

## Complexity Tracking

| Deviation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `contents: write` in two jobs (`evidence`, `clean-up`) | Creating and deleting releases needs it; there is no narrower permission | A personal token would be a stored secret (SC-005); one job doing both would give every deploy delete rights |
| Test results are normalised copies, not byte copies | Raw reports contain the runner's absolute paths (FR-008) | Leaving them out loses the per-test evidence; publishing them raw breaks the privacy rule |
| An eighth pipeline job and a second scheduled workflow | A record may only exist after a live deploy, and deletion must stay apart from creation | Recording inside `sign` would record builds that never went live |
