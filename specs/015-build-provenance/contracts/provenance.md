# Contract: Signed Build Provenance

## Scripts

- `node scripts/manifest.ts write <dir> <out>`: writes the manifest of `<dir>` to `<out>`
  ([data-model.md](../data-model.md)). The manifest itself and `quality/*.sigstore.json` are
  excluded. Exit status 0.
- `node scripts/manifest.ts check <dir> <manifest>`: re-hashes `<dir>` and prints one line per
  problem. Exit status 0 when there are none, 1 otherwise.
- `node scripts/provenance.ts verify <dir>`: runs the three `gh attestation verify` commands from
  `src/site/provenance.ts` against `<dir>/quality/…`. It prints one result line per statement and
  exits 1 on the first failure, naming the statement.

## Pipeline (`.github/workflows/pipeline.yml`)

```text
checks ─► budgets ─► report ─► quality-gate ─► sign ─► deploy
```

- **`report`** (on `main`, not pull requests): `Add the report to the site`, then
  `Keep the site` uploads `dist/` as artifact `site`. It no longer packages for Pages.
- **`sign`** (new):
  - `needs: quality-gate`;
  - `if: github.event_name != 'pull_request' && github.ref == 'refs/heads/main'`;
  - `permissions: { contents: read, id-token: write, attestations: write }`.

  Its steps, in order:

  1. `Check out` and `Set up Node` (for the scripts and `gh`);
  2. `Get the site` (artifact `site` into `dist/`);
  3. `Write the manifest`: `node scripts/manifest.ts write dist dist/quality/manifest.sha256`;
  4. `Sign the manifest`: `actions/attest` with `subject-path: dist/quality/manifest.sha256`;
  5. `Sign the bill of materials`: `actions/attest` with `subject-path: dist/quality/sbom.cdx.json`;
  6. `Attest the bill of materials`: `actions/attest` with
     `subject-path: dist/quality/manifest.sha256` and `sbom-path: dist/quality/sbom.cdx.json`;
  7. `Publish the signatures`: copies each step's `bundle-path` to its published path;
  8. `Verify the provenance`: `node scripts/provenance.ts verify dist`;
  9. `Check the files against the manifest`: `node scripts/manifest.ts check dist
     dist/quality/manifest.sha256`;
  10. `Package site for Pages`: `actions/upload-pages-artifact` with `path: dist`.
- **`deploy`**: `needs: sign`. Everything else is unchanged.

## Links check (`package.json`)

`links` also skips `/quality/manifest\.sha256` and `/quality/[^/]+\.sigstore\.json`.

## Scorecard page (`/scorecard/`, `/nl/scorecard/`)

- A static section `data-spec="015:FR-010"`:
  - a heading;
  - an explanation in the page's language;
  - links to `/quality/manifest.sha256` and the three bundles;
  - a `<pre><code>` block with the verification commands from `src/site/provenance.ts`, written
    for a visitor (`curl` to download, then `gh attestation verify … --bundle …`), and the
    single-page check.
- No client-side script.

## Visitor commands (generated, shown verbatim)

```sh
base=https://sammieetje.github.io/quality
curl -sO $base/manifest.sha256 -sO $base/manifest.sha256.sigstore.json \
     -sO $base/sbom.cdx.json -sO $base/sbom.cdx.json.sigstore.json \
     -sO $base/manifest.sha256.sbom.sigstore.json
gh attestation verify manifest.sha256 --bundle manifest.sha256.sigstore.json \
  --repo SammieEtje/sammieetje.github.io \
  --signer-workflow SammieEtje/sammieetje.github.io/.github/workflows/pipeline.yml \
  --source-ref refs/heads/main --deny-self-hosted-runners && echo verified
# … the same for sbom.cdx.json, and for the SBOM attestation with
#   --predicate-type https://cyclonedx.org/bom
curl -s https://sammieetje.github.io/career/ | shasum -a 256
grep ' career/index.html$' manifest.sha256
```
