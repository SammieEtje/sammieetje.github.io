// 006:T001 Article data invariants (006:FR-002 – 006:FR-007, 006:SC-001, 006:SC-004)
import { describe, expect, it } from 'vitest';
import { locales } from '../../src/i18n/ui.ts';
import { articles, articlesFor, pillars, series } from '../../src/site/articles.ts';

const sentences = (text: string) => text.split(/(?<=[.!?])\s+(?=[A-Z"“])/).filter(Boolean);

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

  it('leave "regulated and fast" without articles for now', () => {
    expect(articlesFor('regulated')).toEqual([]);
  });
});

describe('articles', () => {
  it('are the ten provided articles, each with a unique id and LinkedIn URL', () => {
    expect(articles).toHaveLength(10);
    expect(new Set(articles.map((a) => a.id)).size).toBe(10);
    expect(new Set(articles.map((a) => a.url)).size).toBe(10);
    for (const a of articles) {
      expect(a.url).toMatch(/^https:\/\/www\.linkedin\.com\/pulse\/[a-z0-9-]+$/);
      expect(pillars.map((p) => p.id)).toContain(a.pillar);
    }
  });

  it('carry valid dates in Dutch time and plausible reading times', () => {
    for (const a of articles) {
      expect(a.published).toMatch(/^2026-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(a.published))).toBe(false);
      expect(a.minutes).toBeGreaterThanOrEqual(1);
      expect(a.minutes).toBeLessThanOrEqual(30);
    }
    expect(articles.find((a) => a.id === 'elite-sports')?.published).toBe('2026-03-09');
  });

  it('list a pillar newest first', () => {
    for (const p of pillars) {
      const dates = articlesFor(p.id).map((a) => a.published);
      expect(dates).toEqual([...dates].sort().reverse());
    }
  });

  it('form one complete five-part series', () => {
    const parts = articles
      .filter((a) => a.series?.id === 'platform-as-product')
      .map((a) => a.series!.part)
      .sort();
    expect(parts).toEqual([1, 2, 3, 4, 5]);
    expect(series['platform-as-product'].name.en).toBe('Running the platform as a product');
  });

  it('have excerpts of at most two sentences in every language', () => {
    for (const a of articles) {
      for (const locale of locales) {
        const text = a.excerpt[locale].trim();
        expect(text, `${a.id}.${locale}`).not.toBe('');
        expect(sentences(text).length, `${a.id}.${locale}: ${text}`).toBeLessThanOrEqual(2);
      }
    }
  });
});
