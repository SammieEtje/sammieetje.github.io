// 017:T015 Visitors can read what is measured (017:FR-010, 017:FR-011, 017:SC-006)
import { expect, test } from '@playwright/test';
import { pages } from './pages.ts';

const statement = {
  en: {
    path: '/privacy/',
    counterpart: '/nl/privacy/',
    terms: [
      'GoatCounter',
      'Finland',
      'Germany',
      'eight hours',
      'IP addresses',
      'cookies',
      'Global Privacy Control',
      'Do Not Track',
    ],
  },
  nl: {
    path: '/nl/privacy/',
    counterpart: '/privacy/',
    terms: [
      'GoatCounter',
      'Finland',
      'Duitsland',
      'acht uur',
      'IP-adressen',
      'cookies',
      'Global Privacy Control',
      'Do Not Track',
    ],
  },
} as const;

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const [lang, { path, counterpart, terms }] of Object.entries(statement)) {
    test(`${path} says what is measured, by whom, where, for how long and how to opt out`, async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      const text = page.locator('[data-spec="017:FR-010"]');
      await expect(text).toHaveCount(1);
      for (const term of terms) await expect(text).toContainText(term);
      await expect(page.locator(`a[href="${counterpart}"][hreflang]`)).toHaveCount(1);
    });
  }
});

for (const { path, lang } of pages) {
  test(`${path}: footer links to the privacy page in its own language`, async ({ page }) => {
    await page.goto(path);
    const link = page.locator('footer[data-spec="001:FR-012"] a[data-spec="017:FR-011"]');
    await expect(link).toHaveText('Privacy');
    await expect(link).toHaveAttribute('href', statement[lang].path);
  });
}
