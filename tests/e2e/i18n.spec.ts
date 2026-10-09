// 001:T029 Language switch and Dutch interface (001:FR-007, 001:FR-008, 001:FR-009)
import { expect, test } from '@playwright/test';

test.describe('language switch', () => {
  test('switches from English to the equivalent Dutch page and back', async ({ page }) => {
    await page.goto('/');
    const switcher = page.getByRole('navigation', { name: 'Language' });
    await expect(switcher).toHaveAttribute('data-spec', '001:FR-008');
    await expect(switcher.getByRole('link', { name: 'English' })).toHaveAttribute(
      'aria-current',
      'true',
    );

    await switcher.getByRole('link', { name: 'Nederlands' }).click();
    await expect(page).toHaveURL(/\/nl\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl');

    const terug = page.getByRole('navigation', { name: 'Taal' });
    await expect(terug.getByRole('link', { name: 'Nederlands' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await terug.getByRole('link', { name: 'English' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('marks each language option with its own language', async ({ page }) => {
    await page.goto('/');
    const switcher = page.getByRole('navigation', { name: 'Language' });
    await expect(switcher.getByRole('link', { name: 'English' })).toHaveAttribute('hreflang', 'en');
    await expect(switcher.getByRole('link', { name: 'Nederlands' })).toHaveAttribute('lang', 'nl');
  });
});

test.describe('Dutch home page', () => {
  test('shows the interface and identity in Dutch', async ({ page }) => {
    await page.goto('/nl/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
    const identity = page.locator('[data-spec="001:FR-001"]');
    await expect(identity).toContainText('Manager Data & Analytics Platform bij TenneT');
    await expect(identity).toContainText('Platformtransformatie in sterk gereguleerde omgevingen');
    await expect(identity).toContainText('Mensen kiezen de weg van de minste weerstand.');
    await expect(identity.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/sanderettema/',
    );
    const nav = page.getByRole('navigation', { name: 'Hoofdmenu' });
    await expect(nav.getByRole('link', { name: /Overzicht/ })).toContainText('wie ik ben');
    await expect(page.getByRole('contentinfo')).toContainText('Spec-first gebouwd');
  });
});
