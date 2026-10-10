# Research: Measure Inline Scripts

## R1. Why the number is wrong

`scripts/quality-report.ts` takes JavaScript per page from Lighthouse's `resource-summary` audit
(`resourceType: script`, `transferSize`), which only covers network requests. Astro inlines small
bundled scripts into the HTML (`<script type="module">…</script>`), so the playground (~1.2 KB
gzip) and the scorecard (~1.4 KB gzip) report 0. The budget for embedded script is enforced by a
separate end-to-end test (008) that gzips `script` contents in the browser — a second definition.

## R2. One measurement

- **Decision**: a pure function `scriptBytes(html)` in `src/site/script-size.ts` returns the gzip
  size of all executable embedded script in a page: `<script>` elements without `src` whose `type`
  is absent, `module`, `text/javascript` or `application/javascript`; data blocks (`application/json`,
  `application/ld+json`, …) are ignored; each script's text is gzipped separately and summed
  (mirrors how each would be counted if it were a file).
- The report reads each measured page's built HTML from `dist/` (URL → file: `/x/` →
  `dist/x/index.html`, `/404.html` → `dist/404.html`) and publishes
  `scriptBytes = external + inline` with the breakdown `scripts: { external, inline }`.
- **Gate**: the report is now the JavaScript gate — `node scripts/quality-report.ts` exits non-zero
  when any page's total exceeds 50 KB (in each shard and in the merge). Lighthouse CI keeps
  asserting the four category scores; its `resource-summary:script:size` assertion is removed so
  no second definition remains (FR-003, FR-006, SC-002).
- **Agreement check (SC-001)**: an end-to-end test (runs after the build) compares
  `scriptBytes(dist HTML)` with a browser-side gzip of the same page's executable scripts, within
  0.1 KB, for the playground and the scorecard; the old budget-only test is replaced by it.

## R3. Pipeline impact

- The `report` job needs the built site for every run, not only on `main`: it now always downloads
  `dist`. Shards already have it.
- Report schema stays 2; `pages[].scripts` is an added field. The scorecard reads `scriptBytes`
  only, so an older live report still renders until replaced.

## R4. Alternatives

- Lighthouse `script-treemap-data`: includes inline scripts but reports uncompressed resource bytes
  per script and changes shape between versions; not the constitution's "compressed" measure.
- Stop inlining (force separate files): Lighthouse would count them, but it adds a request per page
  for ~1 KB and only hides the measurement problem.
