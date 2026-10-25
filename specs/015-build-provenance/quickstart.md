# Quickstart: Signed Build Provenance

## Before merge (local and on the pull request)

1. `npm run test:unit` passes. It covers the manifest write/check rules, the verification
   commands and the pipeline policy (the `sign` job, permissions, step order, deploy after sign).
2. Write a manifest and check it locally:
   - `npm run build && node scripts/manifest.ts write dist dist/quality/manifest.sha256 &&
     node scripts/manifest.ts check dist dist/quality/manifest.sha256` exits 0;
   - append a byte to `dist/index.html` and check again: it exits 1 with `index.html: changed`;
   - add a file: `<file>: not listed`.
3. `npm run check` passes. The link check skips only the four signed-at-deploy paths.
4. On the pull request, `sign` and `deploy` are skipped and `quality-gate` is green.

## After merge (live)

5. The `main` run shows `sign` succeeding before `deploy`. Its summary lists three attestations.
6. From a clean shell without a GitHub login (`env -u GH_TOKEN GH_CONFIG_DIR=$(mktemp -d)`), run
   the visitor commands from the scorecard against the live site. All three verifications print
   `verified`.
7. The single-page check: the SHA-256 of `curl -s https://sammieetje.github.io/career/` equals
   the `career/index.html` line of the live manifest.
8. Change one byte of the downloaded manifest and verify again. It fails.
9. The provenance names the commit in `/quality/report.json`. Check with
   `--source-digest <commit>`, or with `--format json` and the `gitCommit` field.
