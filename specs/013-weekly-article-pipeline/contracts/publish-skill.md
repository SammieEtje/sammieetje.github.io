# Contract: `/publish-article` skill

File: `.claude/skills/publish-article/SKILL.md`. Invoked by Sander after he has published an
article on LinkedIn: `/publish-article <LinkedIn URL> [note title]`.

## Steps

1. **Find the note.** Use the title if given, otherwise search the vault with `om` for the ready
   article of this week. Confirm the title with Sander.
2. **Verify.** `npm run pipeline -- verify "<note>" --date <today, Europe/Amsterdam> --url <url>`.
   On exit `1`, show the problems and stop. A different week on purpose: Sander edits
   `target_week` first; the check is never skipped. An unplanned article: Sander confirms, and
   the skill uses `--unplanned`.
3. **Excerpts.** Read the note's text through `om` or the vault. Draft an English and a Dutch
   excerpt: an original summary, at most two sentences, following the site's style rules. Show
   both; Sander approves or edits.
4. **Add the article.** On a new branch `article/<id>` from an up-to-date `main`, add the record to
   `src/site/articles.ts` (top of the list, newest first). A new series gets its English and Dutch
   name in `series` in the same change. When this is the last part of a series, set `total` on all
   its parts.
5. **Gate.** `npm run check`. On failure, fix and re-run; never push a failing change.
6. **One commit, one pull request.** Commit message:

   ```text
   feat(writing): add "<title>"

   Co-Authored-By: <the agent's co-author line>
   ```

   Pull-request title `Add article: <title>`; body lists title, URL, date, pillar, series and both
   excerpts. No session links and no session trailers in either, also when the tooling adds one
   by default.
7. **Mark published.** `npm run pipeline -- mark-published "<note>" --date … --url …`, then commit
   only that note in the vault (`git -C "$ARTICLE_VAULT_DIR" commit … -- "<note file>"`). The
   vault's post-commit hook pushes it, so the Friday check reads the current planning.
8. **Report.** The pull-request link and the new overview (`npm run pipeline`). Sander reviews and
   merges.

## Changing an article later

A changed LinkedIn URL or a withdrawn article is a small hand edit in `src/site/articles.ts`
(and `status: withdrawn` in the note), through the same gate; the duplicate rule keeps URLs
unique.

## What the skill never does

- Publish on LinkedIn, or merge the pull request.
- Copy article text, working titles of other articles, or anything else from the vault into the
  repository beyond the published record.
- Write a local path into the repository.
