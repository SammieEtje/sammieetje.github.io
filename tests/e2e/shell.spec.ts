// 001:T023 Portal shell and small-screen layout (001:FR-002, 001:FR-004, 001:SC-001)
import { expect, test } from '@playwright/test';

test.describe('portal shell', () => {
  test('has banner, primary navigation, one main region and a footer', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(page.locator('[data-spec="001:FR-002"]')).not.toHaveCount(0);
  });

  test('navigation shows portal term and plain subtitle, and marks the current page', async ({
    page,
  }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav).toHaveAttribute('data-spec', '001:FR-004');
    const overview = nav.getByRole('link', { name: /Overview/ });
    await expect(overview).toContainText('who I am');
    await expect(overview).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('on a 360 px wide screen', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('name, headline and LinkedIn link are visible without scrolling', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
    await expect(page.getByText('People take the path of least resistance.')).toBeInViewport();
    // 002:T017 Scoped to the identity card: the Links card adds a second LinkedIn link.
    await expect(
      page.locator('[data-spec="001:FR-001"]').getByRole('link', { name: /LinkedIn/ }),
    ).toBeInViewport();
  });

  test('does not scroll horizontally', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

// 004:T013 Regression: on a phone every navigation item is fully visible, none hidden off-screen (001:FR-004)
test.describe('navigation on a 320 px screen', () => {
  test.use({ viewport: { width: 320, height: 740 } });

  for (const path of ['/', '/nl/']) {
    test(`${path}: every item is within the viewport`, async ({ page }) => {
      await page.goto(path);
      const links = page.locator('[data-spec="001:FR-004"] a');
      expect(await links.count()).toBeGreaterThanOrEqual(3);
      for (const link of await links.all()) {
        const box = (await link.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(320);
      }
    });
  }
});
