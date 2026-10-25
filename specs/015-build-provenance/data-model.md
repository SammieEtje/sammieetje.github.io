# Data Model: Signed Build Provenance

## Manifest (`dist/quality/manifest.sha256`, published at `/quality/manifest.sha256`)

Plain text in `sha256sum` format, UTF-8, `\n` line endings, with a trailing newline:

```text
<64 lowercase hex>  <path relative to the site root, forward slashes>
```

- One line per published file, sorted by path (byte order).
- Two spaces between the digest and the path, as `sha256sum` writes it.
- It covers every file in the Pages artifact except `quality/manifest.sha256` and the three
  `quality/*.sigstore.json` bundles.
- Paths never start with `/`, never contain `..`, and never contain a newline.

## Statements and bundles (per deploy)

| Statement | Subject | Predicate type | Bundle (published at) |
|---|---|---|---|
| Provenance of the manifest | `manifest.sha256` (sha256 of the file) | `https://slsa.dev/provenance/v1` | `/quality/manifest.sha256.sigstore.json` |
| Provenance of the SBOM | `sbom.cdx.json` (sha256 of the file) | `https://slsa.dev/provenance/v1` | `/quality/sbom.cdx.json.sigstore.json` |
| SBOM attestation | `manifest.sha256` | `https://cyclonedx.org/bom` (predicate = the SBOM) | `/quality/manifest.sha256.sbom.sigstore.json` |

Each bundle is a Sigstore bundle v0.3 (`application/vnd.dev.sigstore.bundle.v0.3+json`) with a
DSSE envelope, a Fulcio certificate whose identity is
`https://github.com/SammieEtje/sammieetje.github.io/.github/workflows/pipeline.yml@refs/heads/main`,
and a Rekor inclusion proof. The SLSA predicate names the repository, the commit
(`resolvedDependencies[].digest.gitCommit`), the workflow, the run and the runner type.

## Manifest check result (`scripts/manifest.ts check`)

| Field | Meaning |
|---|---|
| `problems[]` | one line per problem, `<path>: <reason>`. The reasons are `changed`, `missing` (listed but not on disk), `not listed` (on disk but not in the manifest) and `invalid line <n>` |
| `passed` | `problems.length === 0` |

## Verification command (`src/site/provenance.ts`)

`{ file: string; bundle: string; predicateType: string }` → the `gh attestation verify` argument
list from research R4. The pipeline and the documentation use the same function.
