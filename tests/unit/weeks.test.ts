// 013:T001 ISO weeks, the Tuesday slot and today in Amsterdam (013:FR-020, 013:FR-005)
import { describe, expect, it } from 'vitest';
import { addWeeks, isoWeek, slotOf, todayIn, weeksBetween } from '../../src/site/weeks.ts';

describe('isoWeek()', () => {
  it('numbers weeks the ISO way', () => {
    expect(isoWeek('2026-10-16')).toBe('2026-W42');
    expect(isoWeek('2026-06-02')).toBe('2026-W23');
    expect(isoWeek('2026-03-09')).toBe('2026-W11');
  });

  it('handles the year boundary', () => {
    expect(isoWeek('2026-12-31')).toBe('2026-W53');
    expect(isoWeek('2027-01-03')).toBe('2026-W53');
    expect(isoWeek('2027-01-04')).toBe('2027-W01');
    expect(isoWeek('2025-12-29')).toBe('2026-W01');
  });
});

describe('slotOf()', () => {
  it('is the Tuesday of the week', () => {
    expect(slotOf('2026-W44')).toBe('2026-10-27');
    expect(slotOf('2026-W43')).toBe('2026-10-20');
    expect(slotOf('2026-W01')).toBe('2025-12-30');
  });
});

describe('todayIn()', () => {
  it('gives the calendar date in Amsterdam, not in UTC', () => {
    expect(todayIn('Europe/Amsterdam', new Date('2026-10-16T22:30:00Z'))).toBe('2026-10-17');
    expect(todayIn('Europe/Amsterdam', new Date('2026-10-16T21:30:00Z'))).toBe('2026-10-16');
    expect(todayIn('Europe/Amsterdam', new Date('2026-12-31T23:30:00Z'))).toBe('2027-01-01');
  });
});

describe('weeksBetween() and addWeeks()', () => {
  it('count and step whole weeks, across years', () => {
    expect(weeksBetween('2026-W23', '2026-W42')).toBe(19);
    expect(weeksBetween('2026-W52', '2027-W02')).toBe(3);
    expect(addWeeks('2026-W42', 8)).toBe('2026-W50');
    expect(addWeeks('2026-W52', 2)).toBe('2027-W01');
  });
});
