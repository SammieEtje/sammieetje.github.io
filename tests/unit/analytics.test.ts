// 017:T002 Where and when the site counts (017:FR-004, 017:FR-005, 017:FR-006)
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  articleClickUrl,
  endpoint,
  pageViewUrl,
  productionHost,
  shouldCount,
} from '../../src/site/analytics.ts';
import { siteUrl } from '../../src/site/meta.ts';

describe('analytics config', () => {
  it('reports to the one GoatCounter host named in the repository', () => {
    expect(endpoint).toBe('https://sammieetje.goatcounter.com/count');
  });

  it('counts only on the host the site is built for', () => {
    expect(productionHost).toBe('sammieetje.github.io');
    expect(productionHost).toBe(new URL(siteUrl).hostname);
    expect(readFileSync('astro.config.mjs', 'utf8')).toContain(`site: 'https://${productionHost}'`);
  });
});

describe('shouldCount()', () => {
  const live = { hostname: 'sammieetje.github.io', gpc: undefined, dnt: null };

  it('counts a visit to the live site', () => {
    expect(shouldCount(live)).toBe(true);
    expect(shouldCount({ ...live, gpc: false, dnt: '0' })).toBe(true);
  });

  it('never counts local development, previews, tests or other hosts', () => {
    for (const hostname of ['localhost', '127.0.0.1', 'example.com', 'sammieetje.github.io.evil']) {
      expect(shouldCount({ ...live, hostname }), hostname).toBe(false);
    }
  });

  it('respects Global Privacy Control and Do Not Track', () => {
    expect(shouldCount({ ...live, gpc: true })).toBe(false);
    expect(shouldCount({ ...live, dnt: '1' })).toBe(false);
  });
});

// 017:T004 What a page view and an article click send (017:FR-001, 017:FR-007, 017:FR-013)
const params = (url: string) => {
  const u = new URL(url);
  expect(`${u.origin}${u.pathname}`).toBe(endpoint);
  return Object.fromEntries(u.searchParams);
};

describe('pageViewUrl()', () => {
  const view = {
    pathname: '/writing/',
    referrer: 'https://www.linkedin.com/',
    title: 'Writing · Sander Ettema',
    width: 1280,
    ownOrigin: 'https://sammieetje.github.io',
  };

  it('sends path, referrer, title, screen width and a cache-buster, nothing else', () => {
    const { rnd, ...rest } = params(pageViewUrl(view));
    expect(rest).toEqual({
      p: '/writing/',
      r: 'https://www.linkedin.com/',
      t: 'Writing · Sander Ettema',
      s: '1280',
    });
    expect(rnd).toMatch(/^[a-z0-9]+$/);
  });

  it('drops a referrer from the site itself', () => {
    expect(params(pageViewUrl({ ...view, referrer: 'https://sammieetje.github.io/nl/' })).r).toBe(
      '',
    );
    expect(params(pageViewUrl({ ...view, referrer: '' })).r).toBe('');
  });

  it('never sends a query string or fragment', () => {
    const sent = params(
      pageViewUrl({
        ...view,
        pathname: '/writing/?utm_source=x#top',
        referrer: 'https://www.google.com/search?q=sander#x',
      }),
    );
    expect(sent.p).toBe('/writing/');
    expect(sent.r).toBe('https://www.google.com/search');
    expect(sent).not.toHaveProperty('q');
    expect(sent).not.toHaveProperty('ns');
  });
});

describe('articleClickUrl()', () => {
  it('sends the article as an event, nothing else', () => {
    const { rnd, ...rest } = params(
      articleClickUrl({ id: 'golden-cage', title: 'The golden cage' }),
    );
    expect(rest).toEqual({ p: 'golden-cage', t: 'The golden cage', e: 'true' });
    expect(rnd).toMatch(/^[a-z0-9]+$/);
  });
});
