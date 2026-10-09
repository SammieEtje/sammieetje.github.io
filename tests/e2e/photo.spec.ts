// 002:T007 Profile photo: formats, sizes, alt text, no layout shift, weight (002:FR-001, 002:FR-002, 002:SC-002, 002:SC-003)
import { expect, test } from '@playwright/test';

const homes = [
  { path: '/', alt: 'Portrait of Sander Ettema' },
  { path: '/nl/', alt: 'Portret van Sander Ettema' },
];

const maxWidth = (srcset: string | null) =>
  Math.max(
    ...(srcset ?? '')
      .split(',')
      .map((c) => Number(c.trim().split(/\s+/)[1]?.replace('w', '') ?? 0)),
  );

for (const { path, alt } of homes) {
  test.describe(path, () => {
    test('shows the photo in the identity card in modern formats with a text alternative', async ({
      page,
    }) => {
      await page.goto(path);
      const picture = page.locator('[data-spec="001:FR-001"] picture[data-spec="002:FR-001"]');
      await expect(picture.locator('source[type="image/avif"]')).toHaveCount(1);
      await expect(picture.locator('source[type="image/webp"]')).toHaveCount(1);
      const img = picture.locator('img');
      await expect(img).toHaveAttribute('alt', alt);
      await expect(img).toBeVisible();
      expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    });

    test('reserves its space and offers at least twice the displayed size', async ({ page }) => {
      await page.goto(path);
      const img = page.locator('picture[data-spec="002:FR-001"] img');
      await expect(img).toHaveAttribute('width', /^\d+$/);
      await expect(img).toHaveAttribute('height', /^\d+$/);
      const displayed = await img.evaluate((el) => el.getBoundingClientRect().width);
      const srcset = await page
        .locator('picture[data-spec="002:FR-001"] source[type="image/avif"]')
        .getAttribute('srcset');
      expect(maxWidth(srcset)).toBeGreaterThanOrEqual(2 * displayed);
    });

    test('causes no layout shift', async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const shift = await page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            let total = 0;
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                total += (entry as PerformanceEntry & { value: number }).value;
              }
            }).observe({ type: 'layout-shift', buffered: true });
            setTimeout(() => resolve(total), 300);
          }),
      );
      // Sub-pixel font-swap shift from 001 is the only allowed movement (002:SC-002).
      expect(shift).toBeLessThan(0.001);
    });
  });
}

test.describe('on a high-density screen', () => {
  test.use({ deviceScaleFactor: 2 });

  test('the photo adds at most 60 KB', async ({ page }) => {
    let bytes = 0;
    page.on('response', async (response) => {
      if (response.request().resourceType() === 'image' && response.url().includes('/_astro/')) {
        bytes += (await response.body()).length;
      }
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(bytes).toBeGreaterThan(0);
    expect(bytes).toBeLessThanOrEqual(60 * 1024);
  });
});
