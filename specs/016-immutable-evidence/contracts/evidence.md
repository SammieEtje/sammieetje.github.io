# Contract: Immutable Evidence

## Pipeline (`.github/workflows/pipeline.yml`)

```text
… ─► quality-gate ─► sign ─► deploy ─► evidence
```

**`evidence`** (new):

- `needs: deploy`, with the same `if` as `deploy`;
- `permissions: { contents: write, actions: read, checks: read, pull-requests: read, id-token: write, attestations: write }`.

Its steps, in order:

1. `Check out` (`persist-credentials: false`) and `Set up Node`;
2. `Get the published site` (artifact `github-pages`), then `Take the published evidence files`:
   extract `quality/` from `artifact.tar` into `evidence/`;
3. `Get the test results` (artifact `test-reports` into `reports/`);
4. `Write the record`: `node scripts/evidence.ts record evidence`, with `GH_TOKEN` set to the
   workflow token. It writes `evidence/evidence.json` and the normalised `unit.json` and
   `e2e.json`, and checks every asset for local paths;
5. `Sign the record`: `actions/attest` (same pin as 015) with `subject-path: evidence/*`;
6. `Publish the record`: `node scripts/evidence.ts publish evidence` copies the bundle to
   `evidence/evidence.sigstore.json`, then runs `gh release create <tag> <every file>
   --prerelease --latest=false --target <sha> --title … --notes-file …`;
7. `Verify the release`: `node scripts/evidence.ts verify evidence` runs `gh release verify <tag>`, plus
   `gh attestation verify evidence/evidence.json --bundle evidence/evidence.sigstore.json` with
   the 015 signer arguments.

## Retention (`.github/workflows/evidence-retention.yml`)

- **Triggers**: `schedule: '41 5 * * 0'` and `workflow_dispatch`.
- **Permissions**: `permissions: {}` at the top; job `clean-up` has `{ contents: write }`.
- **Steps**:
  - `node scripts/evidence.ts expired` prints the expired tags;
  - then `gh release delete <tag> --yes --cleanup-tag` runs for each;
  - the summary lists each deletion with its tag, deploy date and commit.

## Script (`scripts/evidence.ts`)

- `buildRecord(inputs)`: a pure function. It takes the run, jobs, change data and file digests,
  and returns the `evidence.json` from [data-model.md](../data-model.md).
- `normaliseReport(text, workdir)`: replaces the work directory with `.`.
- `findLocalPaths(files)`: the 014 pattern.
- `expired(releases, now)`: [data-model.md](../data-model.md#retention).
- CLI `record <dir>` and `expired`: thin wrappers that call `gh api`.

## Scorecard (`/scorecard/`, `/nl/scorecard/`)

A static section `data-spec="016:FR-009"`:

- a heading;
- an explanation that every deploy leaves a signed, unchangeable record, kept for two years;
- a link to the repository's releases filtered on `evidence/`;
- the verification command for a record.

No client-side script.
