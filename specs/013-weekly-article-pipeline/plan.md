# Implementation Plan: Weekly Article Pipeline

**Branch**: `013-weekly-article-pipeline` | **Date**: 2026-10-16 | **Spec**: [spec.md](./spec.md)

## Summary

- **Planning in the vault**: the planning is the frontmatter of Sander's article notes, extended
  with `status`, `target_week` and `linkedin_url`. It stays private; repository scripts read it
  through `ARTICLE_VAULT_DIR` (research R1, R2).
- **Overview**: `npm run pipeline` prints the coming eight weeks, gaps, missed weeks, pillar gaps
  and the buffer line, from one pure module (R3).
- **Publish step**: a `/publish-article` skill: scripted checks (`verify`, `mark-published`),
  excerpts written with Claude, `npm run check`, one commit and one pull request (R4).
- **Guardrails**: `src/site/article-rules.ts` checked in the unit-test step of the gate. The
  existing tests that hard-code ten articles, an empty pillar and one series become rules (R5).
- **Two small site changes** a Dutch article or a new series needs: an optional `lang` per article
  and series parts without a total while a series runs (R8).
- **Reminders**: a recurring Tuesday 08:00 calendar event and a Friday routine that runs
  `npm run pipeline -- friday` (R7). Both are set up in Sander's accounts after he confirms.

## Technical Context

**Language/Version**: TypeScript 6.0 strict; Node 24 LTS (scripts run as `.ts` directly, as the
existing scripts do)

**Primary Dependencies**: none new; `yaml` (already a devDependency) parses note frontmatter

**Storage**: vault note frontmatter (private, outside the repository); `src/site/articles.ts`
(public)

**Testing**: Vitest:
- article rules, with one broken fixture per rule and the real data;
- week arithmetic in Europe/Amsterdam;
- overview, `verify` and `mark-published` against fixture notes in a temporary directory;
- skill and CLAUDE.md text (no session links, no local paths).

Playwright: the writing page made data-driven; Dutch title `lang`; "part n" without total.

**Target Platform**: GitHub Pages (site); Sander's macOS machine and a Claude Code routine
(scripts)

**Project Type**: static site plus local tooling

**Performance Goals**: `npm run pipeline` answers in under 2 seconds on the real vault

**Constraints**: no new client-side JavaScript; no planning data, vault text or local paths in the
repository; bilingual parity for anything visible

**Scale/Scope**: about 30 notes, one article a week

## Constitution Check

| Principle | Compliance | Status |
|-----------|-----------|--------|
| I. Right thing easy | one skill and one script per concern; the guardrails run in the existing unit-test step, so `npm run check` and CI stay equal | Pass |
| II. Test-first | rules, week arithmetic, overview, verify and mark-published get failing tests first; existing tests are rewritten before data changes. The calendar event and routine are account setup, verified by the quickstart (see Complexity Tracking) | Pass, one justified exception |
| III. Traceability | `013:` references in new code; the changed series line and the title `lang` carry `data-spec`; new FR IDs are plain (`FR-025`, `FR-026`) so the trace check reads them | Pass |
| IV. Accessible | correct `lang` on Dutch titles improves WCAG 3.1.2; "part n" keeps its text | Pass |
| V. Fast and light | no new dependency, no client JS; the site changes are two attributes and a text branch | Pass |
| VI. Private and secure | planning stays in the vault; the path comes from an environment variable; the skill copies only the published record; tests guard local paths and session links | Pass |
| VII. Bilingual | excerpts and series names in both languages, enforced by the rules; "part n" exists in both | Pass |

Re-checked after Phase 1 design: no change.

## Project Structure

### Documentation (this feature)

```text
specs/013-weekly-article-pipeline/
├── plan.md, research.md, data-model.md, quickstart.md
├── contracts/pipeline-cli.md, contracts/publish-skill.md
└── tasks.md   (next phase)
```

### Source Code

```text
src/site/article-rules.ts            new: articleProblems(articles) (FR-012–FR-017)
src/site/articles.ts                 Article.lang?, series.total? (R8)
src/site/weeks.ts                    new: ISO week, Tuesday slot, today in Europe/Amsterdam (FR-020)
src/components/WritingPage.astro     title lang per article (FR-028); "part n" without total (FR-027)
src/i18n/ui.ts                       unchanged keys reused; no rhythm copy (FR-022)
scripts/pipeline.ts                  new: overview | verify | mark-published | friday (FR-004–FR-009, FR-014, FR-019, FR-026)
scripts/pipeline/notes.ts            new: read and write vault frontmatter
.claude/skills/publish-article/SKILL.md   new: the golden path (FR-006–FR-010, FR-024)
CLAUDE.md                            new: where the pipeline lives, how to reach it (FR-025)
README.md                            "Publishing an article" section
package.json                         "pipeline" script
tests/unit/article-rules.test.ts, weeks.test.ts, pipeline.test.ts, publish-skill.test.ts   new
tests/unit/articles.test.ts          hard-coded counts become rules (FR-018)
tests/e2e/writing.spec.ts            data-driven; lang and "part n" cases (FR-018)
```

**Structure Decision**: site code stays in `src/site` and `src/components` as in 006; local
tooling goes in `scripts/` like the other scripts; the skill sits next to the Spec Kit skills.

## Complexity Tracking

| Deviation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| FR-021 and FR-026 are set up in Sander's accounts and checked by the quickstart, not by CI | the calendar event and the routine live outside the repository; CI has no access to them, and should not | the report they deliver (`pipeline friday`) and the step list are tested; only their existence is checked by hand, once |
