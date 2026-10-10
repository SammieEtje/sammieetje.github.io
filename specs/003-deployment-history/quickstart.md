# Quickstart: Deployment History

```bash
npm ci
npm run check
npm run dev            # http://localhost:4321/career/ and /nl/loopbaan/
```

| # | Scenario | Expected | Spec |
|---|----------|----------|------|
| 1 | Open `/career/` | Nine releases + education, newest first, current marked "latest" | US1 |
| 2 | Tab to a release, press Enter | Notes open in place; Enter again closes | US2 |
| 3 | Disable JavaScript, repeat 2 | Same behaviour | US2 |
| 4 | Read the legend | Four phases explained; every release tagged | US3 |
| 5 | From `/`, use the nav and the Key numbers link | Both reach the history; NL switch → `/nl/loopbaan/` | US4 |
| 6 | Open `/og/en.jpg` | 1200 × 630 JPEG: photo, name, large headline | US5 |
| 7 | After merge: LinkedIn Post Inspector | Card legible after LinkedIn's re-encoding | US5 |

## Validation results (2026-10-10)

| # | Result | Evidence |
|---|--------|----------|
| 1 | Pass | `career.spec.ts`; screenshot review (desktop light, mobile dark NL) |
| 2 | Pass | `career.spec.ts` keyboard test |
| 3 | Pass | `career.spec.ts` without JavaScript |
| 4 | Pass | `career.spec.ts` legend and tag tests |
| 5 | Pass | `career.spec.ts` navigation, Key numbers link, language switch |
| 6 | Pass | `sharing.spec.ts` (JPEG, 1200 × 630, ≤ 125 KB; actual 84 KB); reviewed visually |
| 7 | Pass (2026-10-10, after merge) | LinkedIn Post Inspector previews `/` and `/career/` with the new JPEG card; a first attempt showed no preview, which cleared on retry (LinkedIn-side) |

`quality-gate` passed on pull request #4. Lighthouse on all five pages: 100 / 100 / 100 / 100
with 0 bytes of JavaScript.
