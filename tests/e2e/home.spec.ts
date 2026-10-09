// 001:T022 Home identity block (001:FR-001)
import { expect, test } from '@playwright/test';

test.describe('English home page', () => {
  test('introduces Sander with role line, headline and LinkedIn link', async ({ page }) => {
    await page.goto('/');
    const identity = page.locator('[data-spec="001:FR-001"]');
    await expect(identity.getByRole('heading', { level: 1 })).toHaveText('Sander Ettema');
    await expect(identity).toContainText('Manager Data & Analytics Platform at TenneT');
    await expect(identity).toContainText('Platform transformation in highly regulated contexts');
    await expect(identity).toContainText(
      'People take the path of least resistance. I build environments where the right thing is the easy thing — together.',
    );
    const linkedin = identity.getByRole('link', { name: /LinkedIn/ });
    await expect(linkedin).toHaveAttribute('href', 'https://www.linkedin.com/in/sanderettema/');
  });
});
