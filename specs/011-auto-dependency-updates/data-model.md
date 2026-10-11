# Data Model: Automatic Dependency Updates

## Update proposal (a Dependabot pull request)

These are the fields read by the catch-up script (`gh pr list --json`) and the auto-merge job
(`fetch-metadata` outputs).

| Field | Source | Values / rule |
|-------|--------|---------------|
| `number` | gh | pull request number |
| `author.login` | gh | must be `app/dependabot` / `dependabot[bot]` for any automation |
| `headRefName` | gh | branch, e.g. `dependabot/npm_and_yarn/npm-…`; the catch-up dispatches the pipeline on it |
| `autoMergeRequest` | gh | `null` = not approved for automatic merging; an object = armed ("armed" and "approved for automatic merging" mean the same) |
| `mergeStateStatus` | gh | `BEHIND` = needs catch-up; `CLEAN`, `BLOCKED`, `DIRTY`, `UNSTABLE`, `UNKNOWN`, … = leave alone |
| `update-type` | fetch-metadata | `version-update:semver-patch` / `-minor` → arm auto-merge; `-major`, empty or anything else → manual |

## State transitions

```text
opened by Dependabot ──(patch|minor)──► auto-merge armed ──(gate green, up to date)──► merged ──(next daily run green)──► live
        │                                     │
        └──(major|unknown)──► waits for owner └──(behind main)──► catch-up: update branch + dispatch gate ──► (gate green) ──► merged
                                              └──(gate red)──► stays open for owner
```

## Merge policy

- Patch or minor merges automatically (version and security updates alike).
- Everything else waits for the owner.

## Vulnerability check

- Scope: production dependencies of `package.json`, transitive dependencies included.
- Fails on: severity `high` or `critical`.
- Runs: on every pull request and push, on the daily run on `main`, and locally in `npm run check`.
