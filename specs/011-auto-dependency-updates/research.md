# Research: Automatic Dependency Updates

## R1. How an update merges itself

- **Decision**: a new workflow, `.github/workflows/dependency-updates.yml`, runs on every pull
  request to `main`. Its `auto-merge` job runs only when the pull request was opened by
  `dependabot[bot]` in this repository. It reads the update type with `dependabot/fetch-metadata`
  (v3.1.0, pinned by SHA). For `version-update:semver-patch` and `version-update:semver-minor` it
  arms GitHub's native auto-merge: `gh pr merge --auto --squash`.
- GitHub then merges only when branch protection is satisfied: the required `quality-gate` check
  is green and the branch is up to date (strict). Nothing is bypassed (FR-003), and `--admin` is
  never used.
- For a grouped pull request, fetch-metadata reports the highest update type in the group. With
  majors split out of the groups (R4), a group is at most minor. A missing or unknown type matches
  neither value, so it stays manual (FR-002). By default, fetch-metadata also verifies that the
  commits were authored by Dependabot.
- **Least privilege (FR-004)**: the job gets `contents: write` and `pull-requests: write` only, the
  documented minimum for arming auto-merge. It has no checkout step, so no code from the pull
  request runs with that token. It uses `github.token`, so there are no stored secrets (SC-006).
- **Squash**: one commit per update on `main`, titled after the pull request. Feature PRs keep
  their merge commits.
- **Alternatives**: merging directly in a `workflow_run` job after the pipeline. That duplicates
  branch protection logic, and Dependabot-triggered runs have restricted tokens. Mergify or Renovate
  were rejected because they need a third-party app with write access.

## R2. Getting an automatic merge to the live site

- **Finding**: GitHub does not start new workflow runs for events caused by the workflow's own
  `GITHUB_TOKEN`, except `workflow_dispatch` and `repository_dispatch`. A merge performed by
  auto-merge that was armed with that token therefore does not trigger the `push` pipeline on
  `main`, so the update lands but is not deployed. This is a documented limitation, confirmed in
  practice by others using the same pattern.
- **Decision**: `pipeline.yml` gains a daily `schedule` (04:23 UTC). A scheduled run, like a push or
  a manual dispatch on `main`, runs the full gate and deploys when it passes. The `deploy` job and
  the report's packaging steps change from "push to main" to "not a pull request, on main".
- The same run is the daily vulnerability check (FR-009, SC-004), because advisories are published
  without any repository change. A failure notifies the owner through GitHub's standard
  notification for failed scheduled runs, and the live site stays on the last passing build.
- **Alternatives**:
  - A personal access token or GitHub App token for the merge would trigger the push run at once,
    but adds a long-lived credential (rejected, SC-006).
  - An auto-merge job that polls until the merge and then dispatches the pipeline on `main` would
    deploy within minutes. It holds a runner for the whole gate (~7 minutes) on every update and
    adds polling logic; the daily run is simpler and also provides the daily audit.

## R3. Updates that fall behind `main`

- **Finding**: branch protection requires pull requests to be up to date (strict). Dependabot
  rebases its own pull requests only when they conflict with `main` or when its schedule runs; a
  pull request that is merely behind stays blocked. Two npm pull requests usually conflict on
  `package-lock.json` and rebase themselves. An Actions pull request, or any update open while a
  feature PR merges, does not.
