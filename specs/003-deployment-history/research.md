# Research: Deployment History

## R1. Release notes without scripting

- **Decision**: native `<details>`/`<summary>` per release. The summary row is the release header
  (label, period, title, organisation, one-line summary); the body holds context, approach and
  result.
- **Rationale**: keyboard operable (Enter/Space), open state exposed as expanded/collapsed by the
  browser, works without JavaScript, printable (FR-005).
- **Alternatives**: a JS accordion (violates constitution V for no gain); always-open notes (page
  becomes a wall of text, defeats "scan in one scroll").

## R2. Content model

- **Decision**: typed data in `src/site/career.ts` (releases) and `src/site/patterns.ts` (four
  phases). Text per locale lives with the release, because it is content, not interface
  vocabulary; interface labels (legend title, "present", "Release notes") go in the dictionary.
- Release label `v<YYYY>.<MM>` is derived from `start`, never stored.
- Periods use `Intl.DateTimeFormat` (`en-GB` "Oct 2016", `nl-NL` "okt 2016") inside
  `<time datetime="2016-10">`.
- Unit tests guard: nine role releases plus education; strictly descending start dates; no
  overlaps; exactly one release without end date; every role has ≥ 1 pattern tag from the fixed
  set; every locale has every text field.

## R3. Routes and navigation

- **Decision**: route `career` with paths `/career/` and `/nl/loopbaan/`; navigation term
  "Deployment history — my career" / "Releasegeschiedenis — mijn loopbaan". The 001 route registry,
  meta builder, language switch, parity test and shared per-page tests (axe, metadata, footer,
  privacy, skip link, reflow) pick the page up by adding it to the registry and `tests/e2e/pages.ts`.

## R4. Pattern phases (from the approved positioning)

| id | EN | NL |
|----|----|----|
| consolidate | Consolidate — bring teams and tooling together, create mutual understanding | Consolideren — teams en tooling samenbrengen, onderling begrip creëren |
| stabilise | Stabilise — get daily work under control, automate, build knowledge | Stabiliseren — dagelijks werk onder controle, automatiseren, kennis opbouwen |
| environment | Design the environment — make the right thing the easy thing: self-service, golden paths, compliance built in | Omgeving ontwerpen — maak het juiste het makkelijkste: zelfbediening, golden paths, compliance ingebouwd |
| community | Grow the community — adoption through people, not mandates | Community laten groeien — adoptie via mensen, niet via mandaten |

## R5. Sharper sharing card (002 follow-up)

- **Decision**: simplify the Satori tree to photo + name + headline (headline 44 px, name 76 px,
  photo 340 px), drop role and footer lines; rasterise with resvg, then encode with sharp as
  JPEG quality 90 (mozjpeg, 4:4:4 chroma to keep text edges sharp). Serve at
  `/og/<locale>.jpg`; the `.png` endpoints are removed.
- **Rationale**: LinkedIn re-encodes previews; larger text and fewer small elements survive
  that; serving JPEG ourselves controls quality and roughly halves the size (SC-005).
