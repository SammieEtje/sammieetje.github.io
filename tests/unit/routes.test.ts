// 001:T008 Route registry, counterparts and navigation (001:FR-004, 001:FR-007, 001:FR-008)
import { describe, expect, it } from 'vitest';
import { locales } from '../../src/i18n/ui.ts';
import { counterpartPath, navItems, routes } from '../../src/site/routes.ts';

describe('route registry', () => {
  it('has unique ids', () => {
    const ids = routes.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every route a path in every locale, Dutch under /nl/', () => {
    for (const route of routes) {
      for (const locale of locales) {
        expect(route.paths[locale], `${route.id}.${locale}`).toMatch(/^\/.*\/$|^\/$/);
      }
      expect(route.paths.nl.startsWith('/nl/')).toBe(true);
      expect(route.paths.en.startsWith('/nl/')).toBe(false);
    }
  });

  it('starts with the overview at / and /nl/', () => {
    expect(routes[0]).toMatchObject({ id: 'overview', paths: { en: '/', nl: '/nl/' } });
  });
});

describe('counterpartPath()', () => {
  it('maps a page to the same page in the other language', () => {
    expect(counterpartPath('/', 'nl')).toBe('/nl/');
    expect(counterpartPath('/nl/', 'en')).toBe('/');
  });

  it('tolerates a missing trailing slash', () => {
    expect(counterpartPath('/nl', 'en')).toBe('/');
  });

  it('falls back to the home page of the target language for unknown paths', () => {
    expect(counterpartPath('/does-not-exist/', 'nl')).toBe('/nl/');
  });
});

describe('navItems()', () => {
  it('lists only registry routes that are navigation sections', () => {
    const items = navItems('en', '/');
    const navRoutes = routes.filter((r) => r.nav);
    expect(items.map((i) => i.href)).toEqual(navRoutes.map((r) => r.paths.en));
  });

  it('gives each item a portal term and a plain subtitle in the page language', () => {
    const [en] = navItems('en', '/');
    const [nl] = navItems('nl', '/nl/');
    expect(en).toMatchObject({ term: 'Overview', subtitle: 'who I am' });
    expect(nl).toMatchObject({ term: 'Overzicht', subtitle: 'wie ik ben' });
  });

  it('marks the current page', () => {
    expect(navItems('en', '/')[0]?.current).toBe(true);
    expect(navItems('en', '/elsewhere/')[0]?.current).toBe(false);
  });
});
