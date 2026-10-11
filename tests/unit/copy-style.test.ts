// 012:T004 Every visitor-facing text follows the house style, in both languages (012:FR-001, 012:FR-006)
import { describe, expect, it } from 'vitest';
import { collectCopy } from '../../scripts/copy-inventory.ts';
import { locales } from '../../src/i18n/ui.ts';
import { styleViolations } from '../../src/site/style-rules.ts';

const copy = collectCopy();

describe('site copy', () => {
  it('is collected from every source, with the protected plain strings left out', () => {
    expect(copy.length).toBeGreaterThan(300);
    const ids = copy.map((c) => c.id);
    for (const prefix of [
      'ui:',
      'playground:',
      'career.',
      'method.',
      'readme.',
      'projects.',
      'patterns.',
      'numbers.',
      'writing.',
    ]) {
      expect(
        ids.some((id) => id.startsWith(prefix)),
        prefix,
      ).toBe(true);
    }
    expect(copy.some((c) => c.en.includes('Satoru Iwata'))).toBe(false);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('follows the house style', () => {
    const problems = copy.flatMap((c) =>
      locales.flatMap((l) =>
        styleViolations(c[l], l).map((rule) => `${c.id} [${l}] ${rule}: ${c[l]}`),
      ),
    );
    expect(problems).toEqual([]);
  });
});
