# Data Model: Catalog Overview

## ProfilePhoto

- Source: `src/assets/profile.jpg`, 490 × 490, JPEG, no embedded metadata.
- Alt text: dictionary key `photo.alt` (EN "Portrait of Sander Ettema", NL "Portret van Sander
  Ettema").

## KeyNumber (`src/site/key-numbers.ts`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | stable, e.g. `adoption` |
| `value` | number | `10000`, `5`, `2.5` |
| `suffix` | `'' \| '×'` | appended after formatting |
| `label` | `Record<Locale, string>` | sentence fragment following the value |
| `context` | `Record<Locale, string>` | organisation · period |

Validation (unit test): exactly three entries; every locale has non-empty label and context;
every context contains a four-digit year range (SC-005).

Content:

| id | value | label (EN) | context (EN) |
|----|-------|------------|--------------|
| adoption | 10000 | voluntary users on the CI/CD platform, in an IT organisation of 7,600 — without a mandate | Rabobank · 2016–2020 |
| scale | 5 × | infrastructure growth (500 → 2,500 Linux nodes) with a 15% smaller team | Rabobank · 2011–2016 |
| volume | 2.5 × | service volume with minimal team growth | TenneT · Infrastructure, Integration & Cloud · 2023–2026 |

Dutch labels and contexts are translations with Dutch number formatting inside the text.

## ProfileLink (`src/site/profile.ts`)

| Field | Example |
|-------|---------|
| `id` | `linkedin`, `github` |
| `name` | `LinkedIn`, `GitHub` |
| `url` | `https://www.linkedin.com/in/sanderettema/`, `https://github.com/SammieEtje` |
| `handle` | `in/sanderettema`, `SammieEtje` |

## PageMeta (extended from 001)

- `image`: `{ url: absolute, width: 1200, height: 630, alt: string }` — `alt` from dictionary key
  `og.alt`.

## SharingImage

- Path `/og/<locale>.png`, 1200 × 630 PNG, rendered at build from ProfilePhoto + `site.name` +
  `profile.headline` + site host.
