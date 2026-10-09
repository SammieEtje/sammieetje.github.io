# Data Model: Deployment History

## Release (`src/site/career.ts`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | stable, e.g. `tennet-dap` |
| `kind` | `'role' \| 'education'` | education renders distinctly (FR-006) |
| `org` | string | `TenneT`, `Rabobank`, `NOC*NSF`, `University of Twente` |
| `location` | string | `Arnhem`, `Utrecht`, `Enschede` |
| `start` | `YYYY-MM` | release label `vYYYY.MM` derived from it |
| `end` | `YYYY-MM \| null` | `null` = current (exactly one) |
| `title` | `Record<Locale, string>` | |
| `summary` | `Record<Locale, string>` | one line |
| `notes` | `Record<Locale, { context; approach; result }>` | education: `context` only |
| `patterns` | `PatternId[]` | ≥ 1 for roles, empty for education |

Order in the file = display order (newest first); a unit test enforces descending `start`.

## PatternPhase (`src/site/patterns.ts`)

| Field | Type |
|-------|------|
| `id` | `'consolidate' \| 'stabilise' \| 'environment' \| 'community'` |
| `name` | `Record<Locale, string>` |
| `explanation` | `Record<Locale, string>` |

## Route (registry addition)

`{ id: 'career', paths: { en: '/career/', nl: '/nl/loopbaan/' }, nav: career term/subtitle }`

## PageMeta (change)

`image.url` → `https://sammieetje.github.io/og/<locale>.jpg`.
