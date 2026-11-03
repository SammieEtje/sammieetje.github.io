// 017:T005 Every link to an article, and only those, can be counted (017:FR-013, research R7)
// End-to-end, because only this suite runs after the build.
import { relative } from 'node:path';
import { expect, test } from '@playwright/test';
import { articles } from '../../src/site/articles.ts';
import { htmlFiles } from './production.ts';

const byUrl = new Map(articles.map((a) => [a.url, a]));

for (const file of htmlFiles('dist')) {
  const path = `/${relative('dist', file).replace(/index\.html$/, '')}`;

  test(`${path} marks exactly its article links`, async ({ page }) => {
    await page.goto(path);
    const links = await page.locator('a').evaluateAll((els) =>
      els.map((a) => ({
        href: a.getAttribute('href'),
        id: a.getAttribute('data-count-article'),
        title: a.getAttribute('data-count-title'),
      })),
    );
    for (const link of links) {
      const article = link.href ? byUrl.get(link.href) : undefined;
      expect(link, `${link.href}`).toEqual({
        href: link.href,
        id: article?.id ?? null,
        title: article?.title ?? null,
      });
    }
  });
}
