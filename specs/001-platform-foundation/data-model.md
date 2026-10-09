# Data Model: Platform Foundation

All data is static and lives in the repository; nothing is stored at runtime.

## Locale

- `code`: `'en' | 'nl'` — `en` is the default.
- `pathPrefix`: `''` for `en`, `'/nl'` for `nl`.
- `htmlLang`: `'en'` / `'nl'`; `ogLocale`: `'en_GB'` / `'nl_NL'`.

## UiStrings (dictionary)

- Keys: a fixed set of string identifiers (for example `nav.overview.term`, `skip.link`,
  `footer.source`).
- Values: one non-empty string per locale.
- Validation: the Dutch dictionary is typed against the English keys (compile error when a key
  is missing); a unit test asserts identical key sets and non-empty values (FR-010).

## Route

- `id`: stable identifier, for example `overview`.
- `paths`: `{ en: '/', nl: '/nl/' }` — always one path per locale.
- `nav`: optional `{ termKey, subtitleKey }` (UiStrings keys); present when the route is a
  top-level section shown in the primary navigation (FR-004).
- Validation: every route's paths exist as built HTML pages in `dist/` (e2e build test); the
  navigation lists only routes in this registry.

## PageMeta

- `title`: unique per page and locale.
- `description`: non-empty, 50–160 characters.
- `canonical`: absolute URL of the page.
- `alternates`: absolute URL per locale plus `x-default` (= English).
- `og`: `title`, `description`, `type` (`website`), `url`, `locale`, `localeAlternate`.
- Derived by a pure helper from `Route` + `Locale` + strings (FR-006, FR-009).

## Profile

- `name`: "Sander Ettema".
- `currentRole`: per locale ("Manager Data & Analytics Platform at TenneT").
- `positioning`: per locale ("Platform transformation in highly regulated contexts").
- `headline`: per locale.
- `linkedin`: `https://www.linkedin.com/in/sanderettema/`.

## BuildInfo

- `sha`: full commit SHA, or `local`.
- `shortSha`: first 7 characters (or `local`).
- `url`: commit URL in `SammieEtje/sammieetje.github.io`, or the repository URL when `local`.
- `repoUrl`, `specsUrl`: repository and `specs/` tree URLs (FR-012).

## QualityReport (`quality-report.json`, FR-019)

```json
{
  "schemaVersion": 1,
  "commit": "<sha>",
  "generatedAt": "<ISO-8601>",
  "pages": [
    {
      "url": "/nl/",
      "scores": { "performance": 0.99, "accessibility": 1, "best-practices": 1, "seo": 1 },
      "scriptBytes": 0
    }
  ],
  "budgets": {
    "performance": 0.9, "accessibility": 0.95, "best-practices": 0.95, "seo": 0.95,
    "scriptBytes": 51200
  },
  "passed": true
}
```

- `pages[].url` is site-relative; scores are Lighthouse medians (0–1).
- `passed` is `true` only when every page meets every budget.
