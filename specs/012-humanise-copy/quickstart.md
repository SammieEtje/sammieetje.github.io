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
