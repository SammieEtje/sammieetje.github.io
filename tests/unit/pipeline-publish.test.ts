// 013:T015 Verifying and registering a published article (013:FR-003, 013:FR-006 – 013:FR-009, 013:FR-014)
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readNotes } from '../../scripts/pipeline/notes.ts';
import { markPublished, verify } from '../../scripts/pipeline/publish.ts';
import type { Article } from '../../src/site/articles.ts';

let vault: string;
const URL_A = 'https://www.linkedin.com/pulse/fixture-article-a-sander-ettema-abc12';

const site: Article[] = [
  {
    id: 'fixture-old',
    title: 'Fixture old',
    url: 'https://www.linkedin.com/pulse/fixture-old',
    published: '2026-06-02',
    minutes: 5,
    pillar: 'people',
    excerpt: { en: 'Old.', nl: 'Oud.' },
  },
];

const write = (name: string, frontmatter: string, heading: string) =>
  writeFileSync(
    join(vault, name),
    `---\ntype: article\nplatform: LinkedIn\n${frontmatter}\n---\n\n# ${heading}\n\nText.\n`,
  );

beforeEach(() => {
  vault = mkdtempSync(join(tmpdir(), 'vault-'));
  write(
    'a.md',
    'status: ready\npilaar: P3 - Gereguleerd én Snel\nreeks: Fixture series\ndeel: 1\ntaal: NL\nwords: 864\ntarget_week: 2026-W43',
    'Deel 1: Fixture article A',
  );
  write(
    'draft.md',
    'status: draft\npilaar: P1\nwords: 700\ntarget_week: 2026-W44',
    'Fixture draft',
  );
  write('bare.md', 'status: ready\ntarget_week: 2026-W43', 'Fixture bare');
  write('old.md', 'status: ingepland\npilaar: P1\nwords: 1000', 'Week 11, Post 1 — Fixture old');
});
afterEach(() => {
  rmSync(vault, { recursive: true, force: true });
});

const notes = () => readNotes(vault);

describe('verify()', () => {
  it('derives the site record from a ready note (FR-006, FR-009)', () => {
    const r = verify(notes(), 'Fixture article A', { date: '2026-10-20', url: URL_A }, site);
    expect(r).toEqual({
      ok: true,
      note: expect.objectContaining({ title: 'Fixture article A' }),
      record: {
        title: 'Fixture article A',
        url: URL_A,
        published: '2026-10-20',
        pillar: 'regulated',
        minutes: 4,
        lang: 'nl',
        series: { name: 'Fixture series', id: 'fixture-series', part: 1 },
      },
    });
  });

  it('finds a note by title, case-insensitively, or by file name', () => {
    for (const key of ['fixture article a', 'a.md', 'a']) {
      expect(verify(notes(), key, { date: '2026-10-20', url: URL_A }, site).ok, key).toBe(true);
    }
    expect(verify(notes(), 'nothing', { date: '2026-10-20', url: URL_A }, site)).toEqual({
      ok: false,
      problems: ['no LinkedIn note matches "nothing"'],
    });
  });

  it('refuses a date outside the planned week (FR-014)', () => {
    expect(verify(notes(), 'a', { date: '2026-10-28', url: URL_A }, site)).toEqual({
      ok: false,
      problems: [
        '"Fixture article A": published 2026-10-28 is not in planned week 2026-W43 (2026-10-20)',
      ],
    });
  });

  it('refuses a note that is not ready (FR-003)', () => {
    const r = verify(notes(), 'Fixture draft', { date: '2026-10-27', url: URL_A }, site);
    expect(r).toEqual({ ok: false, problems: ['"Fixture draft": status is draft, not ready'] });
  });

  it('refuses a malformed URL, a URL already on the site, and a missing pillar or word count', () => {
    expect(
      verify(notes(), 'a', { date: '2026-10-20', url: 'https://www.linkedin.com/posts/x' }, site),
    ).toEqual({
      ok: false,
      problems: [
        '"Fixture article A": not a LinkedIn Article URL: https://www.linkedin.com/posts/x',
      ],
    });
    expect(verify(notes(), 'a', { date: '2026-10-20', url: site[0]!.url }, site)).toEqual({
      ok: false,
      problems: ['"Fixture article A": URL is already on the site as fixture-old'],
    });
    expect(verify(notes(), 'bare', { date: '2026-10-20', url: URL_A }, site)).toEqual({
      ok: false,
      problems: ['"Fixture bare": no pilaar', '"Fixture bare": no words'],
    });
  });

  it('skips the status and week checks for an unplanned article', () => {
    const r = verify(
      notes(),
      'Fixture draft',
      { date: '2026-10-21', url: URL_A, mode: 'unplanned' },
      site,
    );
    expect(r.ok).toBe(true);
  });

  it('accepts a backfill only for a URL already on the site with the same date', () => {
    const old = { url: site[0]!.url, mode: 'backfill' as const };
    expect(verify(notes(), 'Fixture old', { ...old, date: '2026-06-02' }, site).ok).toBe(true);
    expect(verify(notes(), 'Fixture old', { ...old, date: '2026-06-03' }, site)).toEqual({
      ok: false,
      problems: ['"Fixture old": the site has this URL on 2026-06-02, not 2026-06-03'],
    });
    expect(
      verify(notes(), 'Fixture old', { date: '2026-06-02', url: URL_A, mode: 'backfill' }, site),
    ).toEqual({ ok: false, problems: ['"Fixture old": URL is not on the site'] });
  });
});

describe('markPublished()', () => {
  it('sets status, date and URL in the note and nothing else (FR-008)', () => {
    const before = readFileSync(join(vault, 'a.md'), 'utf8');
    const r = markPublished(notes(), 'a', { date: '2026-10-20', url: URL_A }, site);
    expect(r.ok).toBe(true);
    const after = readFileSync(join(vault, 'a.md'), 'utf8');
    expect(after).toBe(
      before
        .replace('status: ready', 'status: published')
        .replace(
          'target_week: 2026-W43',
          `target_week: 2026-W43\npublish_date: 2026-10-20\nlinkedin_url: ${URL_A}`,
        ),
    );
  });

  it('changes nothing when verify fails', () => {
    const before = readFileSync(join(vault, 'draft.md'), 'utf8');
    expect(
      markPublished(notes(), 'Fixture draft', { date: '2026-10-27', url: URL_A }, site).ok,
    ).toBe(false);
    expect(readFileSync(join(vault, 'draft.md'), 'utf8')).toBe(before);
  });

  it('sets the target week to the week of the date for unplanned and backfilled articles', () => {
    markPublished(
      notes(),
      'Fixture old',
      { date: '2026-06-02', url: site[0]!.url, mode: 'backfill' },
      site,
    );
    const [old] = notes().filter((n) => n.title === 'Fixture old');
    expect(old).toMatchObject({
      status: 'published',
      publishDate: '2026-06-02',
      linkedinUrl: site[0]!.url,
      targetWeek: '2026-W23',
    });
  });
});
