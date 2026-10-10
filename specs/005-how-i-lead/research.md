# Research: How I Lead

## R1. Content model

- **Decision**: typed content in `src/site/readme.ts`: meta (last updated, introduction),
  endpoints (id, method, path, title, items), known issues (description + workaround),
  testimonial (quote, author, role, URL). Text per locale; the testimonial quote stays in its
  original English on both pages, marked `lang="en"` so screen readers pronounce it correctly.
- **Source rule (FR-006, SC-003)**: every statement comes from the clarifications or from Sander's
  published positioning. Values are drafted from published principles (trust by default; make
  the right thing the easy thing; learning over blaming; build things that outlast us) and
  flagged for review in the pull request.

## R2. Endpoint presentation

- **Decision**: each section is an `<section id="endpoint-<id>">` with a heading that contains a
  method badge (`GET`, `POST`, `PUT` written out, with a text colour and an outline so meaning
  never depends on colour), a mono path and the plain-language title. A table of contents lists
  every endpoint with its anchor (validated by the link gate's `--check-fragments`).
- Paths: `GET /values`, `GET /expectations/me`, `GET /expectations/you`, `POST /one-on-ones`,
  `GET /contact`, `POST /feedback`, `GET /errors`, `GET /known-issues`.

## R3. Navigation and links

- Route `how-i-lead`, paths `/how-i-lead/` and `/nl/zo-leid-ik/`, appended after Deployment history
  (Overview → Golden paths → Deployment history → API docs). The home identity card gets a
  secondary link "How I lead" next to the LinkedIn button. Error handling links to the method
  page's assumption 2 via a new stable anchor `#assumption-2`.
