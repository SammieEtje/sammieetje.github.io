// 006:T003 TechDocs: pillars, articles, links out, series (006:FR-001 – 006:FR-006, 006:SC-001, 006:SC-002)
import { expect, test } from '@playwright/test';
import { articles, articlesFor, pillars } from '../../src/site/articles.ts';

test.describe('TechDocs', () => {
  test('shows the four pillars with their introductions', async ({ page }) => {
    await page.goto('/writing/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('TechDocs');
    const sections = page.locator('section[data-spec="006:FR-002"]');
    await expect(sections).toHaveCount(4);
    for (const [i, p] of pillars.entries()) {
      await expect(sections.nth(i)).toHaveAttribute('id', `pillar-${p.id}`);
      await expect(sections.nth(i).getByRole('heading', { level: 2 })).toHaveText(p.name.en);
      await expect(sections.nth(i)).toContainText(p.intro.en);
    }
  });

  test('lists every article once, newest first within its pillar', async ({ page }) => {
    await page.goto('/writing/');
    const all = page.locator('[data-article]');
    await expect(all).toHaveCount(articles.length);
    for (const p of pillars) {
      const ids = await page
        .locator(`#pillar-${p.id} [data-article]`)
        .evaluateAll((els) => els.map((el) => el.getAttribute('data-article')));
      expect(ids).toEqual(articlesFor(p.id).map((a) => a.id));
    }
  });

  test('each article shows date, reading time and excerpt, and links to LinkedIn', async ({
    page,
  }) => {
    await page.goto('/writing/');
    const card = page.locator('[data-article="golden-cage"]');
    await expect(card.locator('time')).toHaveAttribute('datetime', '2026-03-24');
    await expect(card.locator('time')).toHaveText('24 March 2026');
    await expect(card).toContainText('6 min read');
    await expect(card).toContainText(
      'A golden path becomes a golden cage the moment choice disappears.',
    );
    const link = card.getByRole('link', {
      name: /Why your golden path became a golden cage.*on LinkedIn/,
    });
    await expect(link).toHaveAttribute(
      'href',
      'https://www.linkedin.com/pulse/why-your-golden-path-became-cage-sander-ettema-r938e',
    );
    await expect(link).toHaveAttribute('lang', 'en');
    await expect(page.locator('[data-article="elite-sports"] time')).toHaveText('9 March 2026');
  });

  test('a pillar without articles says one is coming', async ({ page }) => {
    await page.goto('/writing/');
    const regulated = page.locator('#pillar-regulated');
    await expect(regulated.locator('[data-article]')).toHaveCount(0);
    await expect(regulated.locator('.soon')).toHaveText(
      'An article on this theme is in the works.',
    );
  });

  test('series articles show the series name and part', async ({ page }) => {
    await page.goto('/writing/');
    await expect(
      page.locator('[data-article="shipped-platform"] [data-spec="006:FR-006"]'),
    ).toHaveText('Running the platform as a product · part 1 of 5');
    await expect(page.locator('[data-spec="006:FR-006"]')).toHaveCount(5);
  });
});

// 006:T005 Findability, Dutch and method cross-links (006:FR-004, 006:FR-008, 006:FR-009)
test.describe('TechDocs: findability, Dutch, cross-links', () => {
  test('the navigation lists TechDocs, current on its page', async ({ page }) => {
    await page.goto('/writing/');
    const item = page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: /TechDocs/ });
    await expect(item).toContainText('what I write');
    await expect(item).toHaveAttribute('aria-current', 'page');
  });

  test('the language switch maps /writing/ to /nl/schrijven/ and back', async ({ page }) => {
    await page.goto('/writing/');
    await page
      .getByRole('navigation', { name: 'Language' })
      .getByRole('link', { name: 'Nederlands' })
      .click();
    await expect(page).toHaveURL(/\/nl\/schrijven\/$/);
    await page
      .getByRole('navigation', { name: 'Taal' })
      .getByRole('link', { name: 'English' })
      .click();
    await expect(page).toHaveURL(/\/writing\/$/);
  });

  test('the Dutch page has Dutch pillars, excerpts and dates, and English titles', async ({
    page,
  }) => {
    await page.goto('/nl/schrijven/');
    await expect(page.locator('#pillar-people h2')).toHaveText('Het verkeerde mensbeeld');
    const card = page.locator('[data-article="golden-cage"]');
    await expect(card.locator('time')).toHaveText('24 maart 2026');
    await expect(card).toContainText('6 min lezen');
    await expect(card).toContainText('Een golden path wordt een gouden kooi');
    const link = card.getByRole('link', {
      name: /Why your golden path became a golden cage.*op LinkedIn/,
    });
    await expect(link).toHaveAttribute('lang', 'en');
    await expect(
      page.locator('[data-article="shipped-platform"] [data-spec="006:FR-006"]'),
    ).toHaveText('Het platform runnen als product · deel 1 van 5');
  });

  test('the method page offers four further-reading links', async ({ page }) => {
    await page.goto('/method/');
    const expected: [string, string][] = [
      ['004:FR-002', 'elite-sports'],
      ['004:FR-004', 'golden-cage'],
      ['004:FR-005', 'people-lazy'],
      ['004:FR-006', 'community'],
    ];
    const further = page.locator('[data-spec="006:FR-009"]');
    await expect(further).toHaveCount(4);
    for (const [section, id] of expected) {
      const article = articles.find((a) => a.id === id)!;
      const link = page.locator(`[data-spec="${section}"] [data-spec="006:FR-009"] a`);
      await expect(link).toHaveAttribute('href', article.url);
      await expect(link).toContainText(article.title);
    }
  });
});
