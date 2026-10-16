# Contract: `npm run pipeline`

Script: `scripts/pipeline.ts`. Reads the vault from `ARTICLE_VAULT_DIR`. Exit code `0` on success,
`1` on a check that fails, `2` on a usage or environment error. Output is plain text for a
terminal; no colours are needed to read it (constitution IV applies in spirit).

Without `ARTICLE_VAULT_DIR`, or when the directory does not exist, every subcommand stops with
exit `2` and `ARTICLE_VAULT_DIR is not set or not readable`. Nothing falls back silently.

## `npm run pipeline` (overview, FR-004, FR-005, FR-019)

```text
Pipeline on 2026-10-16 (2026-W42). Slot: Tuesday 08:00.

Week      Tuesday     State    Article                                   Pillar       Status
2026-W43  2026-10-20  planned  <working title>                           regulated    ready
2026-W44  2026-10-27  planned  <working title>                           regulated    draft
2026-W45  2026-11-03  gap      -
...
2026-W50  2026-12-08  gap      -

Missed: 19 weeks since the last article (2026-06-02, 2026-W23).
Pillars without planned or published work: none.
Buffer: ready 1 of 2. WARNING: fewer than 2 articles are ready.
```

- Horizon: the coming eight ISO weeks, starting with the current week if its Tuesday is today or
  later.
- Missed weeks are summarised as a count since the last publication, so a long pause stays one
  line.
- Exit `0`, also when the buffer warning shows; the warning is information, not a failure.

## `npm run pipeline -- verify <note> --date <yyyy-mm-dd> --url <url>` (FR-014, FR-006, FR-009)

`<note>` is a note title or file name. Fails with exit `1` and one line per problem when:

- the note is not `ready`;
- the date is not in the note's `target_week`
  (`<title>: published 2026-10-21 is not in planned week 2026-W44 (2026-10-27)`);
- the URL is malformed or already used by an article on the site;
- `pilaar` or `words` is missing.

On success prints the derived record as JSON, for the skill to use:

```json
{
  "title": "…",
  "url": "https://www.linkedin.com/pulse/…",
  "published": "2026-10-20",
  "pillar": "regulated",
  "minutes": 4,
  "lang": "nl",
  "series": { "name": "Example series", "id": "example-series", "part": 1 }
}
```

## `npm run pipeline -- mark-published <note> --date <yyyy-mm-dd> --url <url>` (FR-008)

Runs the same checks as `verify`, then sets `status: published`, `publish_date` and `linkedin_url`
in the note's frontmatter. Leaves all other frontmatter and the body unchanged. For an article
that was never planned, `--unplanned` skips the status and week checks and sets `target_week` to
the week of the date.

## `npm run pipeline -- friday` (FR-026)

Prints a short report for the Friday check and exits `0`:

```text
Tuesday 2026-10-20: "<working title>" is ready.
Buffer: ready 1 of 2. WARNING: fewer than 2 articles are ready.
```

or `Tuesday 2026-10-20: nothing is ready.` followed by the buffer line.
