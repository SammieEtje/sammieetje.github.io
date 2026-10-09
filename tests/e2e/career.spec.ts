// 003:T005 Release log (003:FR-001 – 003:FR-004, 003:FR-006)
import { expect, test } from '@playwright/test';
import { releases } from '../../src/site/career.ts';

const roles = releases.filter((r) => r.kind === 'role');
const log = (page: import('@playwright/test').Page) => page.locator('[data-spec="003:FR-001"]');

test.describe('deployment history (English)', () => {
  test('lists nine releases newest first, then education', async ({ page }) => {
    await page.goto('/career/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Deployment history');
    const items = log(page).locator(':scope > li');
    await expect(items).toHaveCount(10);
    const ids = await items.evaluateAll((els) => els.map((el) => el.getAttribute('data-release')));
    expect(ids).toEqual(releases.map((r) => r.id));
  });

  test('each release shows label, period, title, organisation, location and summary', async ({
    page,
  }) => {
    await page.goto('/career/');
    const first = log(page).locator('li[data-release="rabo-da"]');
    await expect(first.locator('[data-spec="003:FR-003"]')).toContainText('v2016.10');
    await expect(first.getByRole('heading', { level: 2 })).toHaveText(
      'Manager Development Automation',
    );
    await expect(first).toContainText('Rabobank · Utrecht · Oct 2016 – Aug 2020');
    await expect(first.locator('time').first()).toHaveAttribute('datetime', '2016-10');
    await expect(first).toContainText('10,000 voluntary users in an IT organisation of 7,600');
  });

  test('marks exactly one release, the newest, as latest and current', async ({ page }) => {
    await page.goto('/career/');
    const latest = page.locator('[data-spec="003:FR-004"]');
    await expect(latest).toHaveCount(1);
    await expect(latest).toHaveText('latest');
    await expect(log(page).locator(':scope > li').first()).toContainText('May 2026 – present');
  });

  test('shows education last and distinct from roles', async ({ page }) => {
    await page.goto('/career/');
    const education = log(page).locator(':scope > li').last();
    await expect(education).toHaveAttribute('data-spec', '003:FR-006');
    await expect(education).toContainText('University of Twente');
    await expect(education).toContainText('education');
    await expect(education.locator('details')).toHaveCount(0);
  });
});

