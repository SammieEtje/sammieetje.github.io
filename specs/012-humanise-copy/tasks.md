---

description: "Task list for 012 Humanise the Site Copy"
---

# Tasks: Humanise the Site Copy

**Input**: Design documents from `/specs/012-humanise-copy/`

**Tests**: Required (constitution II). Test tasks precede their implementation and are seen
failing first. Code carries `012:T###` comments.

## Phase 1: Foundation — rules and inventory

- [ ] T001 [P] Write failing tests in `tests/unit/style-rules.test.ts` for `styleViolations(text, locale)`. Cover each rule with one catching and one passing example per language:
  - the em dash, while an en dash in "2016–2020" passes;
  - forbidden words, for example "pivotal", "data-driven", "essential", "ensure"; Dutch "cruciaal", "essentieel", "datagedreven";
  - `contrast:not-but` ("Not more people, but…" / "niet X, maar Y");
  - `contrast:trailing-not` ("a design problem, not a people problem." / "…, geen mensenprobleem.");
  - `contrast:leading-not` ("Not a judgement, a design constraint" / "Geen oordeel, een ontwerpvoorwaarde");
  - `contrast:is-not-it-is` ("That is not unwillingness; it is…" / "Dat is geen onwil; zo…");
  - `setup:elliptical` ("The best part? You…").

  Also cover normal negations that pass: "This page does not exist.", "If I can't share something, I'll say that I can't.", "Het zijn geen metingen."
- [ ] T002 [P] Write failing tests in `tests/unit/protected-copy.test.ts`: the core message (headline EN/NL, method premise and principle), the four assumption statements, Chris Stapper's quote and the article titles are word for word as listed in data-model.md.
- [ ] T003 Implement `src/site/style-rules.ts` (makes T001 pass) and `scripts/copy-inventory.ts` with `collectCopy()`, which walks `ui` and the content modules for `{ en, nl }` pairs. Export the playground sentences from `src/site/adoption-model.ts`. The CLI prints JSON.
- [ ] T004 Write `tests/unit/copy-style.test.ts`: every inventory entry passes `styleViolations` in both languages. It fails now and lists the offending texts; record that count.

## Phase 2: User Stories 1–2 — Rewrite, protected phrases intact (P1) 🎯 MVP

- [ ] T005 Update the literal copy expectations in `tests/e2e/*.spec.ts` to the new text for every text that changes (plugins intro, playground note, scorecard notes, writing excerpt and any others found); they fail against the current copy.
- [ ] T006 Rewrite `src/i18n/ui.ts`, EN and NL, to the rules and voice in research.md R1. Keep facts and the protected phrases.
- [ ] T007 [P] Rewrite `src/site/career.ts` (summaries and release notes, EN and NL).
- [ ] T008 [P] Rewrite `src/site/method.ts` (premise text around the protected lines, diagnosis, levers, pragmatism, in-practice lines, compliance steps, model takeaways).
- [ ] T009 [P] Rewrite `src/site/readme.ts` (intro, endpoints, known issues; the quote stays).
- [ ] T010 [P] Rewrite `src/site/projects.ts`, `src/site/patterns.ts`, `src/site/key-numbers.ts`, `src/site/articles.ts` (pillar intros and excerpts; titles stay) and the playground sentences.
- [ ] T011 Self-audit every rewritten text line by line against R1 (constructions the regexes cannot see, such as "X over Y" slogans, triads and colon formulas), then run T002, T004 and T005 to green.

## Phase 3: User Story 3 — The patterns cannot creep back (P2)

- [ ] T012 Prove the guard: add "It's not speed, it's precision." and an em dash to a dictionary value; `copy-style` fails naming key, language and rule; revert.

## Phase 4: User Story 4 — Review before and after (P2)

- [ ] T013 Generate the inventory on `main` and on the branch. Build the private before/after review page grouped by page and language, and publish it for the owner.

## Phase 5: Polish

- [ ] T014 Run `npm run check`. Record the results in quickstart.md, open the pull request and confirm `quality-gate` passes.

## Dependencies

- T003 needs T001.
- T004 needs T003.
- Phase 2 needs T004.
- T007–T010 touch different files and can run in parallel. T011 comes after them.
- T013 needs Phase 2.
