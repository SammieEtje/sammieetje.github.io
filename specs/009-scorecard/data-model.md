# Data Model: Scorecard

## QualityReport v2 (`/quality/report.json`)

```json
{
  "schemaVersion": 2,
  "commit": "<sha>",
  "runStartedAt": "<ISO-8601> | null",
  "generatedAt": "<ISO-8601>",
  "durationSeconds": 412,
  "pages": [{ "url": "/", "scores": { "performance": 1, "accessibility": 1, "best-practices": 1, "seo": 1 }, "scriptBytes": 0 }],
  "budgets": { "performance": 0.9, "accessibility": 0.95, "best-practices": 0.95, "seo": 0.95, "scriptBytes": 51200 },
  "tests": { "unit": 112, "e2e": 270 },
  "passed": true
}
```

- `durationSeconds` is `null` when `runStartedAt` is unknown (local runs).
- `tests` values are `null` when a reporter file is missing.

## Shard

`LHCI_SHARD="i/n"` → pages with sorted index `k` where `k % n === i − 1`.

## Shipped spec

A `specs/NNN-name/` folder whose `tasks.md` contains no `- [ ]`.
