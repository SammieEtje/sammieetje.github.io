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
