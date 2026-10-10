// 009:T007 Scorecard: renders the deployed report honestly (009:FR-006 – 009:FR-008, 009:FR-011, 009:SC-004)
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { readSpecs, shippedSpecs } from '../../src/site/specs.ts';

const sha = '0123456789abcdef0123456789abcdef01234567';
const good = { performance: 1, accessibility: 1, 'best-practices': 1, seo: 1 };
const fixture = {
  schemaVersion: 2,
  commit: sha,
  runStartedAt: '2026-10-10T16:00:00.000Z',
  generatedAt: '2026-10-10T16:06:52.000Z',
  durationSeconds: 412,
  pages: [
    { url: '/', scores: good, scriptBytes: 0 },
    { url: '/playground/', scores: { ...good, performance: 0.85 }, scriptBytes: 1229 },
  ],
  budgets: {
    performance: 0.9,
    accessibility: 0.95,
    'best-practices': 0.95,
    seo: 0.95,
    scriptBytes: 51200,
  },
  tests: { unit: 112, e2e: 270 },
  passed: false,
};

const serve = (page: Page, body: object | null) =>
  page.route('**/quality/report.json', (route) =>
    body ? route.fulfill({ json: body }) : route.fulfill({ status: 404, body: 'not found' }),
  );

test.describe('scorecard with a report', () => {
  test('shows verdict, commit and measurement time', async ({ page }) => {
    await serve(page, fixture);
    await page.goto('/scorecard/');
    const live = page.locator('[data-spec="009:FR-006"]');
    await expect(live).toBeVisible();
    await expect(live.locator('.verdict')).toContainText('One or more budgets missed');
    await expect(live.getByRole('link', { name: '0123456' })).toHaveAttribute(
      'href',
      `https://github.com/SammieEtje/sammieetje.github.io/commit/${sha}`,
    );
    await expect(live.locator('.verdict time')).toHaveAttribute('datetime', fixture.generatedAt);
  });

  test('shows the tiles: tests, duration against the target, specs shipped', async ({ page }) => {
    await serve(page, fixture);
    await page.goto('/scorecard/');
    await expect(page.locator('[data-tile="unit"] strong')).toHaveText('112');
    await expect(page.locator('[data-tile="e2e"] strong')).toHaveText('270');
    await expect(page.locator('[data-tile="duration"] strong')).toHaveText('6 min 52 s');
    await expect(page.locator('[data-tile="duration"]')).toContainText(
      'within the 10-minute target',
    );
    await expect(page.locator('[data-tile="specs"] strong')).toHaveText(
      String(shippedSpecs(readSpecs()).length),
    );
  });

  test('lists every page with each value marked against its budget in text', async ({ page }) => {
    await serve(page, fixture);
    await page.goto('/scorecard/');
    const rows = page.locator('[data-spec="009:FR-007"] tbody tr');
    await expect(rows).toHaveCount(2);
    const playground = rows.filter({ has: page.locator('th', { hasText: '/playground/' }) });
    await expect(playground.locator('td').nth(0)).toContainText('85');
    await expect(playground.locator('td').nth(0)).toContainText('over budget');
    await expect(playground.locator('td').nth(4)).toContainText('1.2 KB');
    await expect(playground.locator('td').nth(4)).toContainText('within budget');
    await expect(rows.first().locator('td').nth(1)).toContainText('within budget');
  });
});

test.describe('scorecard with the pending placeholder the build ships', () => {
  test('says that no measurement is available yet, without a console error', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto('/scorecard/');
    await expect(page.locator('[data-spec="009:FR-008"]')).toContainText(
      'No measurement available yet.',
    );
    await expect(page.locator('[data-spec="009:FR-006"]')).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('renders no empty, uncrawlable links', async ({ page }) => {
    await page.goto('/scorecard/');
    expect(await page.locator('main a:not([href])').count()).toBe(0);
  });
});

test.describe('scorecard without a report', () => {
  test('says that no measurement is available yet, with no numbers', async ({ page }) => {
    await serve(page, null);
    await page.goto('/scorecard/');
    await expect(page.locator('[data-spec="009:FR-008"]')).toContainText(
      'No measurement available yet.',
    );
    await expect(page.locator('[data-spec="009:FR-006"]')).toBeHidden();
    await expect(page.locator('[data-tile="unit"]')).toBeHidden();
  });
});

test.describe('scorecard without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('explains the measurements, shows specs shipped and links to the raw report', async ({
    page,
  }) => {
    await page.goto('/scorecard/');
    const state = page.locator('[data-spec="009:FR-008"]');
    await expect(state).toContainText("These numbers come from the pipeline's report");
    await expect(state.getByRole('link', { name: /raw report/ })).toHaveAttribute(
      'href',
      '/quality/report.json',
    );
    await expect(page.locator('[data-tile="specs"]')).toBeVisible();
    await expect(page.locator('[data-tile="unit"]')).toBeHidden();
    await expect(page.locator('[data-spec="009:FR-006"]')).toBeHidden();
  });
});

// 009:T009 Findability and Dutch (009:FR-010)
test.describe('scorecard: findability and Dutch', () => {
  test('the navigation lists the scorecard, current on its page', async ({ page }) => {
    await page.goto('/scorecard/');
    const item = page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: /Scorecard/ });
    await expect(item).toContainText("how it's measured");
    await expect(item).toHaveAttribute('aria-current', 'page');
  });

  test('the Dutch page is in Dutch, including the rendered report', async ({ page }) => {
    await serve(page, fixture);
    await page.goto('/nl/scorecard/');
    await expect(page.locator('[data-spec="009:FR-006"] .verdict')).toContainText(
      'Een of meer budgetten gemist',
    );
    await expect(page.locator('[data-tile="duration"]')).toContainText(
      'binnen het doel van 10 minuten',
    );
    await expect(page.locator('[data-spec="009:FR-007"] caption')).toHaveText(
      'Lighthouse per pagina, tegen de budgetten',
    );
  });
});

// 009:T012 Accessibility with a real report rendered: tables and scroll regions included (009:SC-005)
for (const colorScheme of ['light', 'dark'] as const) {
  for (const width of [1280, 360]) {
    test(`scorecard with a report has no WCAG 2.2 AA violations (${colorScheme}, ${width} px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme });
      await serve(page, fixture);
      await page.goto('/scorecard/');
      await expect(page.locator('[data-spec="009:FR-006"]')).toBeVisible();
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual(
        [],
      );
    });
  }
}

// 010:T006 The scorecard says what the JavaScript value counts (010:FR-005)
for (const [path, text] of [
  [
    '/scorecard/',
    'compressed size of all script a page delivers, embedded in the page and in separate files',
  ],
  [
    '/nl/scorecard/',
    'gecomprimeerde omvang van alle scripts die een pagina levert, in de pagina zelf en in aparte bestanden',
  ],
] as const) {
  test(`${path}: explains the JavaScript measure`, async ({ page }) => {
    await serve(page, fixture);
    await page.goto(path);
    await expect(page.locator('[data-spec="010:FR-005"]')).toContainText(text);
  });
}
