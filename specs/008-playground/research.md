# Research: Playground

## R1. The model (deterministic, weekly, 52 weeks)

Start: 5% early adopters, voluntary. Per scenario: `L` = levers that lower resistance on the
right path (0–4), `R` = levers that raise it on the wrong path (0–3).

- Friction of the golden path: `1 − 0.18·L`; friction of the old habit: `0.5 + 0.15·R`.
- Advantage = habit friction − path friction.
- Weekly voluntary adoption rate = clamp(`0.08·advantage + 0.05·voluntary`, 0, 0.25): the
  advantage of the path plus social influence of colleagues who already chose it (ASE/TPB).
- Weekly churn back to the habit when the path is harder: `0.03·max(0, −advantage)·voluntary`.
- Mandate: announced in week 8, enforced to 90% of the team by week 16. Reluctant users are those
  on the platform only because of the mandate: `max(0, target − voluntary)`.

Checked numerically (week 52): no levers → 2%; all levers → 99% (63% after a quarter); all levers
off with a mandate → 90% adopted, 97% of them reluctant. Every lever is monotone: the update is
increasing in both the advantage and the current adoption, so more levers never lower adoption
(proved by induction in the code comments, verified exhaustively in unit tests over all 256
scenarios). The constants are illustrative, chosen to make the method's claims visible; the page
and the source say so.

## R2. One module, two runtimes

- `src/site/adoption-model.ts` exports `simulate`, `chartPaths` (SVG path data for the adoption
  line and the reluctant band) and `summarize` (EN/NL sentences kept in the module so the browser
  bundle does not pull in the whole dictionary). Astro renders the default scenario at build time;
  an Astro `<script>` (bundled, hashed, same-origin module) imports the same functions and updates
  the SVG `d` attributes and the summary on every `change` event.
- Progressive enhancement: the controls render inside `<fieldset disabled>` with a "needs
  JavaScript" note; the script enables the fieldset and removes the note.
- Budget: expected bundle well under 5 KB; Lighthouse's script-size assertion (≤ 50 KB) already
  runs on every page. The 001 "no scripts" test is narrowed to every page except the playground,
  where it asserts a single same-origin module script instead (FR-008).

## R3. Accessibility

- Native checkboxes styled as feature flags, grouped in two `<fieldset>`s with legends, plus the
  mandate switch; visible focus.
- Chart: `role="img"` with an accessible name; the reluctant band uses a hatch pattern and a
  dashed outline, not colour alone; the summary (`role="status"`, `aria-live="polite"`) carries
  the numbers in text.
- Reduced motion: no transitions; updates are instant regardless.

## R4. Navigation

- Route `playground` (`/playground/`, `/nl/speeltuin/`), seventh section. Seven items make four
  rows in the two-column phone navigation; the home fold (001 SC-001) must be re-verified and
  the navigation tightened if needed.
