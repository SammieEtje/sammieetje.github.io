# Data Model: Golden Paths

All text fields are `Record<Locale, string>`.

| Entity | Fields | Validation (unit tests) |
|--------|--------|-------------------------|
| Premise | `premise`, `principle`, `diagnosis` | non-empty per locale |
| Lever | `id` (`lower` \| `raise`), `title`, `instruments[]` | exactly two; `lower` has 4 instruments, `raise` has 3 |
| Pragmatism rule | `text` | non-empty |
| Assumption | `order`, `statement`, `subtitle?`, `inPractice` | exactly four, in clarified order; #3 statement "People are inherently lazy" with the clarified subtitle |
| ComplianceStep | `order`, `text` | exactly four |
| Model | `id`, `name`, `authors`, `year`, `takeaway` | six; no `%` anywhere in method content |
| PhaseProof (derived) | phase id → releases tagged with it | every phase ≥ 1 release |

Route: `{ id: 'method', paths: { en: '/method/', nl: '/nl/methode/' } }`, inserted between
`overview` and `career`.

Deployment history change: each release item gets `id="release-<id>"`.
