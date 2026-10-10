# Quickstart: How I Lead

```bash
npm ci && npm run check
npm run dev            # http://localhost:4321/how-i-lead/ and /nl/zo-leid-ik/
```

| # | Scenario | Expected | Spec |
|---|----------|----------|------|
| 1 | Open `/how-i-lead/` | Intro, version line, testimonial, table of contents | US1 |
| 2 | Click "POST /feedback" in the contents | Jumps to the feedback endpoint | SC-001 |
| 3 | Read every endpoint | Method written out, path, plain title; first-person, concrete | US1, US2 |
| 4 | Read known issues and error handling | Two issues with workarounds; link to "room to fail safely" | US3, US4 |
| 5 | End of page; home identity card; nav; NL switch | LinkedIn CTA; links reach the page; `/nl/zo-leid-ik/` in Dutch | US5 |

## Validation results (2026-10-10)

| # | Result | Evidence |
|---|--------|----------|
| 1 | Pass | `readme.spec.ts` structure; screenshot review (desktop light, mobile NL dark) |
| 2 | Pass | `readme.spec.ts` contents link lands on `POST /feedback` |
| 3 | Pass | `readme.spec.ts` method/path/title per endpoint; clarified practices |
| 4 | Pass | `readme.spec.ts` known issues; link to `/method/#assumption-2` |
| 5 | Pass | `readme.spec.ts` CTA, navigation, identity-card link, language switch, Dutch page |

`quality-gate` passed on pull request #6. Lighthouse on all nine pages: 100 / 100 / 100 / 100
with 0 bytes of JavaScript.
