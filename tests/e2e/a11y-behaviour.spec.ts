// 001:T033 Keyboard, colour scheme, reflow and no-JavaScript behaviour (001:FR-003, 001:FR-005)
import { expect, test } from '@playwright/test';
import { pages } from './pages.ts';

for (const { path, lang } of pages) {
  test(`${path}: first Tab reveals the skip link, Enter moves focus to main`, async ({ page }) => {
    await page.goto(path);
    await page.keyboard.press('Tab');
    const skip = page.locator('[data-spec="001:FR-003"]');
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await expect(skip).toHaveText(lang === 'nl' ? 'Naar de inhoud' : 'Skip to content');
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });

  for (const width of [320, 640]) {
    test(`${path}: reflows without horizontal scrolling at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}

test.describe('colour scheme', () => {
  const background = (page: import('@playwright/test').Page) =>
    page.evaluate(() => getComputedStyle(document.body).backgroundColor);

  test('follows a light system preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    expect(await background(page)).toBe('rgb(246, 245, 242)');
  });

  test('follows a dark system preference from the first paint', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/', { waitUntil: 'commit' });
    await page.waitForSelector('body');
    expect(await background(page)).toBe('rgb(15, 17, 21)');
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('every part of the home page still works', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sander Ettema');
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    await page
      .getByRole('navigation', { name: 'Language' })
      .getByRole('link', { name: 'Nederlands' })
      .click();
    await expect(page).toHaveURL(/\/nl\/$/);
  });
});
