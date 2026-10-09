# Research: Catalog Overview

Versions checked against the npm registry on 2026-10-09.

## R1. Responsive photo

- **Decision**: commit one cropped, metadata-free source (`src/assets/profile.jpg`, 490 × 490)
  and render it with Astro's built-in `<Picture>` (`astro:assets`, sharp at build time):
  formats AVIF and WebP with a JPEG fallback, widths 96, 128, 192 and 256, `sizes` matching the
  displayed size (96 px narrow, 128 px wide), explicit `width`/`height`, `loading="eager"`,
  `decoding="async"`.
- **Rationale**: no new dependency (Astro already ships sharp); generated variants are hashed
  and immutable; explicit dimensions reserve the space (FR-002, SC-002).
- **Alternatives**: pre-generated images committed by hand (drift, manual work); a CDN image
  service (third-party request, forbidden).

## R2. Metadata stripping

- **Decision**: the committed source is written by sharp without metadata; sharp's default
  output (used by Astro and by the sharing-image renderer) drops EXIF/XMP/IPTC. A unit test reads
  every image in `src/assets/` and every raster image in `dist/` with sharp and asserts no EXIF,
  XMP or IPTC block (FR-003, SC-006).
- **Alternatives**: exiftool in CI (extra system dependency).

## R3. Sharing image (Open Graph)

- **Decision**: a static Astro endpoint `src/pages/og/[locale].png.ts` renders one 1200 × 630 PNG
  per locale at build time: layout described as a Satori element tree (photo, name, headline,
  site URL, accent bar), fonts from `@fontsource/inter` WOFF files (400, 700), rasterised with
  `@resvg/resvg-js`. Output: `/og/en.png`, `/og/nl.png`.
- **Rationale**: built from the same photo and dictionary as the page, so it can never go stale
  (FR-011); no browser needed at build time; deterministic.
- **Alternatives**: committed PNGs plus a staleness check (manual regeneration step); Playwright
  screenshots during the build (heavy, couples build to a browser); sharp + SVG text (depends on
  system fonts, which differ between macOS and the CI runner).
- **Versions**: satori 0.47.1, @resvg/resvg-js 2.6.2, @fontsource/inter 5.3.0 — all build-time
  only (devDependencies); nothing reaches the browser.

## R4. Sharing metadata

- **Decision**: `buildPageMeta` adds `image` `{ url, width, height, alt }` for the page locale
  and emits `og:image`, `og:image:width`, `og:image:height`, `og:image:alt`,
  `twitter:card=summary_large_image`, `twitter:image`. The default image for every page is
  `/og/<locale>.png`.

## R5. Number formatting

- **Decision**: key numbers are typed data (`src/site/key-numbers.ts`) with a numeric value,
  an optional `×` suffix, and per-locale label and context. Values are formatted with
  `Intl.NumberFormat` for `en-GB` / `nl-NL` (`10,000` / `10.000`, `2.5×` / `2,5×`). Numbers that
  appear inside label text are written per language.
- **Alternatives**: hard-coded strings per language (formatting errors go untested).

## R6. Layout

- **Decision**: a CSS grid of portal cards on the home page. Wide (≥ 64rem): the identity card
  spans two columns with the key-numbers card beside it (three stacked tiles), then About (two
  columns) and Links. Narrow: one column in the order identity, key numbers, About, Links. The
  photo sits beside the name inside the identity card to keep the card short (SC-001).
- A shared `PortalCard.astro` component renders a card with an `h2` title and an optional mono
  "kind" label.

## R7. Layout-shift and weight checks

- **Decision**: an e2e test collects `layout-shift` entries with a buffered
  `PerformanceObserver` after load and asserts the sum is 0; it also loads the page at device
  scale factor 2 and asserts the photo responses add up to at most 60 KB (SC-002, SC-003).
  Lighthouse budgets from 001 keep running on every page.

## R8. Dependabot follow-up (001:FR-021)

- **Decision**: ignore `typescript` versions `>=6.1.0` and semver-major updates of `@types/node`
  in `.github/dependabot.yml`, with a comment naming the blocker; the unit test asserts the rule.
- **Rationale**: Dependabot PR #2 proposed TypeScript 7.0 and `@types/node` 26; the gate rejected
  it at install (`@astrojs/check` peer range `^5 || ^6`). Ignoring known-incompatible majors keeps
  update PRs mergeable instead of noise.