// 003:T006 Release notes open in place, by keyboard, without scripting (003:FR-005)
test.describe('release notes', () => {
  test('are closed by default and open and close with the keyboard', async ({ page }) => {
    await page.goto('/career/');
    const details = page.locator('li[data-release="rabo-linux"] details[data-spec="003:FR-005"]');
    await expect(details).not.toHaveAttribute('open');
    const toggle = details.locator('summary');
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(details).toHaveAttribute('open');
    await expect(details).toContainText('5× growth delivered with a 15% smaller team');
    await expect(details.getByRole('heading', { level: 3 })).toHaveText([
      'Context',
      'Approach',
      'Result',
    ]);
    await page.keyboard.press('Enter');
    await expect(details).not.toHaveAttribute('open');
  });

  test('every toggle has a unique accessible name', async ({ page }) => {
    await page.goto('/career/');
    const names = await page
      .locator('details[data-spec="003:FR-005"] > summary')
      .evaluateAll((els) => els.map((el) => el.textContent?.replace(/\s+/g, ' ').trim()));
    expect(names).toHaveLength(roles.length);
    expect(new Set(names).size).toBe(names.length);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('release notes still open', async ({ page }) => {
    await page.goto('/career/');
    const details = page.locator('li[data-release="tennet-dap"] details');
    await details.locator('summary').click();
    await expect(details).toHaveAttribute('open');
    await expect(details).toContainText('In progress. This release is still being written.');
  });
});

// 003:T008 The pattern: legend and tags (003:FR-007, 003:SC-003)
test.describe('the pattern', () => {
  test('a legend names and explains the four phases', async ({ page }) => {
    await page.goto('/career/');
    const legend = page.locator('[data-spec="003:FR-007"]');
    await expect(legend.getByRole('heading', { level: 2 })).toHaveText('The pattern');
    await expect(legend.locator('dt')).toHaveText([
      'Consolidate',
      'Stabilise',
      'Design the environment',
      'Grow the community',
    ]);
    await expect(legend.locator('dd')).toHaveCount(4);
  });

  test('every role is tagged with phases named in the legend', async ({ page }) => {
    await page.goto('/career/');
    const names = await page.locator('[data-spec="003:FR-007"] dt').allTextContents();
    const roleItems = page.locator('[data-spec="003:FR-001"] > li[data-spec="003:FR-002"]');
    await expect(roleItems).toHaveCount(9);
    for (const item of await roleItems.all()) {
      const tags = await item
        .getByRole('list', { name: 'Pattern' })
        .locator('li')
        .allTextContents();
      expect(tags.length).toBeGreaterThan(0);
      for (const tag of tags) expect(names).toContain(tag.trim());
    }
  });
});

// 003:T010 Dutch page, navigation, home link (003:FR-008, 003:FR-009, 003:SC-002)
test.describe('findability and Dutch', () => {
  test('the navigation lists the history with term and subtitle, current on its page', async ({
    page,
  }) => {
    await page.goto('/career/');
    const item = page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: /Deployment history/ });
    await expect(item).toContainText('my career');
    await expect(item).toHaveAttribute('aria-current', 'page');
    await page.goto('/nl/');
    const nl = page
      .getByRole('navigation', { name: 'Hoofdmenu' })
      .getByRole('link', { name: /Releasegeschiedenis/ });
    await expect(nl).toContainText('mijn loopbaan');
    await expect(nl).toHaveAttribute('href', '/nl/loopbaan/');
  });

  for (const [home, label, target] of [
    ['/', 'Full deployment history', '/career/'],
    ['/nl/', 'Volledige releasegeschiedenis', '/nl/loopbaan/'],
  ] as const) {
    test(`${home}: the Key numbers card links to the history`, async ({ page }) => {
      await page.goto(home);
      const link = page.locator('[data-spec="002:FR-004"]').getByRole('link', { name: label });
      await expect(link).toHaveAttribute('data-spec', '003:FR-009');
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${target}$`));
    });
  }

  test('the language switch maps /career/ to /nl/loopbaan/ and back', async ({ page }) => {
    await page.goto('/career/');
    await page
      .getByRole('navigation', { name: 'Language' })
      .getByRole('link', { name: 'Nederlands' })
      .click();
    await expect(page).toHaveURL(/\/nl\/loopbaan\/$/);
    await page
      .getByRole('navigation', { name: 'Taal' })
      .getByRole('link', { name: 'English' })
      .click();
    await expect(page).toHaveURL(/\/career\/$/);
  });

  test('the Dutch page shows the same releases in Dutch', async ({ page }) => {
    await page.goto('/nl/loopbaan/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Releasegeschiedenis');
    await expect(page.locator('[data-spec="003:FR-001"] > li')).toHaveCount(10);
    const da = page.locator('li[data-release="rabo-da"]');
    await expect(da).toContainText('Rabobank · Utrecht · okt 2016 – aug 2020');
    await expect(da).toContainText('10.000 vrijwillige gebruikers');
    await expect(page.locator('[data-spec="003:FR-004"]')).toHaveText('actueel');
    await expect(page.locator('li[data-release="tennet-dap"]')).toContainText('mei 2026 – heden');
    await expect(page.locator('[data-spec="003:FR-007"] dt').first()).toHaveText('Consolideren');
  });
});

// 003:T016 Regression: the timeline dot belongs to releases, not to the tags inside them (003:FR-007)
test('pattern tags carry no timeline decoration', async ({ page }) => {
  await page.goto('/career/');
  const content = await page
    .locator('[data-spec="003:FR-001"] ul.patterns > li')
    .first()
    .evaluate((el) => getComputedStyle(el, '::before').content);
  expect(content).toBe('none');
});
