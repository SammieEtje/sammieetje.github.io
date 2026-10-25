# Data Model: Immutable Evidence

## Evidence record (`evidence.json`, an asset of release `evidence/<YYYY-MM-DD>-<run id>`)

```jsonc
{
  "schemaVersion": 1,
  "tag": "evidence/2026-10-26-40190000000",
  "previous": "evidence/2026-10-25-40179805480",   // null for the first record
  "repository": "SammieEtje/sammieetje.github.io",
  "commit": "<40 hex>",
  "run": { "id": 40190000000, "attempt": 1, "url": "https://github.com/…/actions/runs/…",
           "trigger": "push" /* | "schedule" | "workflow_dispatch" */,
           "actor": "<login>", "startedAt": "<ISO 8601>" },
  "deployedAt": "<ISO 8601>",                      // when the deploy job completed
  "gate": [                                        // every job and step of the run except `evidence`
    { "job": "checks", "step": "Known vulnerabilities", "conclusion": "success",
      "command": "npm run audit" /* null when the step is not a gate check */ }
  ],
  "changes": [                                     // push: one entry; schedule/dispatch: one per commit since `previous`
    { "commit": "<40 hex>", "pullRequest": 23 /* or null for a direct commit */,
      "author": "<login>", "mergedBy": "<login>", "prGate": "success" /* quality-gate on the PR head */ }
  ],
  "files": [                                       // every other asset of the release
    { "name": "report.json", "sha256": "<hex>", "source": "published" },
    { "name": "unit.json", "sha256": "<hex>", "source": "normalised", "originalSha256": "<hex>" }
  ]
}
```

**Rules**:

- `gate` covers the whole population of jobs. A record exists only when `deploy` succeeded, so
  every listed conclusion is `success` or `skipped`.
- `changes` is never empty. A `push` run has exactly one entry, for its own commit.
- `files` lists exactly the release's other assets, apart from `evidence.json` and
  `evidence.sigstore.json`.
- No asset may contain `/Users/`, `/home/` or `C:\`.

## Release

| Field | Value |
|---|---|
| tag | `evidence/<YYYY-MM-DD>-<run id>` (UTC date of the deploy), on `commit` |
| prerelease | `true` |
| latest | `false` |
| title | `Evidence <YYYY-MM-DD> <short sha>` |
| notes | a short summary: trigger, changes (pull request links), gate result, and a link to the run |
| assets | `evidence.json`, `report.json`, `sbom.cdx.json`, `manifest.sha256`, the three `*.sigstore.json` from 015, `unit.json`, `e2e.json`, `evidence.sigstore.json` |

## Retention

`expired(releases, now)` returns the `evidence/` releases whose `publishedAt` lies more than two
calendar years before `now`, sorted oldest first. Exactly two years is not yet expired.
