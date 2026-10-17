# Quickstart: Weekly Article Pipeline

Validation scenarios for the feature. Contracts: [pipeline CLI](./contracts/pipeline-cli.md),
[publish skill](./contracts/publish-skill.md). Data rules: [data-model.md](./data-model.md).

## Prerequisites

- `ARTICLE_VAULT_DIR` set on Sander's machine to the personal-brand content folder of the vault
  (in the shell profile or the git-ignored `.claude/settings.local.json`).
- `npm ci` done.

## 1. Automated (every change, in the gate)

```sh
npm run test:unit   # article rules, week arithmetic, overview, verify, mark-published, skill text
npm run test:e2e    # writing page: data-driven counts, Dutch title lang, "part n" without total
npm run check       # the full gate
```

Expected: all green. Each guardrail in User Story 3 has a fixture that fails with a message that
names the article (SC-002).

### Guard messages (T009, 2026-10-16)

One real article broken per rule, in memory, against the real data:

| Mistake | Message |
|---|---|
| duplicate URL | `developer-portal: duplicate URL, also used by intake-form (FR-012)` |
| malformed URL | `intake-form: not a LinkedIn Article URL: https://www.linkedin.com/posts/… (FR-013)` |
| future date | `intake-form: date 2027-01-05 is in the future (FR-014)` |
| missing translation | `intake-form: excerpt missing in nl (FR-015)` |
| style rule | `intake-form: excerpt in en breaks style rule em-dash (FR-016)` |
| no pillar | `intake-form: missing or unknown pillar undefined (FR-017)` |
| full text | `intake-form: unexpected field body (FR-011)` |

The planned-week check (FR-014) runs in `pipeline verify`; see scenario 4.

## 2. Overview against the real vault (US1, US4)

```sh
npm run pipeline
```

Expected: eight coming weeks with state and status, the missed-weeks line, pillars without work,
and the buffer line with a warning while fewer than two notes are `ready`. No vault content
appears in `git status` afterwards.

## 3. Missing environment

```sh
ARTICLE_VAULT_DIR= npm run pipeline; echo "exit $?"
```

Expected: `ARTICLE_VAULT_DIR is not set or not readable`, exit `2`.

## 4. Verify refuses a wrong week (US3 scenario 3)

Pick a `ready` note with a `target_week`, then run `verify` with a date in another week.

Expected: exit `1` and `<title>: published <date> is not in planned week <week> (<tuesday>)`.

## 5. First real publish (US2, SC-001)

After the next article is on LinkedIn: `/publish-article <url>`.

Expected, in at most 5 minutes of Sander's time: one branch, one commit, one pull request with a
green quality gate; the note shows `status: published` with date and URL; the overview counts the
week as covered. After merge, the article is live on `/writing/` and `/nl/schrijven/` and links to
LinkedIn.

## 6. Reminders (US5)

- Google Calendar shows a recurring event every Tuesday 08:00 Europe/Amsterdam with the publish
  steps.
- The Friday routine is listed in Sander's routines; a manual run sends a notification that names
  Tuesday's ready article, or says nothing is ready, with the buffer line.
- If the routine cannot read the vault repository, the fallback local job is installed instead;
  note which one is live in the pull request.

## 7. Privacy (SC-005)

```sh
git diff main --stat
git grep -n -i -e "target_week" -e "status: ready" -e "/Users/" -- src public
```

Expected: no planning data, working titles or local paths in the public site sources. The site
shows no rhythm signal (FR-022).

## Results (2026-10-17)

| Check | Result |
|---|---|
| `npm run check` | exit 0 in 8 min 39 s: audit 0 vulnerabilities, format, lint, types, 234 unit tests, trace (868 references), build, 305 e2e tests, internal links, all Lighthouse budgets met |
| `npm run pipeline` on the real vault | 0.15 s (target under 2 s); 25 LinkedIn notes read |
| Missing `ARTICLE_VAULT_DIR` | exit 2 with the expected message (unit test) |
| Backfill (T024) | `verify --backfill` passed for all ten published notes; `mark-published --backfill` changed only frontmatter lines; committed and pushed in the vault |
| Overview after backfill | "Missed: 19 weeks since the last article (2026-06-02, 2026-W23)"; every pillar has planned or published work; buffer 0 of 2 with warning |
| Calendar event (T019) | recurring, Tuesday 08:00–08:30 Europe/Amsterdam from 2026-10-20, private |
| Friday routine (T020) | created, Friday 08:00 UTC, first run 2026-10-23; Telegram when `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set in the cloud environment, otherwise email to Sander. A manual run follows the merge, since the script must be on `main` |
| Vault push | a `post-commit` hook in the vault pushes every commit (owner chose a hook over a scheduled job); `/publish-article` commits the updated note |
| Privacy scan | `no-planning-data` and `no-rhythm-signal` tests pass, and fail on a planted `target_week` and "every Tuesday" |
