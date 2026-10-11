# Quickstart: Humanise the Site Copy

1. **Guard**: `npx vitest run tests/unit/style-rules.test.ts tests/unit/copy-style.test.ts
   tests/unit/protected-copy.test.ts` passes. Before the rewrite, `copy-style` fails and lists
   every offending text.
2. **Negative check**: add "It's not speed, it's precision." or an em dash to any dictionary
   value. `copy-style` fails and names the key, language and rule. Then revert.
3. **Inventory**: `node scripts/copy-inventory.ts > after.json` on the branch and the same on
   `main`. The review page lists every changed text.
4. **Facts**: walk the review page and confirm, for each text, that the numbers, names, dates and
   links are the same.
5. **Gate**: `npm run check` passes. The pull request's `quality-gate` is green.

## Results (2026-10-11, before merge)

- **Inventory and guard**: the inventory holds 324 bilingual texts. Before the rewrite, 43 texts
  broke a rule 46 times; after it, none do. 55 texts changed, each in both languages.
- **Facts**: an automatic comparison of every number and organisation/model name before and after
  found no differences, apart from a comma now following two numbers ("week 8,", "7,600,").
- **Guard proof**: "It's not speed, it's precision — always." injected into a dictionary value
  fails `copy-style` with `em-dash` and `contrast:is-not-it-is`.
  - The first run missed the contraction "it's not". A test was added and seen failing, then the
    rule was fixed.
- **Pinned copy**: three unit tests and ten end-to-end tests asserted old wording. They were
  updated to the new wording without changing what they check.
- **Gate**: `npm run check` passes: audit clean, 165 unit tests, trace with 760 references, 304
  end-to-end tests, links and budgets.
- **Sharing cards**: the EN and NL cards still fit the longer headline (six lines).
