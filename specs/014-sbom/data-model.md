# Data Model: Software Bill of Materials

## Bill of materials (`public/quality/sbom.cdx.json`, published at `/quality/sbom.cdx.json`)

CycloneDX 1.5 JSON, as emitted by `npm sbom`, with these changes made by `scripts/sbom.ts`:

| Field | Value | Requirement |
|---|---|---|
| `bomFormat`, `specVersion` | `CycloneDX`, `1.5` | FR-001 |
| `metadata.timestamp` | generation time (ISO 8601) | FR-001 |
| `metadata.component` | the site: name, `version` from `package.json`, `purl`, plus a `vcs` external reference to the repository | FR-005 |
| `metadata.properties` | `{ name: "sammieetje:build:commit", value: <commit> }` | FR-005, FR-010 |
| `components[]` | npm components and action components (below) | FR-002, FR-003 |
| `dependencies[]` | npm's dependency graph, unchanged | — |

### npm component

| Field | Rule |
|---|---|
| `bom-ref`, `name`, `version`, `purl` | as emitted by npm; `version` and `purl` required |
| `scope` | `required` when the installed lock entry is not `dev`; otherwise `excluded` |
| `properties` | npm's `cdx:npm:package:development` only when `scope` is `excluded` |
| `licenses` | as declared by the package; may be absent |
| `hashes`, `externalReferences` | as emitted by npm |

### Action component

| Field | Rule |
|---|---|
| `bom-ref` | `github-action:<owner>/<repo>[/<path>]@<sha>` |
| `type` | `application` |
| `group`, `name` | `<owner>`, `<repo>[/<path>]` |
| `version` | release tag from the pin comment, for example `v7.0.1` |
| `purl` | `pkg:github/<owner>/<repo>@<sha>` (with `#<path>` subpath when present) |
| `scope` | `excluded` |
| `properties` | `{ name: "cdx:github:action:commit", value: <40-hex sha> }` |
| `externalReferences` | `{ type: "vcs", url: "https://github.com/<owner>/<repo>" }` |

## Installed tree (input, `node_modules/.package-lock.json`)

Entries under `packages`, except the root and links. Each has a path, an optional `name`, a
`version`, and optional `dev`, `devOptional`, `optional`, `os`, `cpu` and `license` fields.

- Identity: `name@version`. Duplicates at different paths count once.
- Shipped: `dev !== true`.
- Platform-specific: `os` or `cpu` present.

## Pinned action (input, `.github/workflows/*.yml`)

A `uses:` line with `<owner>/<repo>[/<path>]@<sha> # <tag>`. Identity: `uses` plus `sha`. The same
action at the same commit in several workflows counts once.

## SBOM check result

| Field | Meaning |
|---|---|
| `valid` | the document validates against the CycloneDX 1.5 schema |
| `problems[]` | one line per failure: `<component>: <reason>`. Reasons: `missing`, `not installed`, `no version`, `no purl`, `marked not shipped but shipped`, `marked shipped but development only`, `action not pinned with a tag`, `contains a local path` |
| `counts` | `{ shipped, pipeline, actions, withoutLicence }` |
| `passed` | `valid && problems.length === 0` |

## Scorecard figures (`src/site/sbom.ts`)

`{ shipped: number; pipeline: number }`, read at build time from the same file that ships.
