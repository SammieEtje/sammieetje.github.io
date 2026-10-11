# Contract: Dependency Automation

## `.github/dependabot.yml`

| Ecosystem | Schedule | Cooldown | Group (`patterns: ['*']`) | Other |
|-----------|----------|----------|---------------------------|-------|
| `npm` | weekly, `monday` | `default-days: 3` | `npm`, `update-types: [minor, patch]` | `ignore` unchanged (typescript ≥ 6.1.0; @types/node majors) |
| `github-actions` | weekly, `wednesday` | `default-days: 3` | `actions`, `update-types: [minor, patch]` | — |

Majors fall outside the groups and arrive as individual pull requests.

## `.github/workflows/dependency-updates.yml`

| | |
|---|---|
| Triggers | `pull_request` (branches `[main]`), `schedule` (one daily cron), `workflow_dispatch` |
| Top-level permissions | `{}` |

**Job `auto-merge`**

- **Condition**: event `pull_request` and author `dependabot[bot]` and repository
  `SammieEtje/sammieetje.github.io`.
- **Permissions**: exactly `{ contents: write, pull-requests: write }`.
- **Steps**:
  1. `dependabot/fetch-metadata@<sha>`.
  2. Only if the update type is `version-update:semver-patch` or `version-update:semver-minor`:
     `gh pr merge --auto --squash "$PR_URL"`.
- **Constraints**: no checkout and no `--admin`.

**Job `catch-up`**

- **Condition**: event is not `pull_request`.
- **Permissions**: exactly `{ contents: write, pull-requests: write, actions: write }`.
- **Steps**:
  1. Checkout of the default branch, with `persist-credentials: false`.
  2. Node from `.nvmrc`.
  3. `node scripts/dependency-catch-up.ts`, with `GH_TOKEN` set to the workflow token.
- **Constraint**: no `npm ci`, because the script uses Node built-ins only.

## `scripts/dependency-catch-up.ts`

```ts
interface UpdatePr {
  number: number;
  headRefName: string;
  mergeStateStatus: string;
  autoMergeRequest: unknown;
  author: { login: string };
}
export function behind(prs: UpdatePr[]): UpdatePr[];                  // Dependabot-authored, armed, BEHIND
export function catchUpCommands(prs: UpdatePr[], repo: string): string[][]; // gh argv per action
```

- For each selected pull request, the commands are, in order:
  - `['pr', 'update-branch', '<n>', '--repo', repo]`
  - `['workflow', 'run', 'pipeline.yml', '--ref', '<headRefName>', '--repo', repo]`
- When run as the main module, the script reads the open Dependabot pull requests with
  `gh pr list` and executes the commands in order.
  - It logs each action.
  - It exits non-zero when a command fails.

## `.github/workflows/pipeline.yml` changes

- **Triggers**: `on.schedule` gets one daily cron. The existing triggers stay.
- **Deploy and packaging**: `deploy`, and the report job's "Add the report to the site" and
  "Package site for Pages" steps, run when the event is not `pull_request` and the ref is
  `refs/heads/main`.
- **Audit step**: `checks` runs `npm run audit` as its first check (step id `audit`, listed in the
  summary).

## `package.json`

- `"audit": "npm audit --omit=dev --audit-level=high"`
- `"check"` starts with `npm run audit &&`.
