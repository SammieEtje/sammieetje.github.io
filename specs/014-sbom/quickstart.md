# Quickstart: Software Bill of Materials

## Before merge (local)

1. Run `npm run sbom`. It exits 0, writes `public/quality/sbom.cdx.json` and prints the counts.
2. Query the file for a component:

   ```sh
   node -e 'const b=require("./public/quality/sbom.cdx.json");console.log(b.components.filter(c=>c.name==="astro").map(c=>`${c.name} ${c.version} ${c.scope}`))'
   ```

   It prints `astro <installed version> required`. Querying `vitest` shows `excluded`, and querying
   `actions/checkout` shows the pinned tag.
3. Negative checks (not committed):
   - Delete one component from the written file and run the check only. It fails and names the
     component. The test suite covers this with fixtures.
   - Remove the `# vX` comment from one `uses:` line. `npm run sbom` fails with
     `action not pinned with a tag`. Restore the line.
4. Run `npm run test:unit`. The SBOM, workflow-policy and README tests pass.
5. Run `npm run check`. The full gate passes. The built `dist/quality/sbom.cdx.json` exists, and
   the scorecard shows both counts.
6. Open the scorecard in a browser with JavaScript disabled. The section, the counts and the link
   are visible in English and Dutch.
7. The pull request pipeline is green. The `checks` summary shows `Bill of materials | success`,
   and the run has an `sbom` artifact.

## After merge (live)

8. `https://sammieetje.github.io/quality/sbom.cdx.json` returns the SBOM. Its build commit equals
   the `commit` in `https://sammieetje.github.io/quality/report.json`.
9. The live scorecard counts equal the counts in the live file.
10. Optional: validate the live file with an independent CycloneDX tool, for example
    `cyclonedx validate`. It reports a valid 1.5 document.
