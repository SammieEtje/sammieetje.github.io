// 013:T022 No planning data, drafts or local paths in what the site is built from (013:FR-001, 013:SC-005)
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { articles } from '../../src/site/articles.ts';

const TEXT = /\.(?:ts|astro|md|mdx|json|css|txt|xml|svg|html)$/;
const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const path = join(dir, e.name);
    if (e.isDirectory()) return files(path);
    return TEXT.test(e.name) ? [path] : [];
  });

const PLANNING = [
  /\btarget_week\b/,
  /^\s*status:\s*(?:idea|draft|ready)\b/m,
  /\blinkedin_url:/,
  /\/Users\/|~\/Documents/,
];

describe('the site sources', () => {
  it('hold no planning fields, draft statuses or local paths', () => {
    const hits = ['src', 'public'].flatMap(files).flatMap((file) => {
      const text = readFileSync(file, 'utf8');
      return PLANNING.filter((re) => re.test(text)).map((re) => `${file}: ${re}`);
    });
    expect(hits).toEqual([]);
  });

  it('publish articles with only the public article fields', () => {
    const allowed = [
      'id',
      'title',
      'url',
      'published',
      'minutes',
      'pillar',
      'series',
      'excerpt',
      'lang',
    ];
    for (const a of articles) {
      expect(
        Object.keys(a).filter((k) => !allowed.includes(k)),
        a.id,
      ).toEqual([]);
    }
  });
});
