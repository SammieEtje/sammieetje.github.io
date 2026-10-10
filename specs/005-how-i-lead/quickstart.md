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
