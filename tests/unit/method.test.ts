// 004:T001 Method content invariants (004:FR-002, 004:FR-004 – 004:FR-006, 004:FR-008, 004:FR-009, 004:SC-002, 004:SC-003)
import { describe, expect, it } from 'vitest';
import { locales } from '../../src/i18n/ui.ts';
import { releases } from '../../src/site/career.ts';
import {
  assumptions,
  complianceSteps,
  levers,
  models,
  phaseProofs,
  pragmatism,
  premise,
} from '../../src/site/method.ts';
import { patterns } from '../../src/site/patterns.ts';

const everyText = (value: unknown): string[] =>
  typeof value === 'string'
    ? [value]
    : Array.isArray(value)
      ? value.flatMap(everyText)
      : value && typeof value === 'object'
        ? Object.values(value).flatMap(everyText)
        : [];

describe('method content', () => {
  it('states premise, principle and diagnosis in every language', () => {
    for (const locale of locales) {
      for (const key of ['premise', 'principle', 'diagnosis'] as const) {
        expect(premise[key][locale].trim(), `${key}.${locale}`).not.toBe('');
      }
    }
    expect(premise.principle.en).toBe('Make the right thing the easy thing.');
  });

  it('has two levers: four instruments to lower resistance, three to raise it', () => {
    expect(levers.map((l) => [l.id, l.instruments.length])).toEqual([
      ['lower', 4],
      ['raise', 3],
    ]);
    expect(pragmatism.en).toMatch(/compliant/);
  });

  it('lists the four assumptions in the agreed order', () => {
    expect(assumptions.map((a) => a.statement.en)).toEqual([
      'Our users are skilled engineers with good intentions',
      'Learning requires room to fail safely',
      'People are inherently lazy',
      'With great freedom comes great responsibility',
    ]);
    expect(assumptions[2]!.subtitle?.en).toBe(
      'Not a judgement, a design constraint: people take the path of least resistance.',
    );
    for (const a of assumptions) {
      for (const locale of locales) expect(a.inPractice[locale].trim()).not.toBe('');
    }
  });

  it('has four compliance steps and six models with authors and year', () => {
    expect(complianceSteps).toHaveLength(4);
    expect(models).toHaveLength(6);
    for (const m of models) {
      expect(m.authors).not.toBe('');
      expect(m.year).toBeGreaterThan(1900);
    }
  });

  it('contains no percentages or other behaviour statistics', () => {
    const texts = everyText({ premise, levers, pragmatism, assumptions, complianceSteps, models });
    expect(texts.length).toBeGreaterThan(40);
    for (const text of texts) expect(text).not.toMatch(/\d\s*%|percent|procent/i);
  });

  it('attributes the ASE model to De Vries et al., building on Fishbein & Ajzen', () => {
    const ase = models.find((m) => m.id === 'ase')!;
    expect(ase.authors).toMatch(/^De Vries/);
    const nocnsf = releases.find((r) => r.id === 'nocnsf')!;
    expect(nocnsf.notes!.en.approach).toContain('De Vries');
    expect(nocnsf.notes!.nl.approach).toContain('De Vries');
  });
});

describe('phase proofs', () => {
  it('derive, for every phase, the releases tagged with it — at least one each', () => {
    for (const phase of patterns) {
      const proof = phaseProofs(phase.id);
      expect(proof.length, phase.id).toBeGreaterThan(0);
      expect(proof.map((r) => r.id)).toEqual(
        releases.filter((r) => r.patterns.includes(phase.id)).map((r) => r.id),
      );
    }
  });
});
