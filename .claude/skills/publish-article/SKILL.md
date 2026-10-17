---
name: publish-article
description: Register a LinkedIn Article Sander has just published on the site, in one pull request through the quality gate, and mark it published in his private planning. Use when Sander says he published an article, or runs /publish-article <LinkedIn URL> [note title].
---

# Publish an article

<!-- 013:T018 The golden path for the weekly publish step (013:FR-006 – 013:FR-010, 013:FR-024).
     Contract: specs/013-weekly-article-pipeline/contracts/publish-skill.md -->

Sander has published an article on LinkedIn. This skill puts it on the writing page through one
pull request and marks it published in his planning. The planning lives in his private vault; read
it through the `om` server or through `npm run pipeline` (which needs `ARTICLE_VAULT_DIR`). Never
copy anything from the vault into the repository beyond the published record below.

## 1. Find the note

Use the note title from the arguments if given. Otherwise run `npm run pipeline` and take the
`ready` article planned for this week. Confirm the title with Sander before going on.

Today's date in Amsterdam: `TZ=Europe/Amsterdam date +%F`.

## 2. Verify

```sh
npm run pipeline -- verify "<note>" --date <today> --url <LinkedIn URL>
```

On exit 1, show Sander the problems and stop. Never skip a check:

- **Published in another week on purpose**: Sander changes `target_week` in the note first, then
  run verify again.
- **Never planned**: after Sander confirms, add `--unplanned`.

On success it prints the record: title, URL, date, pillar, reading time, language and series.

## 3. Write the excerpts

Read the article text from the vault note. Draft an English and a Dutch excerpt:

- an original summary in your own words, never a copied passage (006:FR-007);
- at most two sentences per language;
- the site's style rules (`src/site/style-rules.ts`): no em dashes, no "not X, but Y" contrasts,
  none of the listed words; first person where it fits; plain and direct.

Show both to Sander. He approves or edits them.

## 4. Add the article

```sh
git switch main && git pull --ff-only && git switch -c article/<id>
```

`<id>` is a short kebab-case name, unique among the articles. Add the record at the top of the
`articles` list in `src/site/articles.ts`, with the approved excerpts. Set `lang: 'nl'` only for a
Dutch article. For a series:

- a new series gets its English and Dutch name in `series` in the same change (ask Sander for the
  Dutch name);
- leave out `total` while the series runs; when this is the last part, set `total` on every part.

## 5. Run the gate

```sh
npm run check
```

On failure, fix the record and run it again. Never push a change that fails.

## 6. One commit, one pull request

Commit message, with only this trailer:

```text
feat(writing): add "<title>"

Co-Authored-By: <your co-author line>
```

```sh
git push -u origin article/<id>
gh pr create --title "Add article: <title>" --body "<title, URL, date, pillar, series, both excerpts>"
```

Leave out any session link or session trailer in the commit and the pull request, also when the
tooling adds one by default. An article pull request is a content change: no spec, phase tags or
task IDs.

## 7. Mark it published

```sh
npm run pipeline -- mark-published "<note>" --date <today> --url <LinkedIn URL>
```

Use the same flags as in step 2. Then commit only that note in the vault, so the Friday check
(which reads the vault from GitHub) sees it; the vault's post-commit hook pushes it:

```sh
git -C "$ARTICLE_VAULT_DIR" commit -m "Mark \"<title>\" published" -- "<note file>"
```

## 8. Report

Give Sander the pull-request link and the new overview (`npm run pipeline`). He reviews and merges.

## Changing an article later

A changed LinkedIn URL or a withdrawn article is a small hand edit in `src/site/articles.ts` (and
`status: withdrawn` in the note), through the same gate; the duplicate rule keeps URLs unique.

## Never

- publish on LinkedIn or merge the pull request;
- copy article text, other working titles or anything else from the vault into the repository;
- write a local path into the repository.
