# Implementation Plan: Humanise the Site Copy

**Branch**: `012-humanise-copy` | **Date**: 2026-10-11 | **Spec**: [spec.md](./spec.md)

## Summary

- **Rewrite**: rewrite every bilingual text in the dictionaries and content modules to Sander's
  writing rules: no contrasts, slogans, em dashes or filler, in a direct first-person voice. Facts
  and the protected phrases stay exactly as they are.
- **Inventory**: a small module collects all visitor-facing copy.
- **Guard**: a style-rule module checks every text in `npm run test:unit`, so the patterns cannot
  return.
- **Review page**: a private before/after page is generated from the inventory on `main` and on
  this branch. Details: [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 6.0 strict; Node 24 LTS
**Primary Dependencies**: none new
**Testing**: Vitest:
- style rules, with examples per rule and language;
- the full copy inventory against the rules;
- protected phrases word for word.

Playwright tests that quote copy are updated first.
**Constraints**: facts unchanged (SC-002); bilingual parity (constitution VII); no new runtime JS beyond exporting an existing constant

## Constitution Check

| Principle | Compliance | Status |
|-----------|-----------|--------|
| I. Right thing easy | the guard makes the house style the default; one rule module, checked in the existing gate | Pass |
| II. Test-first | rules, inventory and protected-phrase tests are written and seen failing before the copy changes; e2e expectations are updated before the copy | Pass |
| III. Traceability | `012:` references in new files; existing `data-spec` attributes untouched | Pass |
| IV. Accessible | text only; headings, labels and alt texts keep their roles and stay meaningful | Pass |
| V. Fast and light | no new dependency; the playground bundle changes by one `export` | Pass |
| VI. Private and secure | no new facts; vault material is used only as a style reference and never copied; the review page is private | Pass |
| VII. Bilingual | both languages rewritten together; the parity tests stay | Pass |

## Project Structure

```text
src/site/style-rules.ts          new: styleViolations(text, locale)
scripts/copy-inventory.ts        new: collectCopy(), CLI prints JSON
src/i18n/ui.ts                   rewritten copy (EN + NL)
src/site/{career,method,readme,projects,patterns,key-numbers,articles,adoption-model}.ts   rewritten copy; adoption-model exports its sentences
tests/unit/style-rules.test.ts, copy-style.test.ts, protected-copy.test.ts   new
tests/e2e/*.spec.ts              literal copy expectations updated where the text changes
```

## Complexity Tracking

None.
