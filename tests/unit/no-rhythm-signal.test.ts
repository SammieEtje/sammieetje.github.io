// 013:T022 The public site shows no publishing rhythm (013:FR-022)
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { locales, ui } from '../../src/i18n/ui.ts';

// "Every week" alone is allowed: the playground's adoption model uses it for something else.
const RHYTHM =
  /\b(?:cadence|cadans|rhythm|ritme|streak|every tuesday|elke dinsdag|(?:weekly|wekelijkse?) (?:article|artikel)|(?:article|artikel) (?:every|elke) week)\b/i;

describe('publishing rhythm', () => {
  it('is not mentioned in any visitor-facing string', () => {
    const hits = locales.flatMap((l) =>
      Object.entries(ui[l])
        .filter(([key, value]) => RHYTHM.test(key) || RHYTHM.test(value))
        .map(([key, value]) => `${l} ${key}: ${value}`),
    );
    expect(hits).toEqual([]);
  });

  it('is not a metric on the scorecard', () => {
    const scorecard = readFileSync('src/components/ScorecardPage.astro', 'utf8');
    expect(scorecard).not.toMatch(RHYTHM);
    expect(scorecard).not.toMatch(/\barticles\b/);
  });
});
