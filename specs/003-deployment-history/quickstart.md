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