- **Decision**:
  1. **Stagger**: npm updates on Monday and Actions updates on Wednesday (FR-007), so the weekly
     groups do not wait on each other.
  2. **Catch-up**: the same workflow has a `catch-up` job on a daily schedule (03:17 UTC, before
     the pipeline's run) and on manual dispatch. It checks out `main`, which is trusted code, and
     runs `scripts/dependency-catch-up.ts`.
     - The script lists open Dependabot pull requests and selects those with auto-merge armed and
       merge state `BEHIND`.
     - For each one, it updates the branch (`gh pr update-branch`) and dispatches `pipeline.yml`
       on that branch (`gh workflow run --ref`).
     - The dispatch is needed because the update itself, made with the workflow token, starts no
       run.
     - The dispatched run reports `quality-gate` on the pull request's new head commit, which
       satisfies the required check; auto-merge then completes, and the 04:23 run deploys.
  - Permissions: `contents: write` (update the branch), `pull-requests: write`, `actions: write`
    (dispatch).
  - The selection logic is a pure function with unit tests; the job only executes the commands it
    returns.
- **Trade-off**: after a branch update by the workflow, Dependabot treats the pull request as
  edited and stops rebasing it. That is acceptable because the pull request is about to merge. If
  its gate then fails, the owner handles it like any failed update.
- **Verification risk**: that a `workflow_dispatch` run's `quality-gate` satisfies the required
  check is expected from how GitHub matches required checks (by name, on the head commit), but it
  cannot be proven before merge. The quickstart verifies it on the first real catch-up. The
  fallback is the "Update branch" button, now enabled.
- **Alternatives**:
  - Turn off strict up-to-date protection: fully automatic, but `main` could turn red between daily
    runs, and it weakens the owner's own pull requests (rejected).
  - Merge queue: not available for repositories owned by a personal account.
  - An `@dependabot rebase` comment from the workflow: whether Dependabot accepts commands from
    `github-actions[bot]` is undocumented (rejected).

- **Partial failures**: the script runs every pull request's commands even when an earlier one
  fails, and it exits non-zero at the end. A failed scheduled run notifies the owner and names
  each pull request that needs a hand.

## R3a. Changes to workflow files

- **Risk**: the workflow token cannot hold the `workflows` permission. GitHub may refuse two
  things done with it when they would write a workflow file:
  - completing an auto-merge of an Actions update, which edits `.github/workflows/*`;
  - a catch-up branch update that carries new workflow changes from `main` into the pull request.
- Dependabot's own pushes are not affected. This cannot be proven before merge either.
- **Decision**: keep one mechanism and verify it on the first Actions update (Wednesday) and the
  first catch-up.
- **Fallback if refused**: Actions updates stay a one-click manual merge (their gate has already
  run), and npm updates stay fully automatic. The README then states this instead of claiming
  otherwise.

## R4. Groups and the waiting period

- **Decision**: each ecosystem keeps one group, now limited with `update-types: [minor, patch]`.
  Dependabot proposes every other update, the majors, as an individual pull request (FR-006), so a
  major cannot hold back a group.
- `cooldown: { default-days: 3 }` on both ecosystems (FR-005). Dependabot documents that cooldown
  applies to version updates only and never to security updates. `default-days` is supported for
  npm and GitHub Actions; the per-semver keys are not supported for Actions, so they are not used.
- The existing `ignore` rules stay unchanged.

## R5. The vulnerability gate

- **Decision**: a new script, `npm run audit` (`npm audit --omit=dev --audit-level=high`), is the
  first step of `npm run check` and of the `checks` job, so local and CI runs match (FR-008).
  `--omit=dev` limits it to the production dependencies the site is built from: astro,
  @astrojs/sitemap and the two font packages. `--audit-level=high` fails on high and critical
  only.
- The source is the npm registry's advisory database, the GitHub Advisory Database that Dependabot
  alerts also use.
- Development tooling currently has 11 high findings, all through `@lhci/cli`, and npm's only
  suggested "fix" is a downgrade to 0.1.0. These findings are visible as Dependabot alerts and are
  handled by its security updates, but they do not block the gate (clarification 2026-10-11).
- There is no ignore or override mechanism. A shipped vulnerability without a fix keeps the gate
  red until the owner acts (spec edge case).

## R6. Repository settings (done before this feature)

Enabled on 2026-10-11 with the owner's approval:

- Dependabot alerts and security updates
- secret scanning and push protection
- allow auto-merge and allow update branch
- delete branch on merge

Branch protection is unchanged: required check `quality-gate`, strict, enforced for admins.
