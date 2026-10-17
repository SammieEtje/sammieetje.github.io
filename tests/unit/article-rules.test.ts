// 013:T004 The gate catches the mistakes made by hand (013:FR-011 – 013:FR-017, 013:SC-002)
import { describe, expect, it } from 'vitest';
import { articleProblems } from '../../src/site/article-rules.ts';
import { articles, pillars, series, type Article, type Pillar } from '../../src/site/articles.ts';
import { todayIn } from '../../src/site/weeks.ts';

const today = '2026-10-16';

const fixture = (over: Partial<Article> & Record<string, unknown> = {}): Article =>
  ({
    id: 'fixture-a',
    title: 'Fixture article A',
    url: 'https://www.linkedin.com/pulse/fixture-article-a-sander-ettema-abc12',
    published: '2026-10-13',
    minutes: 4,
    pillar: 'regulated',
    excerpt: {
      en: 'A short summary of the fixture article.',
      nl: 'Een korte samenvatting van het testartikel.',
    },
    ...over,
  }) as Article;

const problems = (list: Article[], context: { pillars?: readonly Pillar[] } = {}) =>
  articleProblems(list, { today, pillars, series, ...context });

describe('articleProblems()', () => {
  it('finds nothing wrong with the published articles, as of today in Amsterdam', () => {
    const now = todayIn('Europe/Amsterdam');
    expect(articleProblems(articles, { today: now, pillars, series })).toEqual([]);
  });

  it('finds nothing wrong with a correct new article', () => {
    expect(problems([fixture(), ...articles])).toEqual([]);
  });

  it('names both articles when they share a URL or an id (FR-012)', () => {
    const a = fixture();
    const b = fixture({ id: 'fixture-b' });
    expect(problems([a, b])).toEqual(['fixture-b: duplicate URL, also used by fixture-a (FR-012)']);
    const c = fixture({ url: 'https://www.linkedin.com/pulse/other-slug' });
    expect(problems([a, c])).toEqual(['fixture-a: duplicate id (FR-012)']);
  });

  it('rejects a URL that is not a LinkedIn Article URL (FR-013)', () => {
    for (const url of [
      'https://www.linkedin.com/posts/sander-ettema_activity-123',
      'http://www.linkedin.com/pulse/fixture',
      'https://www.linkedin.com/pulse/Fixture_Article',
      'https://www.linkedin.com/pulse/fixture?trk=share',
    ]) {
      expect(problems([fixture({ url })]), url).toEqual([
        `fixture-a: not a LinkedIn Article URL: ${url} (FR-013)`,
      ]);
    }
  });

  it('rejects invalid, future and too early dates (FR-014)', () => {
    expect(problems([fixture({ published: '2026-02-30' })])).toEqual([
      'fixture-a: invalid date 2026-02-30 (FR-014)',
    ]);
    expect(problems([fixture({ published: '2026-10-17' })])).toEqual([
      'fixture-a: date 2026-10-17 is in the future (FR-014)',
    ]);
    expect(problems([fixture({ published: '2026-03-08' })])).toEqual([
      'fixture-a: date 2026-03-08 is before the first article, 2026-03-09 (FR-014)',
    ]);
    expect(problems([fixture({ published: today })])).toEqual([]);
  });

  it('names the article and language of a missing excerpt (FR-015)', () => {
    expect(problems([fixture({ excerpt: { en: 'A summary.', nl: ' ' } })])).toEqual([
      'fixture-a: excerpt missing in nl (FR-015)',
    ]);
  });

  it('names the pillar and language of a missing pillar name or intro (FR-015)', () => {
    const broken = pillars.map((p) =>
      p.id === 'regulated' ? { ...p, intro: { en: p.intro.en, nl: '' } } : p,
    );
    expect(problems([fixture()], { pillars: broken })).toEqual([
      'pillar regulated: intro missing in nl (FR-015)',
    ]);
  });

  it('rejects an excerpt of three sentences or one that breaks the style rules (FR-016)', () => {
    const long = 'One sentence here. Another one there. And a third one.';
    expect(problems([fixture({ excerpt: { en: long, nl: 'Kort.' } })])).toEqual([
      'fixture-a: excerpt in en has 3 sentences, at most 2 (FR-016)',
    ]);
    expect(
      problems([fixture({ excerpt: { en: 'Fast — and safe.', nl: 'Snel en veilig.' } })]),
    ).toEqual(['fixture-a: excerpt in en breaks style rule em-dash (FR-016)']);
  });

  it('rejects a missing or unknown pillar (FR-017)', () => {
    const withoutPillar: Partial<Article> = fixture();
    delete withoutPillar.pillar;
    expect(problems([withoutPillar as Article])).toEqual([
      'fixture-a: missing or unknown pillar undefined (FR-017)',
    ]);
    expect(problems([fixture({ pillar: 'speed' as Article['pillar'] })])).toEqual([
      'fixture-a: missing or unknown pillar speed (FR-017)',
    ]);
  });

  it('rejects an unknown series and a part beyond the total', () => {
    expect(problems([fixture({ series: { id: 'nope' as never, part: 1 } })])).toEqual([
      'fixture-a: unknown series nope (006:FR-006)',
    ]);
    expect(
      problems([fixture({ series: { id: 'platform-as-product', part: 6, total: 5 } })]),
    ).toEqual(['fixture-a: series part 6 is beyond the total 5 (006:FR-006)']);
  });

  it('rejects any field outside the article model, such as full text (FR-011)', () => {
    expect(problems([fixture({ body: 'The whole article…' })])).toEqual([
      'fixture-a: unexpected field body (FR-011)',
    ]);
  });
});
