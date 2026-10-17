// 013:T002 Reading and writing the planning in vault notes (013:FR-001, 013:FR-002)
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readNotes, writeFrontmatter } from '../../scripts/pipeline/notes.ts';

let vault: string;

const note = (path: string, frontmatter: string, body: string) => {
  const file = join(vault, path);
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, `---\n${frontmatter}\n---\n\n${body}\n`);
  return file;
};

beforeEach(() => {
  vault = mkdtempSync(join(tmpdir(), 'vault-'));
});
afterEach(() => {
  rmSync(vault, { recursive: true, force: true });
});

describe('readNotes()', () => {
  it('reads LinkedIn articles and leaves posts, indexes, archive and analytics out', () => {
    note(
      'Week 20 - Post 1 - A.md',
      'type: article\nstatus: ready\nplatform: LinkedIn\npilaar: P1\nwords: 900',
      '# Week 20, Post 1 — Fixture article A',
    );
    note(
      'series/Deel 2 - B.md',
      'type: content\nstatus: draft\nplatform: linkedin\npilaar: P3 - Gereguleerd én Snel',
      '# Deel 2: Fixture article B',
    );
    note('Short.md', 'type: post\nstatus: draft\nplatform: LinkedIn', '# A short post');
    note('index.md', 'type: index\nstatus: active', '# Index');
    note('archive/Old.md', 'type: article\nstatus: draft\nplatform: LinkedIn', '# Old');
    note('analytics/Export.md', 'type: article\nplatform: LinkedIn', '# Export');
    note('Substack.md', 'type: article\nstatus: draft\nplatform: Substack', '# Elsewhere');

    const notes = readNotes(vault);
    expect(notes.map((n) => n.title).sort()).toEqual(['Fixture article A', 'Fixture article B']);
  });

  it('maps pillars, series, language and words', () => {
    note(
      'B.md',
      'type: article\nstatus: draft\nplatform: LinkedIn\npilaar: P3 - Gereguleerd én Snel\nreeks: Fixture series\ndeel: 2\ntaal: NL\nwords: 830\ntarget_week: 2026-W44',
      '# Deel 2: Fixture article B',
    );
    const [b] = readNotes(vault);
    expect(b).toMatchObject({
      title: 'Fixture article B',
      pillar: 'regulated',
      series: { name: 'Fixture series', id: 'fixture-series', part: 2 },
      lang: 'nl',
      words: 830,
      targetWeek: '2026-W44',
      status: 'draft',
    });
    for (const [pilaar, pillar] of [
      ['P1', 'people'],
      ['P2', 'environment'],
      ['P4', 'community'],
    ]) {
      rmSync(join(vault, 'B.md'));
      note('B.md', `type: article\nplatform: LinkedIn\npilaar: ${pilaar}`, '# B');
      expect(readNotes(vault)[0]?.pillar).toBe(pillar);
    }
  });

  it('strips the vault prefixes from titles', () => {
    note('1.md', 'type: article\nplatform: LinkedIn', '# Week 3, Post 1 — Title one');
    note('2.md', 'type: article\nplatform: LinkedIn', '# Deel 1 (alternatief): Title two');
    note('3.md', 'type: article\nplatform: LinkedIn', '# Bonus: Title three');
    note('4.md', 'type: artikel\nplatform: LinkedIn', '# Draft — Title four');
    note('5.md', 'type: article\nplatform: LinkedIn', '# Title five');
    expect(
      readNotes(vault)
        .map((n) => n.title)
        .sort(),
    ).toEqual(['Title five', 'Title four', 'Title one', 'Title three', 'Title two']);
  });

  it('treats a missing status as draft, maps the Dutch statuses and reports unknown ones', () => {
    note('a.md', 'type: article\nplatform: LinkedIn', '# A');
    note('b.md', 'type: article\nplatform: LinkedIn\nstatus: gepubliceerd', '# B');
    note('c.md', 'type: article\nplatform: LinkedIn\nstatus: ingepland', '# C');
    note('d.md', 'type: article\nplatform: LinkedIn\nstatus: scheduled', '# D');
    note('e.md', 'type: article\nplatform: LinkedIn\nstatus: geparkeerd', '# E');
    note('f.md', 'type: article\nplatform: LinkedIn\nstatus: basis', '# F');
    const by = Object.fromEntries(readNotes(vault).map((n) => [n.title, n]));
    expect(by.A?.status).toBe('draft');
    expect(by.B?.status).toBe('published');
    expect(by.C?.status).toBe('ready');
    expect(by.D?.status).toBe('ready');
    expect(by.E?.status).toBe('withdrawn');
    expect(by.F?.status).toBe('unknown');
    expect(by.F?.problems).toContain('unknown status "basis"');
  });

  it('reads dates whether or not they are quoted, and ignores empty ones', () => {
    note('a.md', "type: article\nplatform: LinkedIn\npublish_date: '2026-05-13'", '# A');
    note('b.md', 'type: article\nplatform: LinkedIn\npublish_date: 2026-04-14', '# B');
    note('c.md', "type: article\nplatform: LinkedIn\npublish_date: ''", '# C');
    const by = Object.fromEntries(readNotes(vault).map((n) => [n.title, n]));
    expect(by.A?.publishDate).toBe('2026-05-13');
    expect(by.B?.publishDate).toBe('2026-04-14');
    expect(by.C?.publishDate).toBeUndefined();
  });

  it('keeps only the date of a publish_date with a time, and reports one that is no date', () => {
    note('a.md', "type: article\nplatform: LinkedIn\npublish_date: '2026-05-13 08:00'", '# A');
    note('b.md', 'type: article\nplatform: LinkedIn\npublish_date: next week', '# B');
    const by = Object.fromEntries(readNotes(vault).map((n) => [n.title, n]));
    expect(by.A?.publishDate).toBe('2026-05-13');
    expect(by.B?.publishDate).toBeUndefined();
    expect(by.B?.problems).toEqual(['publish_date "next week" is not a date']);
  });

  it('reads notes that start with a byte order mark, and keeps the mark when writing', () => {
    const file = join(vault, 'bom.md');
    writeFileSync(
      file,
      '﻿---\ntype: article\nstatus: ready\nplatform: LinkedIn\n---\n\n# Fixture BOM\n',
    );
    expect(readNotes(vault)[0]).toMatchObject({ title: 'Fixture BOM', status: 'ready' });
    writeFrontmatter(file, { status: 'published' });
    const after = readFileSync(file, 'utf8');
    expect(after.startsWith('﻿---\n')).toBe(true);
    expect(readNotes(vault)[0]?.status).toBe('published');
  });

  it('reports a LinkedIn note whose frontmatter is not valid YAML instead of failing', () => {
    note(
      'broken.md',
      "type: content\nstatus: ingepland\nplatform: LinkedIn\npublish_date: '2026-05-13",
      '# Week 9, Post 1 — Fixture broken',
    );
    const [broken] = readNotes(vault);
    expect(broken).toMatchObject({ title: 'Fixture broken', status: 'unknown' });
    expect(broken?.problems).toEqual(['frontmatter is not valid YAML']);
  });
});

