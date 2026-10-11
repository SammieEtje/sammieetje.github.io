---

description: "Task list for 011 Automatic Dependency Updates"
---

# Tasks: Automatic Dependency Updates

**Input**: Design documents from `/specs/011-auto-dependency-updates/`

**Tests**: Required (constitution II). Test tasks precede their implementation and are seen
failing first. Code carries `011:T###` comments. Contract:
[contracts/dependency-automation.md](./contracts/dependency-automation.md).

## Phase 1: User Stories 1–2 — Non-breaking updates merge themselves, breaking ones wait (P1) 🎯 MVP

**Independent test**: the policy tests prove that only Dependabot patch and minor updates arm
auto-merge, majors arrive separately, and nothing bypasses the gate.

- [x] T001 [P] [US1] Write failing tests in `tests/unit/dependency-updates.test.ts` for `.github/workflows/dependency-updates.yml`, job `auto-merge`:
  - **Trigger**: runs on `pull_request` to `main`.
  - **Condition**: its `if` requires event `pull_request`, author `dependabot[bot]` and repository `SammieEtje/sammieetje.github.io`.
  - **Permissions**: exactly `{ contents: write, pull-requests: write }`.
  - **No checkout**: it has no `actions/checkout` step.
  - **Update type**: it uses `dependabot/fetch-metadata`, and the merge step's `if` names exactly the update types `version-update:semver-patch` and `version-update:semver-minor`.
  - **Merge command**: the merge runs `gh pr merge --auto --squash` without `--admin`.
- [x] T002 [P] [US2] Extend `tests/unit/dependabot.test.ts` with failing tests:
  - both ecosystems group with `patterns: ['*']` and `update-types: ['minor', 'patch']`, so majors fall outside the groups;
  - the existing ignore rules still hold.
- [x] T003 [P] [US1] Extend `tests/unit/workflow-policy.test.ts` with a guard test: no workflow references `secrets.` (SC-006). It passes today, so prove it by temporarily adding a `secrets.` reference and seeing it fail.
- [x] T004 [US1] Create `.github/workflows/dependency-updates.yml` with the `auto-merge` job, pinning `dependabot/fetch-metadata` v3.1.0 by SHA `25dd0e34f4fe68f24cc83900b1fe3fe149efef98` (makes T001 pass; T003 stays green).
- [x] T005 [US2] Update `.github/dependabot.yml` groups with `update-types: [minor, patch]` (makes T002 pass).

## Phase 2: User Story 3 — Known vulnerabilities in shipped dependencies block the gate (P1)

**Independent test**: `npm run audit` fails with a vulnerable shipped dependency and passes
without one, locally and in `checks`.

- [x] T006 [US3] Extend `tests/unit/workflow-policy.test.ts` with failing tests:
  - `package.json` has `"audit": "npm audit --omit=dev --audit-level=high"`;
  - `check` starts with `npm run audit`;
  - the existing parity test then requires the `checks` job to run it first.
- [x] T007 [US3] Add the `audit` script and prefix `check` in `package.json`, and add the "Known vulnerabilities" step (id `audit`) and its summary row as the first check in `.github/workflows/pipeline.yml` (makes T006 pass).

## Phase 3: User Story 4 — Automatic merges go live; daily re-check (P2)

**Independent test**: the pipeline runs daily on `main` and deploys for any non-pull-request run on
`main`, never for a pull request.

- [x] T008 [US4] Replace the deploy test in `tests/unit/workflow-policy.test.ts` with failing tests:
  - the pipeline has exactly one daily `schedule` cron;
  - `deploy` and the report's "Add the report to the site" and "Package site for Pages" steps require `github.ref == 'refs/heads/main'` and `github.event_name != 'pull_request'`.
- [x] T009 [US4] Add `schedule` (`23 4 * * *`) to `.github/workflows/pipeline.yml` and change the three conditions (makes T008 pass).

## Phase 4: User Story 5 — New releases wait 3 days (P2)

- [x] T010 [US5] Extend `tests/unit/dependabot.test.ts` with a failing test: both ecosystems set `cooldown: { default-days: 3 }`. Then add the cooldown to `.github/dependabot.yml`.

## Phase 5: User Story 6 — Updates that fall behind catch up (P3)

**Independent test**: given open pull requests in every state, the catch-up selects only
Dependabot-authored, armed, `BEHIND` ones and produces the update-then-dispatch commands.

- [x] T011 [P] [US6] Write failing tests in `tests/unit/dependency-catch-up.test.ts` for `behind(prs)` and `catchUpCommands(prs, repo)`:
  - **Selected**: only `author.login` `app/dependabot` or `dependabot[bot]`, with `autoMergeRequest` not null and `mergeStateStatus` `BEHIND`.
  - **Not selected**: `CLEAN`, `BLOCKED`, `DIRTY`, unarmed pull requests and other authors.
  - **Commands**: per pull request, in order, `['pr','update-branch','<n>','--repo',repo]` then `['workflow','run','pipeline.yml','--ref','<headRefName>','--repo',repo]`.
  - **Nothing behind**: an empty list gives no commands.
  - **Partial failure**: `runAll(commands, exec)` runs every command even when one throws, and returns the failed ones (R3).
- [x] T012 [P] [US6] Extend `tests/unit/dependency-updates.test.ts` with failing tests for job `catch-up`:
  - runs on `schedule` (one daily cron) and `workflow_dispatch`, and not on pull requests;
  - permissions exactly `{ contents: write, pull-requests: write, actions: write }`;
  - checks out with `persist-credentials: false`;
  - runs `node scripts/dependency-catch-up.ts` without `npm ci`.
- [x] T013 [P] [US6] Extend `tests/unit/dependabot.test.ts` with a failing test: npm runs on `monday` and Actions on `wednesday` (FR-007).
- [x] T014 [US6] Implement `scripts/dependency-catch-up.ts`, which lists open Dependabot pull requests with `gh`, runs the commands through `runAll` and exits non-zero if any failed. Add the `catch-up` job (cron `17 3 * * *`) to `.github/workflows/dependency-updates.yml`, and set the weekdays in `.github/dependabot.yml` (makes T011–T013 pass).

## Phase 6: Polish

- [x] T015 Document the dependency policy in `README.md` (what merges automatically, what waits, how vulnerabilities are caught, the daily runs). Bring the README up to date: the roadmap shows 009 and 010 as live and 011 as this PR, the gate table includes `npm run audit`, and the stack note covers both scripted pages. Note that `npm run check` needs network access for the audit.
- [x] T016 Run `npm run check`; run the negative audit experiment from quickstart.md and revert it.
- [ ] T017 Record validation results in quickstart.md, open the pull request and confirm `quality-gate` passes. After merge, verify the live behaviour (quickstart 6–9), including the first Actions update's automatic merge and the first catch-up (R3a), and report.

## Dependencies

- Phases 1–5 are independent of each other, except that T014's Dependabot weekday edit touches the same file as T005 and T010 (sequential).
- Phase 6 runs after all of them.

## Parallel examples

- T001, T002 and T003 are in different files and are written together.
- T011, T012 and T013 likewise.

## Implementation strategy

The MVP is Phase 1 (auto-merge with majors held back). Phases 2–5 add the security gate, the
deploy path, the waiting period and the catch-up; each is independently testable through its
policy tests.
