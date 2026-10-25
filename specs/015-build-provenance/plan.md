# Implementation Plan: Signed Build Provenance

**Branch**: `015-build-provenance` | **Date**: 2026-10-25 | **Spec**: [spec.md](./spec.md)

## Summary

A new pipeline job, `sign`, runs only on `main` after the quality gate. It takes the exact site
that will go live and does the following:

- writes a `sha256sum`-style manifest of every published file;
- signs SLSA build provenance for the manifest and for the SBOM, plus a CycloneDX SBOM
  attestation over the manifest. All three use `actions/attest` with the job's own OIDC identity:
  Sigstore, no keys, logged in Rekor;
- publishes the three signature bundles next to the files;
- verifies them with `gh attestation verify` (signer workflow, branch, predicate);
- re-checks every file against the manifest;
- only then packages the site for Pages.

`deploy` waits for `sign`. Visitors verify with the same commands, shown on the scorecard and in
the README. They need no account and can work offline. Details: [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 6.0 strict on Node 24 LTS; GitHub Actions YAML; Astro 7 for the page
**Primary Dependencies**: `actions/attest` v4.2.2 (SHA-pinned, new); `gh` on the runner (preinstalled); no new npm dependency
**Storage**: published files `/quality/manifest.sha256` and three `*.sigstore.json` bundles; attestations on GitHub and in Rekor
**Testing**: Vitest for the manifest rules, the verification commands, the workflow policy and the README; Playwright for the scorecard section (EN/NL, no JavaScript)
**Target Platform**: GitHub Actions (ubuntu-latest), GitHub Pages
**Project Type**: static site with CI/CD
**Performance Goals**: `sign` adds under a minute to a `main` run; pull request runs unchanged
**Constraints**: no stored secrets or keys (SC-004); signing permissions on one job, `main` only (FR-008); no client-side JavaScript
**Scale/Scope**: 54 published files today; 3 statements per deploy; about 2 deploys a day (push plus daily)

## Constitution Check

| Principle | Compliance | Status |
|-----------|-----------|--------|
| I. Right thing easy | the manifest and verify scripts run locally the same way; the visitor commands are generated from the code the pipeline runs | Pass |
| II. Test-first | manifest, command and workflow-policy tests and the scorecard e2e test are written and seen failing first | Pass |
| III. Traceability | `015:` references in code; `data-spec="015:FR-010"` on the section | Pass |
| IV. Accessible | a static section with a heading, text, links and a code block; covered by the axe run in both languages and schemes | Pass |
| V. Fast and light | no page script; no runtime dependency | Pass |
| VI. Private and secure | SHA-pinned action; least privilege (`sign` alone gets `id-token`/`attestations`, on `main` only); no secrets | Pass |
| VII. Bilingual | new strings in EN and NL | Pass |
| Workflow: "every push to main deploys" | still true, now after `sign` | Pass |

Re-checked after design: no change.

## Project Structure

### Documentation (this feature)

```text
specs/015-build-provenance/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md
├── contracts/provenance.md
└── checklists/requirements.md
```

### Source Code (repository root)

```text
scripts/manifest.ts                   new: listFiles, renderManifest, parseManifest, checkTree; CLI write|check
scripts/provenance.ts                 new: CLI verify <dir>, runs the commands from src/site/provenance.ts
src/site/provenance.ts                new: statements, published paths, verifyArgs(), visitorCommands()
src/components/ScorecardPage.astro    + static provenance section (015:FR-010)
src/i18n/ui.ts                        + scorecard.provenance.* strings, EN and NL
.github/workflows/pipeline.yml        report uploads `site`; new `sign` job; deploy needs sign
package.json                          links skips the four signed-at-deploy paths
README.md                             Provenance section; pipeline diagram; roadmap 014 live, 015 this PR
tests/unit/manifest.test.ts           new
tests/unit/provenance.test.ts         new: verifyArgs and visitorCommands
tests/unit/workflow-policy.test.ts    sign job, permissions, step order, deploy needs; report changes
tests/unit/repo-readme.test.ts        + provenance section, roadmap
tests/e2e/scorecard.spec.ts           + provenance section in both languages, no JavaScript
```

**Structure Decision**: the rules (manifest format and check, verification arguments) are pure
functions with thin CLIs, as in 014. The commands a visitor sees are generated from the same
function the pipeline runs, so they cannot drift.

## Complexity Tracking

| Deviation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| A seventh pipeline job (`sign`) | Signing permissions must not reach pull request runs (FR-008); a job is the smallest unit of permissions | Signing in `report` would give `id-token: write` to every pull request run of that job |
| `links` skips four paths | They exist only in the signed Pages artifact, not in the build the link check sees (R6) | Placeholder files would be published unsigned and fail verification |
| Existing 009/011 tests that pin Pages packaging to `report` change | Packaging moves to `sign`, after verification | Packaging before verification would deploy what was not checked |
