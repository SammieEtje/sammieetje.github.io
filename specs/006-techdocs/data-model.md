# Data Model: TechDocs

| Entity | Fields | Validation |
|--------|--------|------------|
| Pillar | `id` (`people`, `environment`, `regulated`, `community`), `name`, `intro` | four, fixed order |
| Article | `id`, `title` (EN), `url`, `published` (YYYY-MM-DD, Amsterdam), `minutes`, `pillar`, `series?` {`id`, `part`, `total`}, `excerpt` | ten; unique ids/URLs; URL shape; excerpt ≤ 2 sentences per locale; series parts 1..5 complete |
| Series | `id`, `name` | `platform-as-product`: "Running the platform as a product" / "Het platform runnen als product" |

Route: `{ id: 'writing', paths: { en: '/writing/', nl: '/nl/schrijven/' } }`, last in navigation.
