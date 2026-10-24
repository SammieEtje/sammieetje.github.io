# Research: Software Bill of Materials

All findings were measured on this repository on 2026-10-24 (npm 11.20.0, Node 24).

## R1. Which tool generates the SBOM

- **Decision**: npm's built-in `npm sbom --sbom-format cyclonedx`, wrapped by a new script,
  `scripts/sbom.ts`, that enriches and checks the result.
- **Findings**:
  - The command emits CycloneDX 1.5 JSON for the installed tree. That is 714 components here. Each
    has a `bom-ref`, a name, an exact version, a `purl` (`pkg:npm/...`), a SHA-512 hash and the
    declared licence.
  - It includes a `dependencies` graph, and it contains no absolute paths.
  - Only one component declares no licence (`parse-cache-control`, via Lighthouse CI).
- **Alternatives**:
  - `@cyclonedx/cyclonedx-npm` produces the same format but is a new dependency with its own
    install tree.
  - Syft and Trivy are external binaries outside npm, which means another tool to pin and update.
  - Writing the SBOM from the lock file by hand would reinvent what npm already does.

## R2. What "shipped" means, and how it is marked

- **Finding**: npm's own markers cannot be used as they are.
  - In the full SBOM, npm marks development packages with the property
    `cdx:npm:package:development`, but it also marks 5 `devOptional` packages that a production
    install still installs (for example `@emnapi/core`, `tslib`).
  - `npm sbom --omit dev` goes the other way: it leaves out 42 packages that
    `npm ci --omit=dev` does install (for example `vite`, `rolldown`, `sharp`, `yaml`).
- **Decision**: "shipped" means what a production install installs, the scope that
  `npm audit --omit=dev` (011) already audits. In lock-file terms, that is every installed entry
  whose `dev` flag is not `true`. `devOptional` entries count as shipped.
  - Source: npm's hidden lockfile `node_modules/.package-lock.json`, which describes exactly the
    installed tree.
  - The script sets CycloneDX `scope` to `required` for shipped components and `excluded` for
    everything else. In CycloneDX, `excluded` is the standard marker for components used for
    "test and other non-runtime purposes".
  - The script keeps npm's `cdx:npm:package:development` property only where it agrees with the
    lock file. That avoids two conflicting markers in one file.
- **Alternatives**:
  - Trusting npm's property mislabels 5 shipped packages as development tooling.
  - Combining two npm runs (full and `--omit dev`) mislabels 42 shipped packages the other way.

## R3. Pipeline actions in the SBOM

- **Decision**: the script reads `.github/workflows/*.yml` as text. It takes every
  `uses: <owner>/<repo>[/<path>]@<40-hex sha> # <tag>` line and adds one CycloneDX component per
  distinct action and commit:
  - `type: application`, `scope: excluded`;
  - `name` `<owner>/<repo>` (with group `<owner>`);
  - `version` set to the release tag from the comment;
  - `purl` `pkg:github/<owner>/<repo>@<sha>`;
  - a `vcs` external reference to the repository;
  - a `cdx:github:action:commit` property holding the full SHA.
- There are 7 distinct actions today.
- The existing workflow policy already requires full-SHA pins (001), so every action has a commit.
- A `uses:` line without a tag comment fails the SBOM check (FR-006), because the version would
  be missing.
- **purl type**: `pkg:github/` is an official purl type for GitHub-hosted packages. It is used
  instead of the unregistered `githubactions` type.
- **Alternatives**: parsing the YAML with `yaml` loses the tag comment. Leaving actions out was
  rejected in clarify.

## R4. Proving the SBOM is valid CycloneDX

- **Decision**: validate against the official CycloneDX 1.5 JSON Schema with Ajv.
  - The three schema files (`bom-1.5.schema.json`, `spdx.schema.json`, `jsf-0.82.schema.json`) are
    vendored from the CycloneDX specification repository, tag `1.5`, into
    `scripts/sbom-schema/1.5/`.
  - They are excluded from Prettier, so they stay byte-identical to the source.
- **Findings**:
  - npm's output validates (`true`, 0 errors).
  - A copy with a component version removed and `bomFormat` deleted fails.
  - Ajv does not know the formats `iri-reference` and `idn-email`. They are registered as
    accepted-without-checking, as the CycloneDX tooling does. The structure is still validated
    in full.
