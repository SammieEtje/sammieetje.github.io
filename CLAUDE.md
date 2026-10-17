# sammieetje.github.io

Sander Ettema's profile site, built spec-first with Spec Kit. The constitution in
`.specify/memory/constitution.md` applies to every change; README.md describes the golden path.

## Articles

<!-- 013:T021 Where the editorial pipeline lives (013:FR-025) -->

- The editorial pipeline (planning, working titles, status, target weeks and drafts) lives in
  Sander's private Obsidian vault, in the frontmatter of his article notes. It never goes into
  this repository.
- Search and read the vault through the `om` server. Scripts read it from the directory in the
  environment variable `ARTICLE_VAULT_DIR`, which is set on Sander's machine and never committed.
- `npm run pipeline` shows the coming weeks, gaps and the ready buffer.
- After Sander publishes on LinkedIn, `/publish-article <url>` adds the article to the site in one
  pull request. Article pull requests are content changes outside the Spec Kit flow, through the
  same quality gate.
- Only published metadata goes into `src/site/articles.ts`: title, URL, date, reading time,
  pillar, series and an original two-sentence excerpt per language.
