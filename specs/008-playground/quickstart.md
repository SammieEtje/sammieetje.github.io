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
