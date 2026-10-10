// 005:T003 README as API docs: intro, contents, endpoints, testimonial (005:FR-001 – 005:FR-005, 005:FR-011, 005:SC-001, 005:SC-002)
import { expect, test } from '@playwright/test';
import { endpoints } from '../../src/site/readme.ts';

test.describe('how I lead: structure', () => {
  test('opens with title, intro and a version line', async ({ page }) => {
    await page.goto('/how-i-lead/');
    const header = page.locator('[data-spec="005:FR-002"]');
    await expect(header.getByRole('heading', { level: 1 })).toHaveText('How I lead');
    await expect(header).toContainText('this is the documentation I wish every manager published');
    await expect(header.locator('time')).toHaveAttribute('datetime', '2026-10-10');
  });

  test('the contents list every endpoint and each link lands on its section', async ({ page }) => {
    await page.goto('/how-i-lead/');
    const toc = page.getByRole('navigation', { name: 'Endpoints' });
    const links = toc.getByRole('link');
    await expect(links).toHaveCount(endpoints.length);
    for (const [i, e] of endpoints.entries()) {
      await expect(links.nth(i)).toHaveAttribute('href', `#endpoint-${e.id}`);
      await expect(links.nth(i)).toContainText(`${e.method} ${e.path}`);
    }
    await toc.getByRole('link', { name: /POST \/feedback/ }).click();
    await expect(page.locator('#endpoint-feedback')).toBeInViewport();
  });

  test('every endpoint heading writes out method, path and title', async ({ page }) => {
    await page.goto('/how-i-lead/');
    for (const e of endpoints) {
      const heading = page.locator(`#endpoint-${e.id}`).getByRole('heading', { level: 2 });
      await expect(heading.locator('.method')).toHaveText(e.method);
      await expect(heading.locator('code')).toHaveText(e.path);
      await expect(heading.locator('.title')).toHaveText(e.title.en);
    }
  });

  test('day-to-day practices are stated', async ({ page }) => {
    await page.goto('/how-i-lead/');
    await expect(page.locator('#endpoint-one-on-ones')).toContainText(
      'Monthly, one hour, structured',
    );
    await expect(page.locator('#endpoint-contact')).toContainText('I reply the same working day');
    await expect(page.locator('#endpoint-feedback')).toContainText('including in the team');
  });

  test('shows the testimonial in its original language with its author', async ({ page }) => {
    await page.goto('/how-i-lead/');
    const figure = page.locator('[data-spec="005:FR-011"]');
    await expect(figure.locator('blockquote')).toHaveAttribute('lang', 'en');
    await expect(figure.locator('blockquote')).toContainText('the Satoru Iwata of DevOps');
    await expect(figure.getByRole('link', { name: 'Chris Stapper' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/chrisstapper',
    );
  });
});

// 005:T005 Known issues and error handling (005:FR-007, 005:FR-008)
test.describe('how I lead: known issues and mistakes', () => {
  test('known issues are description and workaround pairs', async ({ page }) => {
    await page.goto('/how-i-lead/');
    const issues = page.locator('#endpoint-known-issues [data-spec="005:FR-007"] .issue');
    await expect(issues).toHaveCount(2);
    await expect(issues.nth(0).locator('dd').first()).toHaveText(
      "I'm direct and can come across as blunt.",
    );
    await expect(issues.nth(0).locator('dd').last()).toHaveText(
      "Tell me when it lands wrong; I'd rather know.",
    );
    await expect(issues.nth(1).locator('dd').last()).toHaveText(
      "Show me the purpose, and I'm on board.",
    );
  });

  test('error handling links to the "room to fail safely" assumption', async ({ page }) => {
    await page.goto('/how-i-lead/');
    const link = page.locator('#endpoint-errors a[data-spec="005:FR-008"]');
    await expect(link).toHaveAttribute('href', '/method/#assumption-2');
    await link.click();
    await expect(page.locator('#assumption-2')).toContainText(
      'Learning requires room to fail safely',
    );
    await expect(page.locator('#assumption-2')).toBeInViewport();
  });
});

// 005:T007 Contact, findability and Dutch (005:FR-009, 005:FR-010, 005:SC-005)
test.describe('how I lead: contact, findability, Dutch', () => {
  test('ends with a LinkedIn call to action', async ({ page }) => {
    await page.goto('/how-i-lead/');
    const cta = page.locator('[data-spec="005:FR-009"]');
    await expect(cta).toContainText('Want to work together?');
    await expect(cta.getByRole('link', { name: 'Message me on LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/sanderettema/',
    );
    const isLast = await cta.evaluate(
      (el) => el === el.closest('main')!.querySelector(':scope > *')!.lastElementChild,
    );
    expect(isLast).toBe(true);
  });

  test('the navigation lists API docs, current on this page', async ({ page }) => {
    await page.goto('/how-i-lead/');
    const item = page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: /API docs/ });
    await expect(item).toContainText('how I lead');
    await expect(item).toHaveAttribute('aria-current', 'page');
    await page.goto('/nl/zo-leid-ik/');
    const nl = page
      .getByRole('navigation', { name: 'Hoofdmenu' })
      .getByRole('link', { name: /API-docs/ });
    await expect(nl).toContainText('zo leid ik');
  });

  for (const [home, label, target] of [
    ['/', 'How I lead', '/how-i-lead/'],
    ['/nl/', 'Zo leid ik', '/nl/zo-leid-ik/'],
  ] as const) {
    test(`${home}: the identity card links to the README`, async ({ page }) => {
      await page.goto(home);
      const link = page.locator('[data-spec="001:FR-001"]').getByRole('link', { name: label });
      await expect(link).toHaveAttribute('href', target);
      await expect(link).toHaveAttribute('data-spec', '005:FR-010');
    });
  }

  test('the language switch maps /how-i-lead/ to /nl/zo-leid-ik/ and back', async ({ page }) => {
    await page.goto('/how-i-lead/');
    await page
      .getByRole('navigation', { name: 'Language' })
      .getByRole('link', { name: 'Nederlands' })
      .click();
    await expect(page).toHaveURL(/\/nl\/zo-leid-ik\/$/);
    await page
      .getByRole('navigation', { name: 'Taal' })
      .getByRole('link', { name: 'English' })
      .click();
    await expect(page).toHaveURL(/\/how-i-lead\/$/);
  });

  test('the Dutch page is in Dutch, the quote stays English', async ({ page }) => {
    await page.goto('/nl/zo-leid-ik/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Zo leid ik');
    await expect(page.locator('#endpoint-feedback .title')).toHaveText('Feedback');
    await expect(page.locator('#endpoint-one-on-ones')).toContainText('Maandelijks, een uur');
    await expect(page.locator('[data-spec="005:FR-011"] blockquote')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#endpoint-errors a')).toHaveAttribute(
      'href',
      '/nl/methode/#assumption-2',
    );
  });
});
