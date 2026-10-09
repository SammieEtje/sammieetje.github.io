// 001:T009 Page metadata (001:FR-006, 001:FR-009)
import { describe, expect, it } from 'vitest';
import { locales } from '../../src/i18n/ui.ts';
import { routes } from '../../src/site/routes.ts';
import { routeMeta, siteUrl } from '../../src/site/meta.ts';

const all = routes.flatMap((route) => locales.map((locale) => routeMeta(route, locale)));

describe('routeMeta()', () => {
  it('gives every page a unique title that names the site owner', () => {
    const titles = all.map((m) => m.title);
    expect(new Set(titles).size).toBe(titles.length);
    for (const title of titles) expect(title).toContain('Sander Ettema');
  });

  it('gives every page a description of 50 to 160 characters', () => {
    for (const { description } of all) {
      expect(description.length).toBeGreaterThanOrEqual(50);
      expect(description.length).toBeLessThanOrEqual(160);
    }
  });

  it('sets an absolute canonical URL for the page itself', () => {
    const overview = routes[0]!;
    expect(routeMeta(overview, 'en').canonical).toBe(`${siteUrl}/`);
    expect(routeMeta(overview, 'nl').canonical).toBe(`${siteUrl}/nl/`);
  });

  it('lists both languages plus x-default (English) as alternates', () => {
    const meta = routeMeta(routes[0]!, 'nl');
    expect(meta.alternates).toEqual([
      { hreflang: 'en', href: `${siteUrl}/` },
      { hreflang: 'nl', href: `${siteUrl}/nl/` },
      { hreflang: 'x-default', href: `${siteUrl}/` },
    ]);
  });

  it('fills the social sharing fields in the page language', () => {
    const meta = routeMeta(routes[0]!, 'nl');
    expect(meta.og).toEqual({
      title: meta.title,
      description: meta.description,
      type: 'website',
      url: `${siteUrl}/nl/`,
      locale: 'nl_NL',
      localeAlternate: ['en_GB'],
    });
  });
});

// 002:T018 Sharing image per language (002:FR-010)
describe('routeMeta() sharing image', () => {
  it('points every page to the 1200 × 630 card in its own language', () => {
    expect(routeMeta(routes[0]!, 'en').image).toEqual({
      url: `${siteUrl}/og/en.png`,
      width: 1200,
      height: 630,
      alt: 'Sharing card with a portrait of Sander Ettema and his headline',
    });
    expect(routeMeta(routes[0]!, 'nl').image).toMatchObject({
      url: `${siteUrl}/og/nl.png`,
      alt: 'Deelkaart met een portret van Sander Ettema en zijn kernboodschap',
    });
  });
});
