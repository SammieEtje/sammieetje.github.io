// 001:T036 Bilingual not-found page (001:FR-011)
import { expect, test } from '@playwright/test';

test('the not-found page explains the problem in both languages and links to both homes', async ({
  page,
}) => {
  await page.goto('/404.html');
  const content = page.locator('[data-spec="001:FR-011"]');
  const en = content.locator('[lang="en"]');
  const nl = content.locator('[lang="nl"]');
  await expect(en.getByRole('heading')).toHaveText('Page not found');
  await expect(nl.getByRole('heading')).toHaveText('Pagina niet gevonden');
  await expect(en.getByRole('link', { name: 'Go to the English home page' })).toHaveAttribute(
    'href',
    '/',
  );
  await expect(nl.getByRole('link', { name: 'Naar de Nederlandse startpagina' })).toHaveAttribute(
    'href',
    '/nl/',
  );
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
});

test('an unknown address shows the not-found page', async ({ page }) => {
  const response = await page.goto('/does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('[data-spec="001:FR-011"]')).toBeVisible();
});
