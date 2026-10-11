# Implementation Plan: Automatic Dependency Updates

**Branch**: `011-auto-dependency-updates` | **Date**: 2026-10-11 | **Spec**: [spec.md](./spec.md)

## Summary

Let the existing quality gate approve routine updates. These changes make it work:

- **Auto-merge workflow**: a new workflow arms GitHub's native auto-merge on Dependabot pull
  requests that are patch or minor. GitHub merges them only when the required `quality-gate` is
  green and the branch is up to date.
- **Daily pipeline run**: the full pipeline runs on `main` once a day. Merges made with the
  workflow token start no run of their own, so this run deploys them. It also re-checks the
  shipped dependencies against new advisories.
- **Daily catch-up**: a daily job brings approved updates that fell behind `main` up to date and
  re-runs the gate on them.
- **Dependabot configuration**: patch and minor updates are grouped, majors arrive separately,
  versions wait 3 days, and npm and Actions updates arrive on different weekdays.
- **Vulnerability gate**: `npm run audit` fails the gate on high or critical vulnerabilities in
  shipped dependencies. Details: [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 6.0 strict, run natively by Node 24 LTS (as `scripts/quality-report.ts`); GitHub Actions YAML
**Primary Dependencies**: none new; `dependabot/fetch-metadata` v3.1.0 (action, SHA-pinned); `gh` CLI on the runner
**Storage**: n/a
**Testing**: Vitest. Policy tests parse `.github/dependabot.yml`, the workflows and `package.json`. Unit tests cover the catch-up selection.
**Target Platform**: GitHub Actions (ubuntu-latest), GitHub Pages
**Project Type**: static site with CI/CD
**Performance Goals**: an automatically merged update is live within 24 h (SC-005); a new advisory is detected within 24 h (SC-004)
**Constraints**: no stored secrets (SC-006); strict branch protection unchanged (FR-003); least privilege per job (constitution VI)
**Scale/Scope**: about 2 grouped update PRs a week plus occasional majors and security updates

## Constitution Check

| Principle | Compliance | Status |
|-----------|-----------|--------|
| I. Right thing easy | routine updates need no human; local `npm run check` and CI run the same audit | Pass |
| II. Test-first | policy and selection tests are written and seen failing before the workflows and config change | Pass |
| III. Traceability | `011:` task and requirement references in every new or changed file | Pass |
| IV. Accessible | no UI change | Pass |
| V. Fast and light | no site change; the gate gains one quick step | Pass |
| VI. Private and secure | SHA-pinned actions; top-level `permissions: {}`; minimal per-job permissions; no secrets; no PR code runs with write access; dependencies kept current by automated PRs | Pass |
| VII. Bilingual | no user-facing strings | Pass |
| Workflow: "every push to main deploys" | merges made by auto-merge deploy with the next daily run instead (see Complexity Tracking) | Justified |
| Workflow: "merged after the owner has reviewed it" | applies to feature PRs; update PRs are approved by the gate under the owner's policy (clarification 2026-10-11) | Justified |

## Project Structure

### Documentation (this feature)

```text
specs/011-auto-dependency-updates/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md
├── contracts/dependency-automation.md
└── checklists/requirements.md
```

### Source Code (repository root)

```text
.github/dependabot.yml                     update-types groups, cooldown 3 days, Monday/Wednesday
.github/workflows/dependency-updates.yml   new: auto-merge (pull_request) and catch-up (schedule, dispatch)
.github/workflows/pipeline.yml             + daily schedule; deploy on main for any non-PR run; + audit step
scripts/dependency-catch-up.ts             new: behind(prs) selection, commands, gh runner
package.json                               + "audit"; "check" starts with it
README.md                                  dependency policy; roadmap 010 and 011; stack note
tests/unit/dependabot.test.ts              groups, cooldown, weekdays
tests/unit/workflow-policy.test.ts         schedule, deploy condition, audit step, no secrets
tests/unit/dependency-updates.test.ts      new: auto-merge and catch-up job policy
tests/unit/dependency-catch-up.test.ts     new: selection and commands
```

**Structure Decision**: the policy lives in configuration and one small script. Every rule is
asserted by a unit test, as for the existing workflow policy.

## Complexity Tracking

| Deviation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Automatically merged commits are not deployed by their own push; the daily run deploys them (≤ 24 h) | GitHub starts no workflow for merges made with the workflow token | A personal access token or app token would add a stored long-lived credential (SC-006) |
| A second daily schedule (catch-up) besides the pipeline's | Dependabot rebases only on conflict; strict protection blocks updates that are behind | Turning off strict protection would weaken every pull request; merge queue is unavailable for personal repositories |
