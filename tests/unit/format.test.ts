// 002:T003 Locale number formatting (002:FR-005)
import { describe, expect, it } from 'vitest';
import { formatNumber } from '../../src/site/format.ts';

describe('formatNumber()', () => {
  it('groups thousands per language', () => {
    expect(formatNumber(10000, 'en')).toBe('10,000');
    expect(formatNumber(10000, 'nl')).toBe('10.000');
  });

  it('uses the decimal separator of the language', () => {
    expect(formatNumber(2.5, 'en', '×')).toBe('2.5×');
    expect(formatNumber(2.5, 'nl', '×')).toBe('2,5×');
  });

  it('appends a suffix without a space', () => {
    expect(formatNumber(5, 'en', '×')).toBe('5×');
  });
});
