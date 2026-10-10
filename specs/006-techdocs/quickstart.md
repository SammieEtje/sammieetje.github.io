# Quickstart: TechDocs

```bash
npm ci && npm run check
npm run dev            # http://localhost:4321/writing/ and /nl/schrijven/
```

| # | Scenario | Expected | Spec |
|---|----------|----------|------|
| 1 | Open `/writing/` | Four pillars; ten articles, newest first per pillar; "coming soon" under Regulated and fast | US1 |
| 2 | Activate an article title | LinkedIn article opens | US2 |
| 3 | Look at the IT4IT articles | "Running the platform as a product · part n of 5" | US3 |
| 4 | Open `/nl/schrijven/` | Dutch pillars, excerpts and dates; English titles | US4 |
| 5 | Open `/method/` | "Further reading" in premise, levers, assumptions and community phase | FR-009 |

## Validation results (2026-10-10)

| # | Result | Evidence |
|---|--------|----------|
| 1 | Pass | `writing.spec.ts` pillars, order, coming-soon state; screenshot review |
| 2 | Pass | `writing.spec.ts` link targets and accessible names |
| 3 | Pass | `writing.spec.ts` series markers |
| 4 | Pass | `writing.spec.ts` Dutch page; screenshot of Dutch navigation on a phone |
| 5 | Pass | `writing.spec.ts` four further-reading links on the method page |

`quality-gate` passed on pull request #7. Lighthouse on all eleven pages: 100 / 100 / 100 / 100
with 0 bytes of JavaScript.
