# Research: Humanise the Site Copy

## R1. The rules

- **Source**: Sander's vault note "Writing Rules - Humanise" and the humanise-text skill reference.
  Both forbid the same things: the five rhetorical constructions (elliptical setup, revelation
  hook, big contrast, great reframe, philosophical reduction), em dashes, and a list of filler
  words, buzzwords and stock expressions. Sander's "Writing Rules - Personal Brand" adds:
  - first person, personal and professional, with no hero framing;
  - promote the alternative instead of criticising what exists;
  - concrete over abstract.
- **Diagnosis of the current copy**: the forbidden-word lists barely hit (one "data-driven", one
  "pivotal", one "essential/essentieel", one "cruciaal", four em dashes). The machine feel comes
  from structure:
  - about 35 contrast constructions ("Context, not instructions", "Not more people, but…", "a
    design problem, not a people problem", "not despite compliance, but because of it");
  - aphorisms ("Bad news fast is good news", "design the loop, not the belief");
  - reframes ("a brake … becomes an accelerator");
  - colon formulas ("X: Y, Z and W") in most summaries.
- **Voice reference**: Sander's own published article on intake forms. It uses plain first-person
  sentences, concrete observations, mixed sentence lengths, and occasional short closers ("That's
  about it."). It gives an honest reaction where it fits ("I was relieved") and invents no drama.

## R2. What stays

The following stay word for word (clarification 2026-10-11):

- the core message: "People take the path of least resistance" and "make the right thing the easy
  thing" (Dutch: "de weg van de minste weerstand", "het juiste het makkelijkste");
- the four assumption statements, including "People are inherently lazy";
- Chris Stapper's quote;
- the published article titles.

Facts stay exactly as approved: numbers, organisations, dates, names, links and claims. Only the
sentences around them change. The portal labels ("Catalog entity", "Endpoints", "Release notes")
are interface names and stay.

## R3. The guard

- **Decision**: a pure module, `src/site/style-rules.ts`, exports
  `styleViolations(text, locale): string[]`, which returns the names of the rules a text breaks.
  It covers:
  - the em dash;
  - forbidden words and expressions per language (word boundaries, case-insensitive);
  - regex detectors for the contrast family, per language:
    - "not X, but Y" / "niet X, maar Y";
    - "X, not Y." / "X, geen Y.";
    - sentence-initial "Not X, Y" / "Geen X, Y";
    - "is not X; it is Y" / "is geen X; zo/het …";
  - the elliptical setup "The X? Y".
- **Inventory**: `scripts/copy-inventory.ts` exports `collectCopy()`. It walks the dictionaries and
  every content module and returns `{ id, en, nl }` for every bilingual text.
  - Plain strings are not bilingual pairs and are skipped by construction: quotes, article
    titles, names and technical tags.
  - The playground's result sentences in `adoption-model.ts` are exported so the inventory sees
    them.
  - As a CLI, the script prints the inventory as JSON (used for the review page, R4).
- **Gate**: `tests/unit/copy-style.test.ts` runs every inventory text through the rules and fails
  with the text id, language and rule.
  - It runs in `npm run test:unit`, so it is already part of `npm run check` and the pipeline.
  - A separate test, `tests/unit/protected-copy.test.ts`, asserts the protected phrases word for
    word.
- **False positives**: the word list leaves out terms that are proper names or literal terms in
  this copy: "framework" (Google's HEART framework, academic models) and "alignment"
  (business–IT alignment as a rotation name). The en dash in ranges is not an em dash.
- **Alternatives**:
  - an LLM-based check in CI: non-deterministic, needs a secret (rejected);
  - a prose linter such as Vale: a new dependency and configuration for a dozen rules
    (rejected; constitution V asks for justification of new dependencies, and a 60-line module
    does the job).

## R4. The review page

- **Decision**: run `collectCopy()` on `main` (before) and on the branch (after). Join the two by
  id, and render the changed texts as a private Artifact page: before and after per language,
  grouped by page. The page is generated from the inventory, so it cannot drift from the code.
- The page is published privately and linked in the PR conversation, not in the repository: it
  is review material, not site content.

## R5. Tests that quote copy

Some end-to-end tests assert literal text, for example:

- the plugins intro "Ik ben technisch nieuwsgierig";
- the playground note "They are not measurements.";
- the scorecard no-JavaScript note;
- the Dutch golden-cage excerpt.

These tests are updated to the new text before the copy changes (test-first). Tests that assert
the protected phrases stay as they are.
