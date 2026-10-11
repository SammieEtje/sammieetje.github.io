# Quickstart: Automatic Dependency Updates

## Before merge (local)

1. `npm run test:unit`: the policy tests for Dependabot, the workflows and the catch-up selection
   pass.
2. `npm run audit`: exits 0; the shipped dependencies have no high or critical findings.
3. Negative check (not committed):
   - Run `npm install --save lodash@4.17.20 && npm run audit`. It must exit non-zero, because
     lodash 4.17.20 has published high advisories.
   - Then `git checkout package.json package-lock.json && npm ci`.
4. `npm run check`: the full gate passes, starting with the audit.
5. The pipeline on the pull request is green, including the audit step in `checks`.

## After merge (live)

6. **Security alerts**: Dependabot's open security PRs (if any) and the next weekly groups show the
   `auto-merge` job.
   - Patch or minor: auto-merge armed, merged after `quality-gate`.
   - Major: no auto-merge.
7. **Catch-up**: when an armed update is `BEHIND`, run the `Dependency updates` workflow manually
   (or wait for 03:17 UTC).
   - The branch is updated.
   - A `Pipeline` run appears on the Dependabot branch.
   - Its `quality-gate` satisfies the required check, and the pull request merges.
   - If it does not merge, record that the dispatched check is not accepted and fall back to the
     "Update branch" button.
8. **Daily run**: the next scheduled `Pipeline` run on `main` deploys. The live
   `/quality/report.json` shows the new build reference and run time.
9. **Workflow-file updates (R3a)**: the first Actions group (Wednesday) merges automatically. If
   GitHub refuses the merge for lack of the `workflows` permission, record it, switch Actions
   updates to manual in the README, and keep npm automatic.
10. **Settings**: `gh api repos/SammieEtje/sammieetje.github.io --jq .security_and_analysis` shows
   secret scanning, push protection and Dependabot security updates `enabled`.
