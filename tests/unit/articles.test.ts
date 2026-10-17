// 006:T001 Article data invariants (006:FR-002 – 006:FR-007, 006:SC-001, 006:SC-004)
// 013:T005 Rules that hold for any correct data, so a new article never fails on a count (013:FR-018)
import { describe, expect, it } from 'vitest';
import { locales } from '../../src/i18n/ui.ts';
import {
  articles,
  articlesFor,
  pillars,
  series,
  seriesLabel,
  titleLang,
  type Article,
} from '../../src/site/articles.ts';

describe('pillars', () => {
  it('are the four content pillars, in order, named and introduced per language', () => {
    expect(pillars.map((p) => p.id)).toEqual(['people', 'environment', 'regulated', 'community']);
    for (const p of pillars) {
      for (const locale of locales) {
        expect(p.name[locale].trim()).not.toBe('');
        expect(p.intro[locale].trim()).not.toBe('');
      }
    }
  });
});

describe('articles', () => {
  it('include the ten articles published before the pipeline, each with a unique id', () => {
    expect(articles.length).toBeGreaterThanOrEqual(10);
    expect(new Set(articles.map((a) => a.id)).size).toBe(articles.length);
    expect(articles.find((a) => a.id === 'elite-sports')?.published).toBe('2026-03-09');
  });

  it('list a pillar newest first', () => {
    for (const p of pillars) {
      const dates = articlesFor(p.id).map((a) => a.published);
      expect(dates).toEqual([...dates].sort().reverse());
    }
  });

  it('form series without gaps: 1..total when complete, 1..n while running', () => {
    for (const id of Object.keys(series) as (keyof typeof series)[]) {
      const parts = articles.filter((a) => a.series?.id === id).map((a) => a.series!);
      const numbers = parts.map((p) => p.part).sort((a, b) => a - b);
      expect(numbers, id).toEqual(numbers.map((_, i) => i + 1));
      const totals = new Set(parts.map((p) => p.total));
      expect(totals.size, `${id}: one total for all parts`).toBeLessThanOrEqual(1);
      const [total] = [...totals];
      if (total !== undefined) expect(numbers.length, id).toBe(total);
    }
    expect(series['platform-as-product'].name.en).toBe('Running the platform as a product');
  });
});

// 013:T006 Title language and series label (013:FR-027, 013:FR-028)
const fixture = (over: Partial<Article>): Article => ({
  id: 'fixture',
  title: 'Fixture',
  url: 'https://www.linkedin.com/pulse/fixture',
  published: '2026-10-13',
  minutes: 4,
  pillar: 'regulated',
  excerpt: { en: 'Summary.', nl: 'Samenvatting.' },
  ...over,
});

describe('titleLang()', () => {
  it('is English unless the article says otherwise (FR-028)', () => {
    expect(titleLang(fixture({}))).toBe('en');
    expect(titleLang(fixture({ lang: 'nl' }))).toBe('nl');
  });
});

describe('seriesLabel()', () => {
  it('shows part n of total for a complete series', () => {
    const a = fixture({ series: { id: 'platform-as-product', part: 1, total: 5 } });
    expect(seriesLabel(a, 'en')).toBe('Running the platform as a product · part 1 of 5');
    expect(seriesLabel(a, 'nl')).toBe('Het platform runnen als product · deel 1 van 5');
  });

  it('shows part n without a total while the series runs (FR-027)', () => {
    const a = fixture({ series: { id: 'platform-as-product', part: 2 } });
    expect(seriesLabel(a, 'en')).toBe('Running the platform as a product · part 2');
    expect(seriesLabel(a, 'nl')).toBe('Het platform runnen als product · deel 2');
  });

  it('is empty for an article outside a series', () => {
    expect(seriesLabel(fixture({}), 'en')).toBe('');
  });
});
