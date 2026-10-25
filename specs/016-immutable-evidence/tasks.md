---

description: "Task list for 016 Immutable Evidence"
---

# Tasks: Immutable Evidence

**Input**: Design documents from `/specs/016-immutable-evidence/`

**Tests**: Required (constitution II). Each test task comes before the implementation it covers,
and every test is seen failing first. A guard that passes today is proven by making it fail on
purpose. Code carries `016:T###` comments. Contract: [contracts/evidence.md](./contracts/evidence.md).
Data shapes: [data-model.md](./data-model.md).

## Phase 1: Setup

- [ ] T001 Confirm the precondition: `gh api repos/SammieEtje/sammieetje.github.io/immutable-releases`
  returns `"enabled": true`. Export the local-path pattern from `scripts/sbom.ts` as `LOCAL_PATH`.
  This is a refactor only: the 014 tests stay green.

## Phase 2: User Story 1 - Every deploy leaves a complete evidence record (P1) 🎯 MVP

**Independent test**: from fixtures for a push, a daily run and a manual run, `buildRecord` returns
an `evidence.json` that names the commit, run, trigger and actor. It also lists every job and step
except `evidence`, the change details and every file digest.

- [ ] T002 [P] [US1] Write failing tests in `tests/unit/evidence-record.test.ts` for
  `buildRecord(inputs)`:
  - **Push**: exactly one `changes` entry with `pullRequest`, `author`, `mergedBy` and `prGate`.
  - **Schedule**: one entry per commit since `previous`. A Dependabot squash merge carries its pull
    request; a direct commit has `pullRequest: null`.
  - **Manual**: `run.trigger` is `workflow_dispatch` and `run.actor` is the person who started it.
  - **Gate**: `gate` lists every job and step except the `evidence` job. A step named in the
    `checks` summary table carries its local command (for example `Known vulnerabilities` →
    `npm run audit`, `Bill of materials` → `npm run sbom`); others carry `null`.
  - **Files**: `files` lists every asset with its SHA-256. The published files carry
    `source: "published"`; `unit.json` and `e2e.json` carry `source: "normalised"` and their
    `originalSha256`.
  - **Chain**: the tag is `evidence/<UTC date>-<run id>`, and `previous` is the latest earlier
    record's tag, or `null`.