describe('writeFrontmatter()', () => {
  it('changes only the given keys and keeps everything else byte for byte', () => {
    const frontmatter = [
      'date: 2026-10-13',
      'tags:',
      '  - personal-brand',
      '  - content',
      'type: article',
      'status: ready # checked',
      "publish_date: ''",
      'description: "Keeps — its dash and quotes"',
      'platform: LinkedIn',
    ].join('\n');
    const body = '# Title\n\nBody text that must not change.\n\n---\n\nmore: text';
    const file = note('a.md', frontmatter, body);
    const before = readFileSync(file, 'utf8');

    writeFrontmatter(file, {
      status: 'published',
      publish_date: '2026-10-20',
      linkedin_url: 'https://www.linkedin.com/pulse/fixture-article-a',
    });

    const after = readFileSync(file, 'utf8');
    expect(after).toContain('status: published');
    expect(after).toContain('publish_date: 2026-10-20');
    expect(after).toContain('linkedin_url: https://www.linkedin.com/pulse/fixture-article-a');
    expect(after).toContain('description: "Keeps — its dash and quotes"');
    expect(after).toContain('tags:\n  - personal-brand\n  - content\n');
    expect(after.slice(after.indexOf('\n---\n', 4))).toBe(
      before.slice(before.indexOf('\n---\n', 4)),
    );
    const [a] = readNotes(vault);
    expect(a).toMatchObject({ status: 'published', publishDate: '2026-10-20' });
  });
});
