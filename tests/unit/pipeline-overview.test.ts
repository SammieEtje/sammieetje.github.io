// 013:T010 The private overview of the coming weeks (013:FR-002, 013:FR-004, 013:FR-005)
import { describe, expect, it } from 'vitest';
import type { Note } from '../../scripts/pipeline/notes.ts';
import { fridayReport, overview, renderOverview } from '../../scripts/pipeline/overview.ts';

const note = (title: string, over: Partial<Note> = {}): Note => ({
  file: `${title}.md`,
  title,
  status: 'draft',
  lang: 'en',
  problems: [],
  ...over,
});

const published = (title: string, date: string, over: Partial<Note> = {}) =>
  note(title, {
    status: 'published',
    publishDate: date,
    linkedinUrl: `https://www.linkedin.com/pulse/${title.toLowerCase().replace(/ /g, '-')}`,
    pillar: 'people',
    words: 900,
    ...over,
  });

const ready = (title: string, week: string, over: Partial<Note> = {}) =>
  note(title, { status: 'ready', targetWeek: week, pillar: 'regulated', words: 800, ...over });

// Friday 2026-10-16: this week's slot (Tuesday 13 October) has passed.
const FRIDAY = '2026-10-16';

describe('overview()', () => {
  it('covers the eight coming weeks, from next week once this week’s slot has passed', () => {
    const o = overview([], FRIDAY);
    expect(o.weeks.map((w) => w.week)).toEqual([
      '2026-W43',
      '2026-W44',
      '2026-W45',
      '2026-W46',
      '2026-W47',
      '2026-W48',
      '2026-W49',
      '2026-W50',
    ]);
    expect(o.weeks[0]?.tuesday).toBe('2026-10-20');
  });

  it('starts with this week while its slot is still to come, including on the Tuesday itself', () => {
    expect(overview([], '2026-10-19').weeks[0]?.week).toBe('2026-W43');
    expect(overview([], '2026-10-20').weeks[0]?.week).toBe('2026-W43');
    expect(overview([], '2026-10-21').weeks[0]?.week).toBe('2026-W44');
  });

  it('marks each week covered, planned or a gap (FR-004)', () => {
    const o = overview(
      [
        ready('Fixture A', '2026-W43'),
        note('Fixture B', { status: 'draft', targetWeek: '2026-W44', pillar: 'people' }),
      ],
      FRIDAY,
    );
    expect(o.weeks.slice(0, 3).map((w) => [w.week, w.state, w.notes.map((n) => n.title)])).toEqual([
      ['2026-W43', 'planned', ['Fixture A']],
      ['2026-W44', 'planned', ['Fixture B']],
      ['2026-W45', 'gap', []],
    ]);
  });

  it('shows a published week as covered, once, even with two articles in it', () => {
    const o = overview(
      [published('Fixture A', '2026-10-20'), published('Fixture B', '2026-10-22')],
      '2026-10-20',
    );
    expect(o.weeks[0]).toMatchObject({ week: '2026-W43', state: 'covered' });
    expect(o.weeks[1]).toMatchObject({ week: '2026-W44', state: 'gap' });
  });

  it('shows both notes and double-booked when two target the same week', () => {
    const o = overview([ready('Fixture A', '2026-W43'), ready('Fixture B', '2026-W43')], FRIDAY);
    expect(o.weeks[0]).toMatchObject({ state: 'double-booked' });
    expect(o.weeks[0]?.notes.map((n) => n.title)).toEqual(['Fixture A', 'Fixture B']);
  });

  it('counts the weeks missed since the last publication (FR-005)', () => {
    const o = overview([published('Fixture A', '2026-06-02')], FRIDAY);
    expect(o.lastPublished).toEqual({ date: '2026-06-02', week: '2026-W23' });
    expect(o.missed).toBe(19);
    expect(overview([published('Fixture A', '2026-10-13')], FRIDAY).missed).toBe(0);
  });

  it('lists pillars with nothing published and nothing planned in or after the horizon', () => {
    const o = overview(
      [
        published('Fixture A', '2026-06-02', { pillar: 'people' }),
        ready('Fixture B', '2026-W44', { pillar: 'environment' }),
        note('Fixture C', { status: 'idea', pillar: 'community' }),
      ],
      FRIDAY,
    );
    expect(o.pillarGaps).toEqual(['regulated', 'community']);
  });

  it('lists notes that need attention (FR-002)', () => {
    const o = overview(
      [
        note('Fixture unknown', { status: 'unknown', problems: ['unknown status "basis"'] }),
        note('Fixture no week', { status: 'ready', pillar: 'people', words: 800 }),
        note('Fixture no words', { status: 'ready', pillar: 'people', targetWeek: '2026-W45' }),
        note('Fixture no pillar', { status: 'ready', words: 800, targetWeek: '2026-W46' }),
        note('Fixture no url', {
          status: 'published',
          publishDate: '2026-06-02',
          pillar: 'people',
        }),
        note('Fixture no date', {
          status: 'published',
          linkedinUrl: 'https://x',
          pillar: 'people',
        }),
        ready('Fixture stale', '2026-W40'),
      ],
      FRIDAY,
    );
    expect(o.attention).toEqual([
      '"Fixture unknown": unknown status "basis"',
      '"Fixture no week": ready without target_week',
      '"Fixture no words": ready without words',
      '"Fixture no pillar": ready without pilaar',
      '"Fixture no url": published without linkedin_url',
      '"Fixture no date": published without publish_date',
      '"Fixture stale": planned for 2026-W40, which has passed',
    ]);
  });
});