- [ ] T003 [P] [US1] Write failing tests in `tests/unit/evidence-record.test.ts` for
  `normaliseReport(text, workdir)` and `findLocalPaths(files)`:
  - normalising replaces every occurrence of the work directory with `.`;
  - a file that still contains `/Users/`, `/home/` or `C:\` is named;
  - the pattern is the one exported by `scripts/sbom.ts`.
- [ ] T004 [P] [US1] Extend `tests/unit/workflow-policy.test.ts` with failing tests for the
  `evidence` job:
  - it is the last job, has `needs: deploy` and has the same `if` as `deploy`;
  - its permissions are exactly
    `{ contents: write, actions: read, checks: read, 'pull-requests': read, 'id-token': write, attestations: write }`;
  - its steps follow the contract in order;
  - `Check out` has `persist-credentials: false`;
  - `Sign the record` uses the 015 `actions/attest` pin with `subject-path: evidence/*`.
- [ ] T005 [US1] Implement `buildRecord`, `normaliseReport` and `findLocalPaths` in
  `scripts/evidence.ts` (makes T002–T003 pass).
- [ ] T006 [US1] Add the CLI `record <dir>` to `scripts/evidence.ts`:
  - it calls `gh api` for the run's jobs, the pull request or comparison, the pull request's
    `quality-gate` check run and the latest `evidence/` release;
  - it writes `evidence.json` and the normalised reports;
  - it exits 1, naming the file, when `findLocalPaths` finds anything.

## Phase 3: User Story 2 - The record cannot be changed afterwards (P1)

**Independent test**: the `evidence` job signs the record, publishes it as an immutable
pre-release that is never marked latest, and verifies both signatures. No other pipeline job can
write contents.

- [ ] T007 [P] [US2] Write failing tests in `tests/unit/evidence-record.test.ts` for
  `releaseNotes(record)` and `releaseArgs(record)`:
  - the arguments are `release create <tag> … --prerelease --latest=false --target <commit>
    --title "Evidence <date> <short sha>" --notes-file <file>`;
  - the notes link the run and every pull request.
- [ ] T008 [P] [US2] Extend `tests/unit/workflow-policy.test.ts` with failing tests:
  - `Publish the record` runs `node scripts/evidence.ts publish evidence`, and
    `Verify the release` runs `node scripts/evidence.ts verify evidence`, after `Sign the record`;
  - no pipeline job other than `evidence` has `contents: write`. This guard passes today: prove it
    can fail by temporarily giving `report` `contents: write`.
- [ ] T009 [US2] Implement `releaseNotes` and `releaseArgs`, and the CLI `publish <dir>` (copy the
  bundle to `evidence.sigstore.json`, then `gh release create`) and `verify <dir>`
  (`gh release verify <tag>` and `gh attestation verify evidence.json` with 015's `verifyArgs`)
  in `scripts/evidence.ts` (makes T007 pass).
- [ ] T010 [US2] Add the `evidence` job to `.github/workflows/pipeline.yml` with `016:T010`
  comments, following the contract (makes T004 and T008 pass).

## Phase 4: User Story 3 - Evidence is kept for two years, and no longer (P2)

**Independent test**: `expired` returns only `evidence/` releases more than two calendar years old,
and the retention workflow is the only place that deletes releases.

- [ ] T011 [P] [US3] Write failing tests in `tests/unit/evidence-retention.test.ts` for
  `expired(releases, now)`:
  - exactly two years is kept, and two years and one day is expired;
  - releases without the `evidence/` prefix are never returned;
  - the result is sorted oldest first and carries tag, deploy date and commit;
  - a leap-day deploy (2028-02-29) expires on 2030-03-01.
- [ ] T012 [P] [US3] Extend `tests/unit/workflow-policy.test.ts` with failing tests for
  `.github/workflows/evidence-retention.yml`:
  - it is triggered by a weekly schedule and by `workflow_dispatch`;
  - it has top-level `permissions: {}` and one job `clean-up` with `{ contents: write }`;
  - it runs `node scripts/evidence.ts clean-up`;
  - no other workflow contains `gh release delete`.
- [ ] T013 [US3] Implement `expired` and the CLI `expired` and `clean-up` (delete each with
  `gh release delete <tag> --yes --cleanup-tag`, and summarise tag, date and commit, or "nothing
  to remove") in `scripts/evidence.ts`. Create `.github/workflows/evidence-retention.yml` (makes
  T011–T012 pass).

## Phase 5: User Story 4 - Anyone can find and check the evidence (P3)

**Independent test**: the scorecard (EN and NL) explains the records and the two-year retention,
links to them and shows the verification command, also without JavaScript. The README describes
the same.

- [ ] T014 [P] [US4] Write failing tests:
  - in `tests/e2e/scorecard.spec.ts`, a section `data-spec="016:FR-009"` with a heading, a link to
    `releasesUrl` from `src/site/evidence.ts`, and a `pre code` equal to `verifyCommand()`, in both
    languages and without JavaScript;
  - in `tests/unit/repo-readme.test.ts`, a `## Evidence` section mentioning `evidence/`,
    `immutable`, `two years` and `gh release verify`, the diagram `sign ──► deploy ──► evidence`,
    and the roadmap with 015 `live` and 016 `this PR`.
- [ ] T015 [US4] Implement `src/site/evidence.ts` (`tagPrefix`, `releasesUrl`, `verifyCommand`),
  the `scorecard.evidence.*` strings in EN and NL, and the static section in
  `src/components/ScorecardPage.astro`. Write the README section, diagram and roadmap (makes T014
  pass; axe stays at zero).

## Phase 6: Polish & Cross-Cutting

- [ ] T016 Run `npm run check` locally and see it pass end to end. On the pull request, `sign`,
  `deploy` and `evidence` are skipped and `quality-gate` is green.
- [ ] T017 Open the pull request. After the owner merges, run quickstart steps 4–9 and record the
  result in a follow-up docs commit.

## Dependencies & Execution Order

- T001 → US1 (T002–T006) → US2 (T007–T010) → US3 (T011–T013) → US4 (T014–T015) → Polish
  (T016–T017).
- Within a phase, `[P]` tasks write different files or different test files. T002 and T003 share
  `evidence-record.test.ts` in separate `describe` blocks and are written in one sitting.
