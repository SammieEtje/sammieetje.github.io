# Quickstart: Playground

```bash
npm ci && npm run check
npm run dev            # http://localhost:4321/playground/ and /nl/speeltuin/
```

| # | Scenario | Expected | Spec |
|---|----------|----------|------|
| 1 | Open `/playground/` | Default (no levers): curve stalls near the bottom; summary says the platform never gets past early adopters | US1 |
| 2 | Switch on all levers | Curve rises to ~99%; summary: all of them chose it | US1, SC-003 |
| 3 | All levers off, mandate on | ~90% adoption, hatched reluctant band; summary reports the reluctant share | US2 |
| 4 | Read "How the model works" | Rules, illustrative note, Rabobank reference, source link | US3 |
| 5 | Disable JavaScript | Default curve and summary; controls disabled with a note | US4 |
| 6 | DevTools → Network on any other page | No scripts | FR-008 |

## Validation results (2026-10-10)

| # | Result | Evidence |
|---|--------|----------|
| 1 | Pass | `playground.spec.ts` default summary; screenshot (desktop light) |
| 2 | Pass | `playground.spec.ts` all levers → "All of them chose it." |
| 3 | Pass | `playground.spec.ts` mandate → reluctant band and summary; screenshot (desktop dark) |
| 4 | Pass | `playground.spec.ts` explanation, Rabobank reference, source link |
| 5 | Pass | `playground.spec.ts` without JavaScript |
| 6 | Pass | `meta-privacy.spec.ts`: scripts on the playground only; inline script ≈ 1.2 KB gzip |

`quality-gate` passed on pull request #9 (Lighthouse 100 / 100 / 100 / 100 on all fifteen pages).
Observation for a later spec: the budgets step now takes about eight minutes (fifteen pages ×
three runs), which puts 001 SC-005 (live within ten minutes) at risk.
