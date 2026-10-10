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
