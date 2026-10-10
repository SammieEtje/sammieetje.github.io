// 008:T002 Illustrative adoption model, shared by the build and the browser (008:FR-001 – 008:FR-003)
//
// Not a forecast. The constants are chosen to make the method's claims visible:
// lower resistance on the right path, raise it on the wrong path, and let colleagues pull each
// other along. Deterministic: the same scenario always gives the same result.
//
// Monotonicity (008:FR-003): with v the voluntary share and a the advantage, the weekly update
// f(v, a) = v + rate(v, a)·(1 − v) − churn(v, a) is non-decreasing in a (rate grows, churn
// shrinks) and in v (∂f/∂v ≥ 1 − rate − 0.03·|a| > 0 within the clamps). By induction over the
// weeks, a scenario with more levers (larger a) never ends lower. Verified exhaustively in tests.
// Kept free of imports so the browser bundle stays a few kilobytes.

export const lowerIds = ['knowledge', 'selfservice', 'community', 'value'] as const;
export const raiseIds = ['accountability', 'compliance', 'support'] as const;
export const leverIds = [...lowerIds, ...raiseIds] as const;

export type LeverId = (typeof leverIds)[number];
type Locale = 'en' | 'nl';

export interface Scenario {
  levers: ReadonlySet<LeverId>;
  mandate: boolean;
}

export interface WeekPoint {
  week: number;
  /** Share of the team on the golden path (0–1). */
  adoption: number;
  /** Share of the team on it only because of the mandate (0–1). */
  reluctant: number;
}

export interface Result {
  weeks: WeekPoint[];
  final: number;
  /** Reluctant users as a share of all adopters in week 52. */
  reluctantShare: number;
}

export const WEEKS = 52;
const EARLY_ADOPTERS = 0.05;
const MANDATE_ANNOUNCED = 8;
const MANDATE_ENFORCED = 16;
const MANDATE_TARGET = 0.9;

const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);

export function simulate(scenario: Scenario): Result {
  const lower = lowerIds.filter((id) => scenario.levers.has(id)).length;
  const raise = raiseIds.filter((id) => scenario.levers.has(id)).length;
  const pathFriction = 1 - 0.18 * lower;
  const habitFriction = 0.5 + 0.15 * raise;
  const advantage = habitFriction - pathFriction;

  let voluntary = EARLY_ADOPTERS;
  const weeks: WeekPoint[] = [];
  for (let week = 1; week <= WEEKS; week++) {
    const rate = clamp(0.08 * advantage + 0.05 * voluntary, 0, 0.25);
    const churn = 0.03 * Math.max(0, -advantage) * voluntary;
    voluntary = clamp(voluntary + rate * (1 - voluntary) - churn, 0, 1);

    const target = !scenario.mandate
      ? 0
      : MANDATE_TARGET *
        clamp((week - MANDATE_ANNOUNCED) / (MANDATE_ENFORCED - MANDATE_ANNOUNCED), 0, 1);
    const reluctant = Math.max(0, target - voluntary);
    weeks.push({ week, adoption: voluntary + reluctant, reluctant });
  }
  const last = weeks[WEEKS - 1]!;
  return {
    weeks,
    final: last.adoption,
    reluctantShare: last.adoption > 0 ? last.reluctant / last.adoption : 0,
  };
}

/** Plot area inside the SVG viewBox: room for axis labels on the left and bottom. */
export const PLOT = { left: 44, right: 12, top: 12, bottom: 32 } as const;

export function chartPaths(result: Result, width: number, height: number) {
  const x = (week: number) =>
    PLOT.left + ((week - 1) / (WEEKS - 1)) * (width - PLOT.left - PLOT.right);
  const y = (share: number) => PLOT.top + (1 - share) * (height - PLOT.top - PLOT.bottom);
  const pt = (px: number, py: number) => `${px.toFixed(1)} ${py.toFixed(1)}`;
  const top = result.weeks.map((w) => pt(x(w.week), y(w.adoption)));
  const bottom = [...result.weeks].reverse().map((w) => pt(x(w.week), y(w.adoption - w.reluctant)));
  return {
    adoption: `M${top.join(' L')}`,
    reluctant: `M${[...top, ...bottom].join(' L')} Z`,
  };
}

const sentences: Record<Locale, Record<'stalled' | 'voluntary' | 'mandated', string>> = {
  en: {
    stalled:
      'After a year, {a}% of the team works on the golden path. The platform never gets past its early adopters.',
    voluntary: 'After a year, {a}% of the team works on the golden path. All of them chose it.',
    mandated:
      'After a year, {a}% of the team works on the golden path, {r}% of them only because they have to.',
  },
  nl: {
    stalled:
      'Na een jaar werkt {a}% van het team via het golden path. Het platform komt nooit verder dan de early adopters.',
    voluntary:
      'Na een jaar werkt {a}% van het team via het golden path. Ze kozen er allemaal zelf voor.',
    mandated:
      'Na een jaar werkt {a}% van het team via het golden path, {r}% van hen alleen omdat het moet.',
  },
};

export function summarize(result: Result, locale: Locale): string {
  const a = Math.round(result.final * 100);
  const r = Math.round(result.reluctantShare * 100);
  const kind = result.final < 0.1 ? 'stalled' : r >= 1 ? 'mandated' : 'voluntary';
  return sentences[locale][kind].replace('{a}', String(a)).replace('{r}', String(r));
}