describe('renderOverview()', () => {
  it('prints the weeks, the missed line, pillar gaps and attention as plain text', () => {
    const text = renderOverview(
      overview(
        [
          published('Fixture A', '2026-06-02'),
          ready('Fixture B', '2026-W43'),
          note('Fixture C', { status: 'ready', pillar: 'people', words: 800 }),
        ],
        FRIDAY,
      ),
    );
    expect(text).toContain('Pipeline on 2026-10-16 (2026-W42). Slot: Tuesday 08:00.');
    expect(text).toMatch(/2026-W43\s+2026-10-20\s+planned\s+Fixture B\s+regulated\s+ready/);
    expect(text).toMatch(/2026-W44\s+2026-10-27\s+gap\s+-/);
    expect(text).toContain('Missed: 19 weeks since the last article (2026-06-02, 2026-W23).');
    expect(text).toContain('Pillars without planned or published work: environment, community.');
    expect(text).toContain('Needs attention:\n- "Fixture C": ready without target_week');
  });

  it('says none when there is nothing to report', () => {
    const text = renderOverview(overview([published('Fixture A', '2026-10-13')], FRIDAY));
    expect(text).toContain('Missed: none.');
    expect(text).toContain('Needs attention: none.');
  });
});

// 013:T013 The buffer warning and the Friday report (013:FR-019, 013:FR-026)
describe('buffer', () => {
  it('warns below two ready articles and shows both numbers (FR-019)', () => {
    const lines = (notes: Note[]) =>
      renderOverview(overview(notes, FRIDAY))
        .split('\n')
        .filter((l) => l.startsWith('Buffer:'));
    expect(lines([])).toEqual(['Buffer: ready 0 of 2. WARNING: fewer than 2 articles are ready.']);
    expect(lines([ready('Fixture A', '2026-W43')])).toEqual([
      'Buffer: ready 1 of 2. WARNING: fewer than 2 articles are ready.',
    ]);
    expect(lines([ready('Fixture A', '2026-W43'), ready('Fixture B', '2026-W44')])).toEqual([
      'Buffer: ready 2 of 2.',
    ]);
  });

  it('keeps a missed week missed instead of moving it forward', () => {
    const o = overview(
      [published('Fixture A', '2026-10-06'), ready('Fixture B', '2026-W42')],
      FRIDAY,
    );
    expect(o.missed).toBe(1);
    expect(o.weeks[0]).toMatchObject({ week: '2026-W43', state: 'gap' });
    expect(o.attention).toEqual(['"Fixture B": planned for 2026-W42, which has passed']);
  });
});

describe('fridayReport()', () => {
  it('names next Tuesday’s ready article, with the buffer line (FR-026)', () => {
    expect(
      fridayReport([ready('Fixture A', '2026-W43'), ready('Fixture B', '2026-W44')], FRIDAY),
    ).toBe('Tuesday 2026-10-20: "Fixture A" is ready.\nBuffer: ready 2 of 2.');
  });

  it('says nothing is ready, and warns, when next Tuesday has no ready article', () => {
    expect(
      fridayReport([note('Fixture A', { status: 'draft', targetWeek: '2026-W43' })], FRIDAY),
    ).toBe(
      'Tuesday 2026-10-20: nothing is ready.\nBuffer: ready 0 of 2. WARNING: fewer than 2 articles are ready.',
    );
  });
});
