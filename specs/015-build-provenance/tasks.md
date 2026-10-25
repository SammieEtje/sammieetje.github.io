---

description: "Task list for 015 Signed Build Provenance"
---

# Tasks: Signed Build Provenance

**Input**: Design documents from `/specs/015-build-provenance/`

**Tests**: Required (constitution II). Each test task comes before the implementation it covers,
and every test is seen failing first. Code carries `015:T###` comments. Contract:
[contracts/provenance.md](./contracts/provenance.md). Data shapes:
[data-model.md](./data-model.md).

## Phase 1: Setup

- [ ] T001 Resolve and record the pin for `actions/attest` v4.2.2
  (`1e69f48acb82d1966a394da916b4c1698aa569d6`). Confirm with
  `gh api repos/actions/attest/commits/v4.2.2 --jq .sha` that the SHA still points at the tag.
  Nothing else changes in this task.

## Phase 2: User Story 1 - Every deploy carries signed provenance (P1) 🎯 MVP

**Independent test**: the manifest lists every published file with its checksum. On `main`, the
`sign` job signs the manifest and the SBOM and attests the SBOM over the manifest, with the
job's own identity and no secret. Pull requests sign nothing.

- [ ] T002 [P] [US1] Write failing tests in `tests/unit/manifest.test.ts` for `listFiles(dir)`
  and `renderManifest(entries)` against a temporary directory:
  - every file is listed with its SHA-256, sorted by path, with forward slashes and no leading `/`;
  - `quality/manifest.sha256` and `quality/*.sigstore.json` are excluded;
  - the output is `<64 hex>  <path>\n` per line ("two spaces between the digest and the path, as
    `sha256sum` writes it"), with a trailing newline;
  - a fixture line equals the output of `shasum -a 256` for the same file.
- [ ] T003 [P] [US1] Write failing tests in `tests/unit/provenance.test.ts` for
  `src/site/provenance.ts`:
  - `statements` lists exactly the three rows of the data-model table: subject, predicate type
    and bundle path;
  - `verifyArgs({ file, bundle, predicateType })` returns `attestation verify <file> --bundle
    <bundle> --repo SammieEtje/sammieetje.github.io --signer-workflow
    SammieEtje/sammieetje.github.io/.github/workflows/pipeline.yml --source-ref refs/heads/main
    --deny-self-hosted-runners --predicate-type <type>`.
- [ ] T004 [P] [US1] Extend `tests/unit/workflow-policy.test.ts` with failing tests for the `sign`
  job:
  - it exists between `quality-gate` and `deploy`, with `needs: quality-gate`, and has the same
    `if` as `deploy` (main only, never a pull request);
  - its permissions are exactly `{ contents: read, id-token: write, attestations: write }`;
  - no other job has `id-token` or `attestations`, except `deploy`'s existing `id-token: write`;
    this part passes today, so prove it can fail by temporarily giving `report` `id-token: write`;
  - its steps follow the contract in order: three `actions/attest` steps, each pinned to the T001
    SHA, with the `subject-path`/`sbom-path` inputs from the contract;
  - the `Publish the signatures` step copies each `steps.<id>.outputs.bundle-path` to the
    published path in `src/site/provenance.ts`.

  Also replace the 009 and 011 assertions that pin Pages packaging to `report`. Now `report` ends
  with `Keep the site` (artifact `site`, under the deploy condition), and
  `actions/upload-pages-artifact` appears only in `sign`, as its last step.
- [ ] T005 [US1] Implement `listFiles` and `renderManifest`, and the CLI `write <dir> <out>`, in
  `scripts/manifest.ts` (makes T002 pass).
- [ ] T006 [US1] Implement `src/site/provenance.ts`: `repo`, `signerWorkflow`, `statements`,
  `verifyArgs` (makes T003 pass).
- [ ] T007 [US1] Change `.github/workflows/pipeline.yml` (`015:T007` comments):
  - in `report`, replace `Package site for Pages` with `Keep the site`;
  - add the `sign` job with steps 1–7 and 10 of the contract;
  - make `deploy` `needs: sign`.

  This makes the US1 part of T004 pass. The verify and check steps follow in US2.

## Phase 3: User Story 2 - Nothing is deployed without valid provenance (P1)

**Independent test**: a tampered file or manifest fails `scripts/manifest.ts check` with a
named cause. The `sign` job verifies all three statements before packaging, so a failure skips
`deploy`.

- [ ] T008 [P] [US2] Write failing tests in `tests/unit/manifest.test.ts` for
  `checkTree(dir, manifestText)`. Each failure must produce exactly the named problem:
  - a file whose content changed → `<path>: changed`;
  - a listed file that is gone → `<path>: missing`;
  - a file on disk that the manifest does not list → `<path>: not listed`;
  - a malformed line → `manifest: invalid line <n>`.

  Also cover the passing and exclusion rules:
  - an untouched tree passes;
  - the manifest and the bundles themselves are not reported as `not listed`.
- [ ] T009 [P] [US2] Write failing tests in `tests/unit/provenance.test.ts` for the verify CLI's
  plan, `verifyPlan(dir)`:
  - it gives one `gh` invocation per statement, with paths under `<dir>/quality/`, in data-model
    order;
  - it gives a result line naming the statement;
  - `scripts/provenance.ts` takes its arguments from `verifyArgs` (assert the import).
- [ ] T010 [P] [US2] Extend `tests/unit/workflow-policy.test.ts` with failing tests:
  - `sign` has `Verify the provenance` (`node scripts/provenance.ts verify dist`) and then
    `Check the files against the manifest` (`node scripts/manifest.ts check dist
    dist/quality/manifest.sha256`), after `Publish the signatures` and before `Package site for
    Pages`;
  - no step in `sign` has `continue-on-error`.
- [ ] T011 [US2] Implement `checkTree` and the CLI `check` in `scripts/manifest.ts`, and
  `verifyPlan` plus the CLI `verify` in `scripts/provenance.ts` (makes T008 and T009 pass). The
  CLI exits 1 on the first failed `gh` call and names the statement.
- [ ] T012 [US2] Add steps 8–9 of the contract to `sign` in `.github/workflows/pipeline.yml`
  (makes T010 pass). Run quickstart step 2 (tamper locally) by hand.

## Phase 4: User Story 3 - A visitor can verify the live site themselves (P2)

**Independent test**: the visitor commands are generated from the same arguments the pipeline
uses, download exactly the published paths, and contain the single-page check. They are proven
live after merge (quickstart 6–8).

- [ ] T013 [US3] Write failing tests in `tests/unit/provenance.test.ts` for `visitorCommands()`:
  - it downloads exactly the five published paths under `https://sammieetje.github.io/quality/`;
  - it runs `gh` with `verifyArgs` for each statement, followed by `&& echo verified`;
  - it contains the single-page check (`curl -s https://sammieetje.github.io/career/ | shasum -a
    256` and `grep ' career/index.html$' manifest.sha256`);
  - it uses no other tool than `curl`, `gh`, `shasum` and `grep`.

  Then implement `visitorCommands` in `src/site/provenance.ts`.
- [ ] T014 [US3] Write a failing test in `tests/unit/workflow-policy.test.ts`: the `links` script
  in `package.json` skips exactly `/quality/manifest\.sha256` and
  `/quality/[^/]+\.sigstore\.json` besides the existing external skip. Then update `links` in
  `package.json`.

## Phase 5: User Story 4 - The site and README explain how (P3)

**Independent test**: the scorecard page in EN and NL shows the explanation, the links and the
commands, also without JavaScript. The README describes the provenance.

- [ ] T015 [P] [US4] Write failing e2e tests in `tests/e2e/scorecard.spec.ts` for `/scorecard/`
  and `/nl/scorecard/`, in a context with `javaScriptEnabled: false`:
  - a section `data-spec="015:FR-010"` with a heading in the page's language;
  - links to `/quality/manifest.sha256` and the three bundle paths;
  - a `pre code` block whose text equals `visitorCommands()`.
- [ ] T016 [P] [US4] Extend `tests/unit/repo-readme.test.ts` with failing tests:
  - a `## Provenance` section mentions `manifest.sha256`, `sigstore.json`,
    `gh attestation verify` and `no account`;
  - the pipeline diagram shows `sign`;
  - the roadmap has 014 `live` and 015 `this PR`.
- [ ] T017 [US4] Implement the scorecard section (makes T015 pass; axe stays at zero):
  - add `scorecard.provenance.heading`, `.text`, `.files` and `.commands` in EN and NL to
    `src/i18n/ui.ts`, passing the style guard;
  - render the static section in `src/components/ScorecardPage.astro` with `015:T017`, using
    `statements` and `visitorCommands()`.
- [ ] T018 [US4] Write the README: a `## Provenance` section, the pipeline diagram and text with
  `sign`, and the roadmap (makes T016 pass).

## Phase 6: Polish & Cross-Cutting

- [ ] T019 Run `npm run check` locally and see it pass end to end. Push the branch and confirm on
  the pull request that `sign` and `deploy` are skipped and `quality-gate` is green (quickstart
  4).
- [ ] T020 Open the pull request. After the owner merges, run quickstart steps 5–9 against the
  live site without a GitHub login, and record the result in a follow-up docs commit.

## Dependencies & Execution Order

- T001 → US1 (T002–T007) → US2 (T008–T012) → US3 (T013–T014) → US4 (T015–T018) → Polish
  (T019–T020).
- US2 adds checks to the job US1 created. US3's commands use US1's `verifyArgs`. US4 renders
  US3's commands.
- `[P]` tasks write different files. The implementation tasks after them are sequential.

## Implementation Strategy

- **MVP**: Phases 1–2. `main` runs sign the build, and the attestations appear on GitHub.
- **Then**: US2 makes signing a gate before deploy, US3 makes it verifiable for anyone, and US4
  explains it. Everything ships in one pull request (constitution III).
