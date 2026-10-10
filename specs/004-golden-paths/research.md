# Research: Golden Paths

## R1. Content model

- **Decision**: typed content in `src/site/method.ts`: premise, levers, assumptions, compliance
  steps and models, each with per-locale text. Phases are reused from `src/site/patterns.ts`
  (003); the releases per phase are derived from `src/site/career.ts`, never listed by hand.
- **Rationale**: one source of truth; a phase without a release fails a unit test (spec edge case).

## R2. Path diagram without scripting

- **Decision**: inline SVG in `PathDiagram.astro`, `role="img"` with `<title>`/`<desc>` from the
  dictionary. Two routes from "today" to "goal": a short, smooth desired path (accent colour,
  markers for self-service, defaults, community) and a longer, winding current habit (muted,
  markers for manual work and waiting). Colours come from CSS custom properties, so light and
  dark mode work without a second asset. Text labels are real `<text>` in the page language.
- **Alternatives**: raster image (two languages × two schemes, blurry); JS chart (forbidden by V
  and unnecessary). The interactive version belongs to 008.

## R3. Stable release links (FR-007)

- **Decision**: each release `<li>` in the deployment history gets `id="release-<id>"`; links use
  `/career/#release-rabo-da` (NL `/nl/loopbaan/#release-rabo-da`). `:target` highlights the
  release; `scroll-margin-top` keeps it clear of the top edge. The link checker already runs with
  `--check-fragments`, so a broken anchor fails the gate.

## R4. Science section as "dependencies"

- **Decision**: render models like a dependency manifest (`kahneman/dual-process@2011`) with a
  readable name, authors, year and takeaway. Sources:
  - Dual-process theory — Kahneman, *Thinking, Fast and Slow* (2011)
  - Theory of Planned Behaviour — Ajzen (1991)
  - ASE model — De Vries, Dijkstra & Kuhlman (1988), building on Fishbein & Ajzen
  - Nudge / choice architecture — Thaler & Sunstein (2008)
  - Fogg Behavior Model — Fogg (2009)
  - Habit loop — Duhigg (2012), popularising MIT habit research
- A unit test asserts that no takeaway or method text contains a percentage (FR-009, SC-003).
- **Correction found**: the vault and LinkedIn text attribute the ASE model to Fishbein & Ajzen;
  the model is by De Vries et al. building on Fishbein & Ajzen. The 003 NOC\*NSF release note is
  corrected accordingly (flagged for the owner in the pull request).

## R5. Navigation order

- **Decision**: Overview → Golden paths → Deployment history. The method explains the "how"
  before the history proves it; route order in the registry drives the navigation.
