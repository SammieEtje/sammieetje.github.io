// 017:T006 Counting on the live site, proven without counting (017:FR-001, 017:FR-007, 017:FR-013)
import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { articles } from '../../src/site/articles.ts';
import { endpoint } from '../../src/site/analytics.ts';
import { pages } from './pages.ts';
import { htmlFiles, live, serveLive, settle } from './production.ts';

const pageViews = (counts: Record<string, string>[]) => counts.filter((c) => c['e'] !== 'true');
const events = (counts: Record<string, string>[]) => counts.filter((c) => c['e'] === 'true');

test.describe('page views on the live site', () => {
  for (const { path } of pages) {
    test(`${path} sends exactly one page view with its path`, async ({ page, context }) => {
      const traffic = await serveLive(context);
      await page.goto(`${live}${path}`);
      await settle(page);
      const views = pageViews(traffic.counts);
      expect(views).toHaveLength(1);
      expect(views[0]?.['p']).toBe(path);
    });
  }

  test('a query string and fragment are never sent', async ({ page, context }) => {
    const traffic = await serveLive(context);
    await page.goto(`${live}/writing/?utm_source=x#top`);
    await settle(page);
    const [view] = pageViews(traffic.counts);
    expect(view?.['p']).toBe('/writing/');
    expect(view).not.toHaveProperty('q');
  });

  test('the 404 page counts the missing path', async ({ page, context }) => {
    const traffic = await serveLive(context);
    const response = await page.goto(`${live}/no-such-page/`);
    expect(response?.status()).toBe(404);
    await settle(page);
    expect(pageViews(traffic.counts).map((v) => v['p'])).toEqual(['/no-such-page/']);
  });
});

test.describe('article clicks', () => {
  for (const path of ['/writing/', '/nl/schrijven/']) {
    test(`${path}: a click on an article link sends one event and opens the article`, async ({
      page,
      context,
    }) => {
      const traffic = await serveLive(context, {
        allow: (url) => url.hostname.endsWith('linkedin.com'),
      });
      await page.goto(`${live}${path}`);
      await settle(page);
      const link = page.locator('a[data-count-article]').first();
      const id = await link.getAttribute('data-count-article');
      const article = articles.find((a) => a.id === id)!;
      await Promise.all([page.waitForURL(article.url), link.click()]);
      await expect
        .poll(() => events(traffic.counts))
        .toEqual([expect.objectContaining({ p: article.id, t: article.title, e: 'true' })]);
    });
  }

  test('a click on any other outgoing link sends no event', async ({ page, context }) => {
    const traffic = await serveLive(context, { allow: (url) => url.hostname === 'github.com' });
    await page.goto(`${live}/writing/`);
    await settle(page);
    const other = page.locator('a[href^="https://github.com"]:not([data-count-article])').first();
    await Promise.all([page.waitForURL(/github\.com/), other.click()]);
    await settle(page);
    expect(events(traffic.counts)).toEqual([]);
  });
});

// 017:T010 Counted, not tracked (017:FR-003, 017:FR-004, 017:FR-006, 017:FR-008)
const optOuts = {
  'Global Privacy Control': () =>
    Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true }),
  'Do Not Track': () =>
    Object.defineProperty(Navigator.prototype, 'doNotTrack', { get: () => '1' }),
};

const outline = (page: import('@playwright/test').Page) =>
  page.evaluate(() => ({
    headings: [...document.querySelectorAll('h1, h2, h3')].map((h) => h.textContent?.trim()),
    links: [...document.querySelectorAll('a')].map((a) => a.getAttribute('href')),
  }));

test.describe('visitors are counted, not tracked', () => {
  for (const { path } of pages) {
    test(`${path} contacts only the site and the one analytics host`, async ({ page, context }) => {
      const traffic = await serveLive(context);
      await page.goto(`${live}${path}`);
      await settle(page);
      expect(traffic.foreign).toEqual([]);
    });
  }

  for (const [signal, optOut] of Object.entries(optOuts)) {
    test(`with ${signal}, nothing is sent, not even for an article click`, async ({
      page,
      context,
    }) => {
      await context.addInitScript(optOut);
      const traffic = await serveLive(context, {
        allow: (url) => url.hostname.endsWith('linkedin.com'),
      });
      for (const { path } of pages) {
        await page.goto(`${live}${path}`);
        await settle(page);
      }
      await page.goto(`${live}/writing/`);
      await Promise.all([
        page.waitForURL(/linkedin\.com/),
        page.locator('a[data-count-article]').first().click(),
      ]);
      await settle(page);
      expect(traffic.counts).toEqual([]);
    });
  }

  test('no cookies and nothing stored in the browser, after every page and an article click', async ({
    page,
    context,
  }) => {
    await serveLive(context, { allow: (url) => url.hostname.endsWith('linkedin.com') });
    for (const { path } of pages) {
      await page.goto(`${live}${path}`);
      await settle(page);
    }
    await page.goto(`${live}/writing/`);
    await settle(page);
    const stored = await page.evaluate(async () => ({
      local: localStorage.length,
      session: sessionStorage.length,
      databases: (await indexedDB.databases()).length,
    }));
    expect(stored).toEqual({ local: 0, session: 0, databases: 0 });
    await Promise.all([
      page.waitForURL(/linkedin\.com/),
      page.locator('a[data-count-article]').first().click(),
    ]);
    expect(await context.cookies()).toEqual([]);
  });

  test('a blocked analytics host changes nothing on the page', async ({ browser }) => {
    const answered = await browser.newContext();
    await serveLive(answered);
    const reference = await answered.newPage();
    await reference.goto(`${live}/writing/`);
    await settle(reference);

    const blocked = await browser.newContext();
    const traffic = await serveLive(blocked, {
      analytics: 'abort',
      allow: (url) => url.hostname.endsWith('linkedin.com'),
    });
    const page = await blocked.newPage();
    await page.goto(`${live}/writing/`);
    await settle(page);
    expect(traffic.counts).toHaveLength(1);
    expect(await outline(page)).toEqual(await outline(reference));
    await Promise.all([
      page.waitForURL(/linkedin\.com/),
      page.locator('a[data-count-article]').first().click(),
    ]);
    await answered.close();
    await blocked.close();
  });

  test('without JavaScript the page is the same and sends nothing', async ({ browser }) => {
    const withJs = await browser.newContext();
    await serveLive(withJs);
    const reference = await withJs.newPage();
    await reference.goto(`${live}/writing/`);
    await settle(reference);

    const noJs = await browser.newContext({ javaScriptEnabled: false });
    const traffic = await serveLive(noJs);
    const page = await noJs.newPage();
    await page.goto(`${live}/writing/`);
    await settle(page);
    expect(traffic.counts).toEqual([]);
    expect(await outline(page)).toEqual(await outline(reference));
    await withJs.close();
    await noJs.close();
  });
});

// 017:T013 The host is reached only through the bundled script: no pixel, preconnect or vendor script (017:FR-005)
// The privacy page names the host in its text, so a visitor knows what to block; that is allowed.
test('built pages load the analytics host only through the inline script', () => {
  const host = new URL(endpoint).host;
  const attribute = /\b(?:src|href|srcset|action|data)\s*=\s*["']?([^"'\s>]+)/gi;
  for (const file of htmlFiles('dist')) {
    const html = readFileSync(file, 'utf8');
    const outside = html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
    const urls = [...outside.matchAll(attribute)].map(([, url]) => url ?? '');
    expect(
      urls.filter((url) => url.includes(host)),
      file,
    ).toEqual([]);
    expect(html.includes('gc.zgo.at'), file).toBe(false);
  }
});
