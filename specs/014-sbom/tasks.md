---

description: "Task list for 014 Software Bill of Materials"
---

# Tasks: Software Bill of Materials

**Input**: Design documents from `/specs/014-sbom/`

**Tests**: Required (constitution II). Each test task comes before the implementation it covers,
and every test is seen failing first. Code carries `014:T###` comments. Contract:
[contracts/sbom.md](./contracts/sbom.md). Data shapes: [data-model.md](./data-model.md).

## Phase 1: Setup

- [ ] T001 Add the dev dependencies `ajv` 8.20.0 and `ajv-formats` 3.0.1 to `package.json` (exact
  versions, as for the other dev dependencies). Vendor `bom-1.5.schema.json`, `spdx.schema.json`
  and `jsf-0.82.schema.json` from `https://raw.githubusercontent.com/CycloneDX/specification/1.5/schema/`
  into `scripts/sbom-schema/1.5/` byte for byte. Add `scripts/sbom-schema/` to `.prettierignore`,
  and add `public/quality/sbom.cdx.json` to `.gitignore` under "Generated".

## Phase 2: Foundational

- [ ] T002 Export `currentCommit()` from `scripts/quality-report.ts`, so the SBOM and the quality
  report share one build identity (FR-010). This is a pure refactor: the existing
  `tests/unit/quality-report.test.ts` stays green.

## Phase 3: User Story 1 - Every build produces a bill of materials (P1) 🎯 MVP

**Independent test**: `npm run sbom` writes `public/quality/sbom.cdx.json`. Every installed
component is listed with its version, purl and correct scope, plus the pinned actions and the
build's commit.

- [ ] T003 [P] [US1] Write failing tests in `tests/unit/sbom.test.ts` for `markScope(bom, installed)`
  with small fixtures of an npm SBOM and a hidden lockfile:
  - an entry with `dev: true` gets `scope: "excluded"` and keeps `cdx:npm:package:development`;
  - entries with `devOptional: true` or no flag get `scope: "required"`, and the development
    property is removed when npm set it;
  - duplicates of one `name@version` at different paths are treated as one;
  - nested `node_modules/a/node_modules/b` paths resolve the name from the last segment unless
    `name` is set.
- [ ] T004 [P] [US1] Write failing tests in `tests/unit/sbom.test.ts` for `pinnedActions(texts)` and
  `actionComponent(action)`:
  - `uses: actions/checkout@<40-hex> # v7.0.1` gives one action, with owner, repo, sha and tag;
  - a subpath action keeps its path in `name` and as a purl subpath;
  - the same action and commit in two workflows counts once;
  - a pinned `uses:` without a `# <tag>` comment is returned as a problem
    `action not pinned with a tag`;
  - local `./` actions and `docker://` references are ignored;
  - each component follows data-model "Action component": `type: application`,
    `scope: excluded`, `purl` `pkg:github/<owner>/<repo>@<sha>`, `version` = tag, property
    `cdx:github:action:commit` = sha, and a `vcs` reference.
- [ ] T005 [P] [US1] Write failing tests in `tests/unit/sbom.test.ts` for
  `stamp(bom, { commit, repoUrl })`:
  - it adds `metadata.properties` entry `sammieetje:build:commit`;
  - it adds a `vcs` external reference on `metadata.component`;
  - it is idempotent;
  - the CLI takes its commit from the exported `currentCommit()`. Assert that `scripts/sbom.ts`
    imports it from `./quality-report.ts`.
- [ ] T006 [US1] Implement `markScope`, `pinnedActions`, `actionComponent` and `stamp` in
  `scripts/sbom.ts`, with types from data-model.md (makes T003–T005 pass).
- [ ] T007 [US1] Add the CLI to `scripts/sbom.ts`. It runs `npm sbom --sbom-format cyclonedx` with
  `execFileSync`, reads `node_modules/.package-lock.json` and `.github/workflows/*.yml`, applies
  T006, and writes `public/quality/sbom.cdx.json` pretty-printed with a trailing newline. On a
  generation error it exits 1, prints npm's message and writes nothing. Add `"sbom":
  "node scripts/sbom.ts"` to `package.json`, change `dev` to `npm run sbom && astro dev`, and
  check the result by hand with quickstart steps 1–2.

## Phase 4: User Story 2 - The gate refuses a build without a complete bill of materials (P1)

**Independent test**: an invalid, incomplete or wrongly marked SBOM fails `npm run sbom` locally
and in `checks`, naming the cause; the summary shows the check.

- [ ] T008 [P] [US2] Write failing tests in `tests/unit/sbom.test.ts` for `validate(bom)` against the
  vendored schema:
  - a minimal valid CycloneDX 1.5 document passes;
  - one without `bomFormat` fails, and so does one with a component lacking `name`;
  - formats `iri-reference` and `idn-email` do not make validation throw.
- [ ] T009 [P] [US2] Write failing tests in `tests/unit/sbom.test.ts` for
  `check(bom, installed, actions)`, returning data-model "SBOM check result". Each failure must
  produce exactly the named problem:
  - a component missing for an installed `name@version` → `missing`;
  - a component that is not installed → `not installed`;
  - no `version` → `no version`;
  - no `purl` → `no purl`;
  - shipped but `excluded` → `marked not shipped but shipped`;
  - development-only but `required` → `marked shipped but development only`;
  - an action in the workflows without a component, or the reverse → `missing` / `not installed`;
  - a serialised document containing `/Users/`, `/home/` or `C:\` → `contains a local path`.

  Also cover the passing and counting rules:
  - a missing licence leaves `passed` true and increments `counts.withoutLicence`;
  - `counts.shipped`, `counts.pipeline` and `counts.actions` are correct.
- [ ] T010 [P] [US2] Write failing tests in `tests/unit/sbom.test.ts` for `renderSummary(result)`:
  - the heading `### Bill of materials`;
  - the four count rows from the contract;
  - the line `✅ Bill of materials complete and valid (CycloneDX 1.5).` when passing;
  - on failure, `❌ Bill of materials incomplete or invalid.` and one line per problem.
