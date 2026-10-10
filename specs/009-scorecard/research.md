# Research: Scorecard

## R1. Why the pipeline got slow

Run #38064692066 (PR #9): budgets 483 s of a ~10 min gate; everything else ~1.5 min. Lighthouse
runs 15 pages × 3 runs sequentially (~32 s per page). Each new page adds ~30 s.

## R2. Sharding Lighthouse CI

- `lhci collect` with `staticDistDir` does not rewrite explicit URLs to its random local port, so
  explicit URL lists cannot be used. Its autodiscovery blocklist is normalised to the server port,
  so a shard is expressed as "block every page that is not mine".
- `lighthouserc.cjs` reuses LHCI's own discovery (`FallbackServer.readHtmlFilesInDirectory`, same
  depth) so shard lists match exactly, sorts the files and assigns them round-robin by index
  (`LHCI_SHARD=i/n`). Without `LHCI_SHARD` (local) nothing is blocked: all pages, one process
  (FR-005). A unit test proves every page lands in exactly one shard.
- Three shards: ~5 pages × 32 s ≈ 2.7 min each, in parallel.

## R3. Pipeline shape

```text
checks ──► budgets (matrix: 1/3, 2/3, 3/3) ──► report ──► quality-gate (aggregate) ──► deploy
   └───────────────────────────────────────────┘
```

- `checks`: format, lint, types, unit, trace, build, e2e, links; uploads `dist` and test reports.
- `budgets`: downloads `dist`, runs `npm run budgets` with its shard; uploads its Lighthouse reports.
- `report`: merges shard manifests and test counts into `quality-report.json` (schema v2), reads
  the run start from the GitHub API (`actions: read`), and on `main` packages `dist` plus
  `quality/report.json` as the Pages artifact.
- `quality-gate`: `if: always()`, needs all of the above, fails unless every result is `success`.
  Keeps the branch-protection context name unchanged (001 FR-015).
- `deploy`: needs `quality-gate`, `main` only, as before.
- Policy test (001 FR-017/FR-020) is generalised: the `npm run …` steps across `checks` then
  `budgets` must equal `npm run check`, in order.

## R4. Test counts and timing

- Vitest writes `reports/unit.json`, Playwright writes `reports/e2e.json` (JSON reporters added in
  their configs, so local and CI behave the same; `reports/` is ignored by git). Playwright's own
  `test-results/` is not used because it is cleaned on every run.
- Duration = report time − `run_started_at`; the scorecard compares it with the 10-minute target
  (deploy adds about a minute, stated on the page).

## R5. Scorecard rendering

- Static (build time, no JS): heading, explanation, link to `/quality/report.json`, and "specs
  shipped" (count of `specs/NNN-*` folders whose `tasks.md` has no open task), linking to `specs/`.
- Enhanced (inline module, ~2 KB): fetches `/quality/report.json`; renders verdict, commit link,
  measurement time, tiles (unit, e2e, duration) and the per-page table with "within budget" /
  "over budget" text. A 404 shows "no measurement available yet". Labels come from data
  attributes rendered per locale, so the bundle stays small.
- The link checker skips `/quality/report.json` (absent until the report job adds it).
