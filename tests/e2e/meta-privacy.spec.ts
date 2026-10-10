// 001:T024 Page metadata and privacy guarantees (001:FR-006, 001:FR-009, 001:FR-013, 001:SC-008)
import { gzipSync } from 'node:zlib';
import { expect, test } from '@playwright/test';
import { routes } from '../../src/site/routes.ts';
import { routeMeta } from '../../src/site/meta.ts';
import { pages } from './pages.ts';

for (const route of routes) {
  for (const locale of ['en', 'nl'] as const) {
    const meta = routeMeta(route, locale);
    const path = route.paths[locale];

    test(`${path} declares title, description, canonical, alternates and social tags`, async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(meta.title);
      const head = page.locator('head');
      await expect(head.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        meta.description,
      );
      await expect(head.locator('link[rel="canonical"]')).toHaveAttribute('href', meta.canonical);
      for (const alt of meta.alternates) {
        await expect(
          head.locator(`link[rel="alternate"][hreflang="${alt.hreflang}"]`),
        ).toHaveAttribute('href', alt.href);
      }
      await expect(head.locator('meta[property="og:title"]')).toHaveAttribute(
        'content',
        meta.title,
      );
      await expect(head.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
      await expect(head.locator('meta[property="og:url"]')).toHaveAttribute(
        'content',
        meta.canonical,
      );
      await expect(head.locator('meta[property="og:locale"]')).toHaveAttribute(
        'content',
        meta.og.locale,
      );
    });
  }
}

// 008:T005 Scripts only where a spec allows them: the playground (008:FR-008)
// 009:T008 and the scorecard (009:FR-009)
const scriptPages = ['/playground/', '/nl/speeltuin/', '/scorecard/', '/nl/scorecard/'];

for (const { path } of pages) {
  test(`${path} ships only allowed scripts, stays on its own origin and sets no cookies`, async ({
    page,
    context,
    baseURL,
  }) => {
    const foreign: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (!['data:', 'blob:'].includes(url.protocol) && url.origin !== baseURL) {
        foreign.push(request.url());
      }
    });
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    expect(foreign).toEqual([]);
    if (scriptPages.includes(path)) {
      const scripts = page.locator('script');
      await expect(scripts).toHaveCount(1);
      await expect(scripts).toHaveAttribute('type', 'module');
      // Lighthouse only counts external script files; measure inline code against the
      // constitution's budget (V: at most 50 KB compressed per page) here.
      const inline = (await scripts.allTextContents()).join('');
      expect(gzipSync(inline).length).toBeLessThanOrEqual(50 * 1024);
    } else {
      await expect(page.locator('script')).toHaveCount(0);
    }
    expect(await context.cookies()).toEqual([]);
  });
}
