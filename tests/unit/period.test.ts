// 003:T001 Release labels and periods (003:FR-002, 003:FR-003)
import { describe, expect, it } from 'vitest';
import { formatPeriod, releaseLabel } from '../../src/site/period.ts';

describe('releaseLabel()', () => {
  it('derives vYYYY.MM from the start month', () => {
    expect(releaseLabel('2016-10')).toBe('v2016.10');
  });

  it('uses the year alone when only a year is known', () => {
    expect(releaseLabel('1993')).toBe('v1993');
  });
});

describe('formatPeriod()', () => {
  it('formats month and year per language', () => {
    expect(formatPeriod('2016-10', '2020-08', 'en')).toBe('Oct 2016 – Aug 2020');
    expect(formatPeriod('2016-10', '2020-08', 'nl')).toBe('okt 2016 – aug 2020');
  });

  it('ends an open period with "present"', () => {
    expect(formatPeriod('2026-05', null, 'en')).toBe('May 2026 – present');
    expect(formatPeriod('2026-05', null, 'nl')).toBe('mei 2026 – heden');
  });

  it('does not depend on the time zone of the machine', () => {
    const tz = process.env['TZ'];
    process.env['TZ'] = 'America/Los_Angeles';
    try {
      expect(formatPeriod('2016-10', '2020-08', 'en')).toBe('Oct 2016 – Aug 2020');
    } finally {
      process.env['TZ'] = tz;
    }
  });

  it('formats year-only periods', () => {
    expect(formatPeriod('1993', '2000', 'en')).toBe('1993 – 2000');
  });
});