- [ ] T011 [P] [US2] Extend `tests/unit/workflow-policy.test.ts` with failing tests:
  - the `checks` job has a step `Bill of materials` with `id: sbom` and `run: npm run sbom`,
    after `Traceability` and before `Build`;
  - the summary step has `SBOM: ${{ steps.sbom.outcome }}` and a row with `npm run sbom`;
  - a step uploads `public/quality/sbom.cdx.json` as artifact `sbom`, pinned like the other
    upload steps;
  - `package.json` `check` runs `npm run sbom` after `npm run trace` and before `npm run build`.
    The existing parity test then covers the order in CI.
- [ ] T012 [US2] Implement `validate` (Ajv with `ajv-formats`, the vendored schemas registered by
  their file names, `iri-reference` and `idn-email` accepted), `check` and `renderSummary` in
  `scripts/sbom.ts`. Wire them into the CLI: append the summary to `$GITHUB_STEP_SUMMARY` when it
  is set, and set the exit status from `passed` (makes T008–T010 pass).
- [ ] T013 [US2] Update `package.json` `check`, and add the step, the summary row and the artifact
  upload to `.github/workflows/pipeline.yml` with `014:T013` comments (makes T011 pass). Run
  quickstart step 3 (negative checks) by hand.

## Phase 5: User Story 3 - Visitors can inspect what the live site is built from (P2)

**Independent test**: after `npm run build`, `dist/quality/sbom.cdx.json` exists and carries the
same commit as the quality report of that run.

- [ ] T014 [US3] Write a failing e2e test in `tests/e2e/scorecard.spec.ts`:
  - `GET /quality/sbom.cdx.json` on the built site returns JSON with `bomFormat` `CycloneDX`;
  - it has a `sammieetje:build:commit` property;
  - it has at least one `required` and one `excluded` component.

  Also add a unit test in `tests/unit/sbom.test.ts` asserting that the pipeline's report job
  packages the `dist` that came from `checks` (the `Get the tested build` download precedes
  `Package site for Pages`), so the published SBOM is the checked one. Then make the e2e test pass
  by running `npm run sbom` before `npm run build` (already wired by T013). Confirm that
  `npm run links` accepts the new file.

## Phase 6: User Story 4 - The site shows where to find it (P3)

**Independent test**: the scorecard page in EN and NL shows the section, both counts and the link,
also without JavaScript, and the counts equal the built file.

- [ ] T015 [P] [US4] Write failing tests in `tests/unit/sbom.test.ts` for `sbomCounts(path)` in
  `src/site/sbom.ts`:
  - it returns `{ shipped, pipeline }` from a fixture file;
  - it throws `Run \`npm run sbom\` first` when the file is missing.
- [ ] T016 [P] [US4] Write failing e2e tests in `tests/e2e/scorecard.spec.ts` for `/scorecard/` and
  `/nl/scorecard/`:
  - a section with `data-spec="014:FR-011"`, a heading and text in the page's language;
  - two figures equal to the `required` and `excluded` counts in `dist/quality/sbom.cdx.json`;
  - a link with `href="/quality/sbom.cdx.json"`;
  - all of it visible in a context with `javaScriptEnabled: false`.
- [ ] T017 [US4] Implement `sbomCounts` in `src/site/sbom.ts`. Add the `scorecard.sbom.heading`,
  `scorecard.sbom.text`, `scorecard.sbom.shipped`, `scorecard.sbom.pipeline` and
  `scorecard.sbom.link` strings in EN and NL to `src/i18n/ui.ts`. The copy must pass the style
  guard (no em dashes, no contrasts, first person). Render the static section in
  `src/components/ScorecardPage.astro` with `014:T017` and `data-spec="014:FR-011"` (makes T015
  and T016 pass; the axe run stays at zero violations).

## Phase 7: Polish & Cross-Cutting

- [ ] T018 [P] Write a failing test in `tests/unit/sbom.test.ts` that `README.md` has a section
  `## Bill of materials` mentioning `npm run sbom`, `/quality/sbom.cdx.json`, `CycloneDX` and
  `not shipped`, and a roadmap row for 014. Then write the section and the row in `README.md`
  (FR-012). The roadmap still ends at 011 marked `this PR`: set 011 to `live`, add 012 and 013
  as `live`, and add 014 as `this PR`.
- [ ] T019 Run `npm run check` locally and see it pass end to end. Record the counts the summary
  prints in the pull request description.
- [ ] T020 Open the pull request. Then, after the owner merges, run quickstart steps 8–9 on the
  live site and record the result in a follow-up docs commit.

## Dependencies & Execution Order

- T001 → T002 → US1 (T003–T007) → US2 (T008–T013) → US3 (T014) → US4 (T015–T017) → Polish
  (T018–T020).
- US2 needs US1's file. US3 needs US2's pipeline step. US4 needs the built file from US3.
- Within a phase, the `[P]` test tasks touch different `describe` blocks or files and can be
  written together. The implementation tasks after them are sequential.

## Parallel Example: User Story 2

```text
T008 validate tests  ┐
T009 check tests     ├─ together, then T012 → T013
T010 summary tests   │
T011 workflow tests  ┘
```

## Implementation Strategy

- **MVP**: Phases 1–3 (US1). `npm run sbom` produces a correct, queryable SBOM locally.
- **Then**: US2 makes it a gate, US3 publishes it, and US4 makes it findable. Each is verifiable
  on its own before the next starts. Everything ships in one pull request (constitution III).
