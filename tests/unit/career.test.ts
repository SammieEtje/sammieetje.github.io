// 003:T002 Career data invariants (003:FR-001, 003:FR-004, 003:FR-006, 003:FR-007, 003:SC-001)
import { describe, expect, it } from 'vitest';
import { locales } from '../../src/i18n/ui.ts';
import { releases } from '../../src/site/career.ts';
import { patterns } from '../../src/site/patterns.ts';

const roles = releases.filter((r) => r.kind === 'role');

describe('releases', () => {
  it('holds the nine clarified role releases and education last', () => {
    expect(roles.map((r) => r.id)).toEqual([
      'tennet-dap',
      'tennet-iic',
      'tennet-lis',
      'tennet-lps',
      'rabo-da',
      'rabo-linux',
      'rabo-lan',
      'rabo-early',
      'nocnsf',
    ]);
    expect(releases.at(-1)).toMatchObject({ id: 'utwente', kind: 'education' });
    expect(releases).toHaveLength(10);
  });

  it('is ordered newest first, without overlapping periods', () => {
    for (let i = 1; i < releases.length; i++) {
      const newer = releases[i - 1]!;
      const older = releases[i]!;
      expect(newer.start > older.start, `${newer.id} after ${older.id}`).toBe(true);
      expect(older.end, older.id).not.toBeNull();
      expect(older.end! <= newer.start, `${older.id} ends before ${newer.id} starts`).toBe(true);
    }
  });

  it('has exactly one current role: the newest', () => {
    expect(releases.filter((r) => r.end === null).map((r) => r.id)).toEqual(['tennet-dap']);
  });

  it('tags every role with at least one known pattern phase', () => {
    const known = patterns.map((p) => p.id);
    for (const role of roles) {
      expect(role.patterns.length, role.id).toBeGreaterThan(0);
      for (const id of role.patterns) expect(known).toContain(id);
    }
  });

  it('has every text in every language', () => {
    for (const r of releases) {
      for (const locale of locales) {
        for (const text of [r.org[locale], r.title[locale], r.summary[locale]]) {
          expect(text.trim(), `${r.id}.${locale}`).not.toBe('');
        }
        if (r.kind === 'role') {
          const notes = r.notes![locale];
          for (const text of [notes.context, notes.approach, notes.result]) {
            expect(text.trim(), `${r.id}.notes.${locale}`).not.toBe('');
          }
        }
      }
    }
  });

  it('describes the current role exactly as clarified', () => {
    const current = releases[0]!;
    expect(current.summary.en).toBe(
      "Leading the team behind TenneT's Data & Analytics Platform: data and AI for the energy transition, with the least possible friction.",
    );
    expect(current.notes!.en).toEqual({
      context:
        'The energy transition makes data, analytics and AI pivotal for a grid operator. Teams across TenneT need a platform they can trust and use without waiting.',
      approach:
        'Run the platform as a product: self-service by default, security and compliance built in, and a team that works close to its users. First: a stable team and clear ownership.',
      result: 'In progress. This release is still being written.',
    });
  });
});

describe('patterns', () => {
  it('are the four phases, named and explained in every language', () => {
    expect(patterns.map((p) => p.id)).toEqual([
      'consolidate',
      'stabilise',
      'environment',
      'community',
    ]);
    for (const p of patterns) {
      for (const locale of locales) {
        expect(p.name[locale].trim()).not.toBe('');
        expect(p.explanation[locale].trim()).not.toBe('');
      }
    }
  });
});