- **New development dependencies**: `ajv` 8.20.0 and `ajv-formats` 3.0.1. Neither is shipped, and
  Dependabot keeps both current.
- **Alternatives**:
  - `@cyclonedx/cyclonedx-library` brings the same Ajv plus a much larger library.
  - A hand-written structural check would only prove the fields we thought of, which is weaker than
    the standard's own schema.

## R5. Completeness check

- **Decision**: the check compares the SBOM against two independent sources:
  - **npm**: the set of `name@version` in the hidden lockfile (deduplicated) MUST equal the set of
    npm components. Each component MUST have a version and a purl, and its scope MUST match the
    lock file's `dev` flag.
  - **Actions**: the set of pinned actions in the workflows MUST equal the set of action
    components.
- Today: 714 installed `name@version` pairs, 714 in the SBOM, 0 missing, 0 extra.
- Every failure names the component and the reason ("missing", "no version", "marked not shipped
  but shipped"). This is FR-006.
- A missing licence is counted and reported, but it does not fail the check (FR-004).
- **Privacy guard**: the serialised SBOM MUST NOT match an absolute path pattern (`/Users/`,
  `/home/`, `C:\`) or the runner's work directory (FR-005).

## R6. Platform differences between local and CI

- **Finding**: the installed tree depends on the platform. On macOS (arm64), for example,
  `@img/sharp-darwin-arm64` and `@rolldown/binding-darwin-arm64` are installed. CI (Linux x64)
  installs their Linux counterparts instead.
- **Decision**: the SBOM describes what was installed where it was generated, which is the truth
  for that build. The parity requirement (US1 scenario 3) holds for every component except
  platform-specific optional binaries.
  - A component counts as platform-specific when its lock entry declares `os` or `cpu`.
  - The published SBOM always comes from CI, so its counts are stable across deploys.
  - The spec's scenario and edge cases are updated to say so.
- **Alternative**: `--package-lock-only` would list every platform's binaries (803 components),
  including packages no build ever installed. That is precise about the lock file and wrong about
  the build.

## R7. Where the SBOM lives and how it reaches the site

- **Decision**: `npm run sbom` writes `public/quality/sbom.cdx.json`, which is git-ignored.
  - It runs in the `checks` job after `npm ci` and before `npm run build`.
  - Astro copies `public/` into `dist/`, so the SBOM travels inside the tested `dist` artifact that
    the report job packages for Pages. The published SBOM is therefore exactly the file that was
    checked (FR-009).
  - The stable public address is `/quality/sbom.cdx.json`. `.cdx.json` is CycloneDX's
    recommended file extension.
  - It is also uploaded as its own run artifact, `sbom`, so pull request runs keep it as well
    (7-day retention, as the other artifacts).
- **Build identity (FR-005, FR-010)**:
  - The script stamps `metadata.component` with the repository as a `vcs` external reference.
  - It adds a `metadata.properties` entry holding the commit. The commit comes from the same
    function the quality report uses (`currentCommit()`, `GITHUB_SHA` in CI, otherwise
    `git rev-parse HEAD`), now exported from `scripts/quality-report.ts`.
  - Both files of one run therefore carry the same commit.
- **Size**: about 870 KB raw, about 140 KB compressed. Pages serves it compressed, and no page
  loads it, so no Lighthouse budget is affected.

## R8. Scorecard counts without JavaScript

- **Decision**: a new module, `src/site/sbom.ts`, reads `public/quality/sbom.cdx.json` at build
  time and returns `{ shipped, pipeline }`.
  - `shipped` counts components with scope `required`. `pipeline` counts components with scope
    `excluded`, the actions included.
  - The scorecard page renders a static section with an explanation, both counts and a link
    (FR-011). Because the page and the published file come from the same file in the same build,
    the counts cannot drift.
  - When the file is missing, the module throws: "Run `npm run sbom` first". `npm run dev` runs
    `npm run sbom` first, so the dev server keeps working.
- **Alternative**: fetching the SBOM in the browser, as the quality report is fetched. That needs
  JavaScript and fails the no-JavaScript requirement.
