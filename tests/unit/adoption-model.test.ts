// 008:T001 Adoption model invariants (008:FR-001 – 008:FR-003, 008:SC-003)
import { describe, expect, it } from 'vitest';
import { levers as methodLevers } from '../../src/site/method.ts';
import {
  chartPaths,
  leverIds,
  lowerIds,
  raiseIds,
  simulate,
  summarize,
  type LeverId,
  type Scenario,
} from '../../src/site/adoption-model.ts';

const scenario = (levers: LeverId[], mandate = false): Scenario => ({
  levers: new Set(levers),
  mandate,
});

const allScenarios: Scenario[] = Array.from({ length: 1 << leverIds.length }, (_, mask) =>
  scenario(leverIds.filter((_, i) => mask & (1 << i))),
).flatMap((s) => [s, { ...s, mandate: true }]);

describe('levers', () => {
  it('align with the method page: four lower, three raise', () => {
    expect(lowerIds).toHaveLength(methodLevers.find((l) => l.id === 'lower')!.instruments.length);
    expect(raiseIds).toHaveLength(methodLevers.find((l) => l.id === 'raise')!.instruments.length);
    expect(leverIds).toEqual([...lowerIds, ...raiseIds]);
  });
});

describe('simulate()', () => {
  it('runs 52 weeks, deterministically', () => {
    const s = scenario(['selfservice', 'community'], true);
    expect(simulate(s).weeks).toHaveLength(52);
    expect(simulate(s)).toEqual(simulate(s));
  });

  it('keeps adoption and the reluctant share between 0 and 1 in all 256 scenarios', () => {
    for (const s of allScenarios) {
      for (const w of simulate(s).weeks) {
        expect(w.adoption).toBeGreaterThanOrEqual(0);
        expect(w.adoption).toBeLessThanOrEqual(1);
        expect(w.reluctant).toBeGreaterThanOrEqual(0);
        expect(w.reluctant).toBeLessThanOrEqual(w.adoption + 1e-12);
      }
    }
  });

  it('never lowers final adoption when a lever is added (exhaustive)', () => {
    for (const s of allScenarios) {
      const base = simulate(s).final;
      for (const id of leverIds.filter((l) => !s.levers.has(l))) {
        const more = simulate({ ...s, levers: new Set([...s.levers, id]) }).final;
        expect(more, `${[...s.levers].join('+')} + ${id}`).toBeGreaterThanOrEqual(base - 1e-12);
      }
    }
  });

  it('stalls at the early adopters by default', () => {
    expect(simulate(scenario([])).final).toBeLessThan(0.1);
  });

  it('reaches at least 80% voluntarily with every lever on (SC-003)', () => {
    const r = simulate(scenario([...leverIds]));
    expect(r.final).toBeGreaterThanOrEqual(0.8);
    expect(r.reluctantShare).toBe(0);
  });

  it('makes most adopters reluctant under a mandate without levers (SC-003)', () => {
    const r = simulate(scenario([], true));
    expect(r.final).toBeGreaterThanOrEqual(0.85);
    expect(r.reluctantShare).toBeGreaterThanOrEqual(0.5);
  });
});

describe('chartPaths()', () => {
  it('returns SVG path data inside the plot area', () => {
    const paths = chartPaths(simulate(scenario(['selfservice'], true)), 600, 300);
    for (const d of [paths.adoption, paths.reluctant]) {
      expect(d).toMatch(/^M[\d.]+ [\d.]+( L[\d.]+ [\d.]+)+( Z)?$/);
      for (const [, x, y] of d.matchAll(/([\d.]+) ([\d.]+)/g)) {
        expect(Number(x)).toBeLessThanOrEqual(600);
        expect(Number(y)).toBeLessThanOrEqual(300);
      }
    }
  });
});

describe('summarize()', () => {
  it('describes a stalled, a voluntary and a mandated outcome in both languages', () => {
    expect(summarize(simulate(scenario([])), 'en')).toMatch(/never gets past its early adopters/);
    expect(summarize(simulate(scenario([...leverIds])), 'en')).toMatch(/All of them chose it\./);
    expect(summarize(simulate(scenario([], true)), 'en')).toMatch(/only because they have to/);
    expect(summarize(simulate(scenario([])), 'nl')).toMatch(/komt nooit verder dan/);
    expect(summarize(simulate(scenario([...leverIds])), 'nl')).toMatch(
      /kozen er allemaal zelf voor/,
    );
    expect(summarize(simulate(scenario([], true)), 'nl')).toMatch(/alleen omdat het moet/);
  });
});
