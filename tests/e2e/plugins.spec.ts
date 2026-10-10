// 007:T003 Plugins page: introduction, cards, spec-driven markers (007:FR-001 – 007:FR-005, 007:SC-002)
import { expect, test } from '@playwright/test';
import { projects } from '../../src/site/projects.ts';

test.describe('Plugins', () => {
  test('opens with the clarified framing', async ({ page }) => {
    await page.goto('/plugins/');
    const header = page.locator('[data-spec="007:FR-002"]');
    await expect(header.getByRole('heading', { level: 1 })).toHaveText('Plugins');
    await expect(header.locator('.intro')).toContainText(
      "I'm technically curious, not technically deep.",
    );
  });

  test('shows one complete card per selected project, in order', async ({ page }) => {
    await page.goto('/plugins/');
    const cards = page.locator('[data-project]');
    await expect(cards).toHaveCount(3);
    for (const [i, p] of projects.entries()) {
      const card = cards.nth(i);
      await expect(card).toHaveAttribute('data-project', p.id);
      await expect(card.getByRole('heading', { level: 2 })).toHaveText(p.name);
      await expect(card.locator('.purpose')).toHaveText(p.purpose.en);
      await expect(card.locator('.demonstrates')).toHaveText(p.demonstrates.en);
      await expect(card.locator('.tech li')).toHaveText(p.tech);
      await expect(card.locator('.lifecycle')).toHaveText(p.lifecycle);
      await expect(card.locator('.since')).toContainText(String(p.since));
      await expect(card.getByRole('link', { name: /Repository/ })).toHaveAttribute('href', p.repo);
      await expect(card.locator('img')).toHaveCount(0);
    }
  });

  test('this site says you are looking at it', async ({ page }) => {
    await page.goto('/plugins/');
    await expect(page.locator('[data-project="profile-site"] .self')).toHaveText(
      "You're looking at it.",
    );
  });

  test('spec-driven projects link to their specifications', async ({ page }) => {
    await page.goto('/plugins/');
    const markers = page.locator('[data-spec="007:FR-004"]');
    await expect(markers).toHaveCount(2);
    for (const p of projects.filter((x) => x.specs)) {
      await expect(
        page.locator(`[data-project="${p.id}"] [data-spec="007:FR-004"] a`),
      ).toHaveAttribute('href', p.specs!);
    }
    await expect(page.locator('[data-project="mypool"] [data-spec="007:FR-004"]')).toHaveCount(0);
  });
});

// 007:T005 Findability and Dutch (007:FR-006)
test.describe('Plugins: findability and Dutch', () => {
  test('the navigation lists Plugins, current on its page', async ({ page }) => {
    await page.goto('/plugins/');
    const item = page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: /Plugins/ });
    await expect(item).toContainText('what I build');
    await expect(item).toHaveAttribute('aria-current', 'page');
  });

  test('the language switch maps /plugins/ to /nl/projecten/ and back', async ({ page }) => {
    await page.goto('/plugins/');
    await page
      .getByRole('navigation', { name: 'Language' })
      .getByRole('link', { name: 'Nederlands' })
      .click();
    await expect(page).toHaveURL(/\/nl\/projecten\/$/);
    await page
      .getByRole('navigation', { name: 'Taal' })
      .getByRole('link', { name: 'English' })
      .click();
    await expect(page).toHaveURL(/\/plugins\/$/);
  });

  test('the Dutch page is in Dutch', async ({ page }) => {
    await page.goto('/nl/projecten/');
    await expect(page.locator('.intro')).toContainText('Ik ben technisch nieuwsgierig');
    await expect(page.locator('[data-project="mypool"] .purpose')).toContainText('Formule 1-poule');
    await expect(page.locator('[data-project="profile-site"] .self')).toHaveText(
      'Je kijkt ernaar.',
    );
  });
});
