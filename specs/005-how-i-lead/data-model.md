# Data Model: How I Lead

| Entity | Fields | Validation (unit tests) |
|--------|--------|-------------------------|
| ReadmeMeta | `updated` (ISO date), `intro` | date is valid ISO; intro per locale |
| Endpoint | `id`, `method` (`GET`/`POST`/`PUT`), `path`, `title`, `items[]` | exactly the eight ids of FR-005, in order; every text per locale; paths unique |
| KnownIssue | `description`, `workaround` | exactly the two clarified issues |
| Testimonial | `quote` (EN), `author`, `role`, `url` | author "Chris Stapper"; URL without query string |

Method page change: assumption list items get `id="assumption-<n>"`.
