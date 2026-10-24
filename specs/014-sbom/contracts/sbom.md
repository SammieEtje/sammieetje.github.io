# Contract: Software Bill of Materials

## Command

`npm run sbom` → `node scripts/sbom.ts`

1. Runs `npm sbom --sbom-format cyclonedx` on the installed tree.
2. Marks the scope of every component, adds the pinned actions, and stamps the build (see
   [data-model.md](../data-model.md)).
3. Writes `public/quality/sbom.cdx.json` (git-ignored), pretty-printed, with a trailing newline.
4. Validates and checks the result. It prints a summary and appends it to `$GITHUB_STEP_SUMMARY`
   when that is set:

   ```text
   ### Bill of materials
   | | Count |
   |---|---|
   | Shipped components | 198 |
   | Pipeline components | 523 |
   | of which pipeline actions | 7 |
   | Without a declared licence | 8 |

   ✅ Bill of materials complete and valid (CycloneDX 1.5).
   ```

   The counts in this example are illustrative. On failure, the last line is
   `❌ Bill of materials incomplete or invalid.`, followed by one line per problem.

5. Exit status: `0` when the check passes and `1` otherwise. When generation fails, it exits `1`
   with npm's error and writes no file.

## Pipeline (`.github/workflows/pipeline.yml`, job `checks`)

- Step `Bill of materials` (`id: sbom`, `run: npm run sbom`), after `Traceability` and before
  `Build`.
- The summary table gains the row `| Bill of materials | $SBOM | \`npm run sbom\` |`.
- Step `Keep the bill of materials` uploads `public/quality/sbom.cdx.json` as artifact `sbom`
  (7-day retention).
- The SBOM reaches Pages inside the existing `dist` artifact. No other job changes.

## Local gate (`package.json`)

- `"sbom": "node scripts/sbom.ts"`.
- `check` runs `npm run sbom` after `npm run trace` and before `npm run build`.
- `dev` runs `npm run sbom && astro dev`.

## Published file

- `GET /quality/sbom.cdx.json` → the SBOM of the deployed build.
- Its `metadata.properties["sammieetje:build:commit"]` equals the `commit` field of
  `GET /quality/report.json`.

## Scorecard page (`/scorecard/`, `/nl/scorecard/`)

- A static section `data-spec="014:FR-011"` with a heading and one or two sentences in the page's
  language.
- Two figures (shipped components, pipeline components) that equal the counts in the published
  file.
- A link to `/quality/sbom.cdx.json`.
- No client-side script. Everything is visible with JavaScript disabled.
