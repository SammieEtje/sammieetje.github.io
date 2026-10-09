// 001:T039 Footer: live build identity, source and specs (001:FR-012)
import { expect, test } from '@playwright/test';
import { pages } from './pages.ts';

const repo = 'https://github.com/SammieEtje/sammieetje.github.io';

for (const { path, lang } of pages) {
  test(`${path}: footer links the build, the source and the specifications`, async ({ page }) => {
    await page.goto(path);
    const footer = page.locator('footer[data-spec="001:FR-012"]');
    const build = footer.getByRole('link', { name: /^Build / });
    await expect(build).toHaveText(/^Build ([0-9a-f]{7}|local)$/);
    await expect(build).toHaveAttribute('href', new RegExp(`^${repo}(/commit/[0-9a-f]{40})?$`));
    const source = lang === 'nl' ? 'Broncode' : 'Source';
    const specs = lang === 'nl' ? 'Specificaties' : 'Specifications';
    await expect(footer.getByRole('link', { name: source })).toHaveAttribute('href', repo);
    await expect(footer.getByRole('link', { name: specs })).toHaveAttribute(
      'href',
      `${repo}/tree/main/specs`,
    );
  });
}
