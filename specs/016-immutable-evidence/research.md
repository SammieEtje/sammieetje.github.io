# Research: Immutable Evidence

All findings were checked on 2026-10-25 (gh 2.102.0).

## R1. Immutable releases

- **Behaviour**: once a release is published, its assets cannot be changed, replaced or deleted,
  and its tag cannot be moved or deleted while the release exists. A deleted release's tag name
  can never be reused. GitHub creates a **release attestation** (tag, commit, asset digests)
  automatically, and `gh release verify <tag>` and `gh release verify-asset` check it. (GitHub
  Docs, "Immutable releases".)
- **Setting**: immutable releases are switched on for this repository (`PUT
  /repos/{owner}/{repo}/immutable-releases`, 2026-10-25, with the owner's consent). They are
  `enabled: true`, not enforced by an organisation.
- **Publishing**: `gh release create` (2.102) already creates the release as a draft, uploads the
  assets and then publishes. That is the only order that works with immutability.
- **Deletion**: an immutable release can still be deleted. That is what the two-year clean-up
  uses (R6). A deletion outside the clean-up shows as a gap (R5).

## R2. Where the record is made: a job after deploy

- **Decision**: a new job, `evidence`:
  - It `needs: deploy` and has the same main-only condition, so a record exists only for a build
    that went live (FR-001).
  - Its permissions are `contents: write` (create the release), `actions: read` (run jobs and
    artifacts), `checks: read` and `pull-requests: read` (change details), and `id-token: write` +
    `attestations: write` (sign the record).
  - It never checks out with persisted credentials and runs no code from a pull request.
  - `contents: write` is the narrowest permission that can create a release. It exists in this
    job only (FR-006).
- **Alternative**: making the record inside `sign`. Rejected, because the record must only exist
  for builds that actually went live, and `sign` comes before `deploy`.

## R3. What goes in the record (FR-002, FR-003)

A release `evidence/<YYYY-MM-DD>-<run id>` with these assets:

| Asset | Source | Byte-identical to |
|---|---|---|
| `evidence.json` | built by `scripts/evidence.ts` | — (the record itself) |
| `report.json`, `sbom.cdx.json`, `manifest.sha256`, three `*.sigstore.json` | extracted from this run's `github-pages` artifact (`artifact.tar`, `quality/`) | the published `/quality/…` files |
| `unit.json`, `e2e.json` | this run's `test-reports` artifact | the files the quality report counted |
| `evidence.sigstore.json` | `actions/attest` over all the assets above | — |

Taking the published files from the Pages artifact itself, instead of rebuilding them, is what
makes them byte-identical to what went live.

## R4. Gate outcomes and change details

- **Gate outcomes**: `GET /repos/{repo}/actions/runs/{run_id}/jobs` lists every job and step of the
  run with its conclusion. The authoritative source is the platform, not a summary the pipeline
  writes about itself. The record lists every job and its steps except the `evidence` job
  itself. Each named check (Known vulnerabilities, Formatting, …, Bill of materials, Build, …)
  carries its local command, from the same table the `checks` summary uses.
- **Change details**:
  - On `push`: `GET /repos/{repo}/commits/{sha}/pulls` gives the merged pull request, then
    `GET /pulls/{n}` gives its `user` (author) and `merged_by`. The pull request's last
    `quality-gate` check run comes from `GET /commits/{head_sha}/check-runs?check_name=quality-gate`.
  - On `schedule` or `workflow_dispatch`: `GET /compare/{previous}...{sha}`, where `previous` is
    the commit in the latest `evidence/…` release. That lists the commits since then, each with
    its pull request in the same way. A Dependabot merge therefore shows with its pull request
    even though it started no run of its own.
  - **Trigger and actor**: `github.event_name`, `github.triggering_actor`, `github.run_id`,
    `github.run_attempt`.
- **Pure core**: `buildRecord(inputs)` in `scripts/evidence.ts` takes plain data and returns
  `evidence.json`. A thin CLI does the API calls with `gh api`. Unit tests use fixtures.

## R5. Signing and detecting gaps

- **Signature**: `actions/attest` with `subject-path` set to all record assets. It produces SLSA
  provenance over every file, signed through Sigstore and logged in Rekor (FR-004). The bundle is
  published as `evidence.sigstore.json` in the same release. GitHub's own release attestation is
  a second, independent signature over the published assets.
- **Gap detection**:
  - Every record names its predecessor's tag (`previous`), so records form a chain.
  - A deleted record breaks the chain where a later record points to a tag that no longer
    exists.
  - It also leaves a Rekor entry and a GitHub attestation without a release.
  - The quickstart shows the check.

## R6. Two-year retention (FR-007)

- **Decision**: a new workflow, `.github/workflows/evidence-retention.yml`:
  - It runs weekly (Sunday 05:41 UTC) and by manual dispatch.
  - One job with `contents: write` lists releases with tag prefix `evidence/`. It deletes those
    whose `published_at` is more than two calendar years before the run, with
    `gh release delete <tag> --yes --cleanup-tag`.
  - It writes each deletion (tag, deploy date, commit) to the run summary.
- **Pure core**: `expired(releases, now)` in `scripts/evidence.ts`, unit-tested at the boundary:
  exactly two years is not yet expired; a day more is.
- **Alternative**: deleting inside the pipeline. Rejected, because it would give every main run
  delete rights and mix two responsibilities.

## R7. Privacy

The record's assets are checked with the same local-path pattern as the SBOM (014: `/Users/`,
`/home/`, `C:\`). The test reports from Playwright and Vitest contain absolute paths of the runner
(`/home/runner/work/...`).

**Decision**: `scripts/evidence.ts` writes `unit.json` and `e2e.json` with the runner's work
directory replaced by `.`. The check then runs on every asset, and any remaining match fails the
step before anything is published (FR-008). These two files are therefore normalised copies, not
byte copies. The record says so, and stores the SHA-256 of the originals as well.
