# Data Model: Playground

| Entity | Fields |
|--------|--------|
| LeverId | lower: `knowledge`, `selfservice`, `community`, `value`; raise: `accountability`, `compliance`, `support` (labels from the method page's lever instruments, same order) |
| Scenario | `levers: Set<LeverId>`, `mandate: boolean` |
| WeekPoint | `week` (1–52), `adoption` (0–1), `reluctant` (0–1, share of the whole team) |
| Result | `weeks: WeekPoint[52]`, `final` (adoption at week 52), `reluctantShare` (reluctant / adopters at week 52) |
