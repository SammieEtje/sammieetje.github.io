// 002:T009 Key numbers data (002:FR-004, 002:SC-005)
import { describe, expect, it } from 'vitest';
import { locales } from '../../src/i18n/ui.ts';
import { keyNumbers } from '../../src/site/key-numbers.ts';

describe('keyNumbers', () => {
  it('holds exactly the three clarified numbers, in order', () => {
    expect(keyNumbers.map((n) => [n.id, n.value, n.suffix])).toEqual([
      ['adoption', 10000, ''],
      ['scale', 5, '×'],
      ['volume', 2.5, '×'],
    ]);
  });

  it('gives every number a label and a context in every language', () => {
    for (const n of keyNumbers) {
      for (const locale of locales) {
        expect(n.label[locale].trim(), `${n.id}.label.${locale}`).not.toBe('');
        expect(n.context[locale].trim(), `${n.id}.context.${locale}`).not.toBe('');
      }
    }
  });

  it('names an organisation and a period in every context', () => {
    for (const n of keyNumbers) {
      for (const locale of locales) {
        expect(n.context[locale]).toMatch(/^(Rabobank|TenneT) · .*\b\d{4}–\d{4}$/);
      }
    }
  });

  it('writes numbers inside Dutch labels the Dutch way', () => {
    const adoption = keyNumbers.find((n) => n.id === 'adoption')!;
    expect(adoption.label.en).toContain('7,600');
    expect(adoption.label.nl).toContain('7.600');
  });
});
