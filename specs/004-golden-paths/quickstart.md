# Quickstart: Golden Paths

```bash
npm ci && npm run check
npm run dev            # http://localhost:4321/method/ and /nl/methode/
```

| # | Scenario | Expected | Spec |
|---|----------|----------|------|
| 1 | Open `/method/` at 1280 × 800 | Premise, principle and diagram above the fold | US1, SC-001 |
| 2 | Toggle dark mode | Diagram colours follow; labels readable | US1 |
| 3 | Read levers and assumptions | Two levers with instruments, pragmatism rule; four assumptions with "in practice" | US2, US3 |
| 4 | Click a release link under a phase | Deployment history opens at that release, highlighted | US4, FR-007 |
| 5 | Read "Dependencies" | Six models with authors and takeaways, no percentages | US5 |
| 6 | Open from the nav, the About card and the history legend; switch to NL | All reach the method; `/nl/methode/` in Dutch | US6 |

## Validation results (2026-10-10)

| # | Result | Evidence |
|---|--------|----------|
| 1 | Pass | `method.spec.ts` (premise and diagram above the fold at 1280 × 800); screenshot review |
| 2 | Pass | axe in both schemes; dark-mode screenshot of the diagram |
| 3 | Pass | `method.spec.ts` levers and assumptions |
| 4 | Pass | `method.spec.ts` proof links and `:target`; link gate validates every anchor; screenshot |
| 5 | Pass | `method.spec.ts` dependencies; unit and e2e checks for percentages |
| 6 | Pass | `method.spec.ts` navigation, About and legend links, language switch, Dutch page |

`quality-gate` passed on pull request #5. Lighthouse on all seven pages: 100 / 100 / 100 / 100
with 0 bytes of JavaScript.
