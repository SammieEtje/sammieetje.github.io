# Data Model: Humanise the Site Copy

## Copy entry (from `collectCopy()`)

| Field | Rule |
|-------|------|
| `id` | stable path to the text, e.g. `ui:method.compliance.intro`, `career:tennet-iic.notes.approach`, `readme:endpoints.expect-me.items.0` |
| `en`, `nl` | the visitor-facing text in each language; both are always present |

Only bilingual pairs are entries. Plain strings (quotes, article titles, names, tags) are never
entries, so they are outside the style rules by construction.

## Style rule

| Field | Rule |
|-------|------|
| `name` | e.g. `em-dash`, `word:pivotal`, `contrast:not-but`, `contrast:trailing-not`, `contrast:leading-not`, `contrast:is-not-it-is`, `setup:elliptical` |
| `locale` | `en`, `nl` or both |
| test | a regular expression on the text |

## Protected phrase

Protection covers the phrase itself: a longer text that contains it (the headline, for example) is
rewritten around it, and the test checks that the phrase is still contained word for word.

| Phrase | Where | Reason |
|--------|-------|--------|
| "People take the path of least resistance." / "Mensen kiezen de weg van de minste weerstand." | headline, method premise | core message |
| "Make the right thing the easy thing." / "Maak het juiste het makkelijkste." | method principle | core message |
| the four assumption statements | method | as published by Sander |
| Chris Stapper's quote | manager README | someone else's words |
| article titles | writing page | as published |
