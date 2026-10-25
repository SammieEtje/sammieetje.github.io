# Quickstart: Immutable Evidence

## Precondition

`gh api repos/SammieEtje/sammieetje.github.io/immutable-releases` returns `"enabled": true`. It was
switched on on 2026-10-25.

## Before merge (local and on the pull request)

1. `npm run test:unit` passes. It covers:
   - `buildRecord` (push, schedule with several commits, a direct commit, a manual trigger);
   - normalisation and the local-path check;
   - `expired` at the two-year boundary;
   - the workflow policy (the `evidence` job and its permissions, the retention workflow).
2. `npm run check` passes.
3. On the pull request, `sign`, `deploy` and `evidence` are skipped, and `quality-gate` is green.

## After merge (live)

4. The `main` run ends with `evidence` succeeding. A pre-release `evidence/<date>-<run id>` exists
   on the merge commit and is not marked latest.
5. `gh release verify <tag> --repo SammieEtje/sammieetje.github.io` succeeds. Its
   `evidence.json`:
   - names #(this PR) with its author and merger;
   - lists every job and step as success or skipped;
   - lists file digests that match the assets.
6. The `report.json`, `sbom.cdx.json` and `manifest.sha256` assets are byte-identical (same
   SHA-256) to the live `/quality/…` files at that time.
7. Uploading a new asset to the release (`gh release upload <tag> x.txt`) is refused, and so is
   editing one. Moving the tag is refused as well.
8. The next daily run creates a second record. Its `previous` is the first record, and its
   `changes` lists the commits since then, Dependabot merges included.
9. The retention workflow, started by hand, removes nothing, and its summary says so.
