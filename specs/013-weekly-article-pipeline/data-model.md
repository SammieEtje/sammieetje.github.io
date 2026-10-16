# Data Model: Weekly Article Pipeline

Two stores, kept apart on purpose (FR-001):

| Store | Visibility | Holds |
|---|---|---|
| Vault notes (frontmatter) | private | every planned article, with status and target week |
| `src/site/articles.ts` | public | published articles only |

## Planned article (vault note frontmatter)

Existing fields are reused under their current names; new fields are marked **new**.

| Field | Type | Rule |
|---|---|---|
| `title` | from the first `#` heading, without a "Week n, Post n —" or "Deel n:" prefix | required |
| `status` | `idea \| draft \| ready \| published \| withdrawn` | required; legacy notes without it count as `draft` |
| `pilaar` | `P1`–`P4`, optionally followed by a name | required; P1 `people`, P2 `environment`, P3 `regulated`, P4 `community` |
| `target_week` **new** | ISO week `YYYY-Www` | required from `ready` on; unique among unpublished notes |
| `reeks`, `deel` | series name, part number | optional, together |
| `taal` | `EN \| NL` | optional, default `EN` |
| `words` | integer | required from `ready` on (reading time, FR-009) |
| `publish_date` | `YYYY-MM-DD` | set by `mark-published` |
| `linkedin_url` **new** | `https://www.linkedin.com/pulse/<slug>` | set by `mark-published` |

Notes are in scope when they live in the content folder (not in `archive/` or `analytics/`),
have `platform: LinkedIn`, and have `type` `article` or `content`. Short posts from the weeks with
two posts are published history and only count as covered weeks.

### State transitions

```text
idea → draft → ready → published
  ↑      ↑ ↓     ↓
  └──────┴─┴─────┘   one step back, on purpose
any state → withdrawn
```

`mark-published` only accepts a note in `ready` (FR-003). Moving a ready article to another week
means editing `target_week` before publishing (edge case "published in a different week").

## Published article (`src/site/articles.ts`)

The 006 `Article` shape, with two changes (research R8):

| Field | Change |
|---|---|
| `lang?: 'en' \| 'nl'` | **new**, default `en`; the language of the title and the LinkedIn text |
| `series.total?` | **optional**; omitted while a series is running, set once it is complete |

Derived from the note by `pipeline verify`: `pillar` from `pilaar`, `minutes =
ceil(words / 230)`, `series` from `reeks`/`deel` (series id is the kebab-case of the series name),
`published` from the date, `lang` from `taal`. Written by Claude with Sander's approval: `id`
(kebab-case short name, unique), `excerpt.en`, `excerpt.nl`.

### Rules (`article-rules.ts`, run in the gate)

| Rule | Requirement |
|---|---|
| `id` and `url` unique | FR-012 |
| `url` matches `^https://www\.linkedin\.com/pulse/[a-z0-9-]+$` | FR-013 |
| `published` is a valid date, not after today (Europe/Amsterdam), not before 2026-03-09 | FR-014 |
| `excerpt`, series names, pillar names and intros non-empty in `en` and `nl` | FR-015 |
| excerpt at most two sentences and no `styleViolations` per language | FR-016 |
| `pillar` is one of the four ids | FR-017 |
| `series.id` exists in `series`; `part ≤ total` when a total is set | FR-006 (006) |

Each problem is reported as `<article id>: <rule> (<detail>)`.

## Publication week

| Field | Rule |
|---|---|
| `week` | ISO week `YYYY-Www`; its slot is that week's Tuesday 08:00 Europe/Amsterdam |
| `state` | `covered` (an article published in it), `planned` (unpublished note targets it), `missed` (in the past and not covered), `gap` (coming, nothing planned) |

Two articles in one week: the week is `covered` once; the second does not cover a later week.

## Buffer

`ready` = notes with `status: ready`. Warning when `ready < 2` (FR-019); the overview prints
`ready <n> of 2`.
