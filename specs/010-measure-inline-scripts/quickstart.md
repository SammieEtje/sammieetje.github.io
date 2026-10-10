# Quickstart: Measure Inline Scripts

```bash
npm ci && npm run check
python3 -c "import json; r=json.load(open('quality-report.json')); print({p['url']: p['scripts'] for p in r['pages'] if p['scriptBytes']})"
```

| # | Scenario | Expected | Spec |
|---|----------|----------|------|
| 1 | Run the full check | `/playground/`, `/scorecard/` (and Dutch) show inline > 0; all other pages 0 | US1 |
| 2 | Temporarily embed > 50 KB of script in a page, run `npm run budgets` | Budget step fails; report marks the page over budget with the same value | US2, SC-003 |
| 3 | Open the scorecard after merge | Playground and scorecard rows show ~1–2 KB; note under the table explains the measure | US1, US3, SC-001 |

## Validation results (2026-10-10)

| # | Result | Evidence |
|---|--------|----------|
| 1 | Pass | Local full check and PR #11 CI report: playground 1,185 B and scorecard 899 B embedded (both languages), 0 B on the other 13 pages; 17 of 17 pages, all budgets met |
| 2 | Pass | Injected ~52 KB script: report step exited 1, "JavaScript budget exceeded: /playground/ 53472 B", page marked over budget with the same value; restored |
| 3 | Pass (after merge) | Live report for `fcda02f`: playground 1,185 B and scorecard 899 B embedded (both languages); the merge deployed in 6 min 43 s |

`quality-gate` passed on pull request #11 in 6 min 32 s.
