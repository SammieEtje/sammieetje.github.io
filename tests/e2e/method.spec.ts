// 004:T003 Premise, principle and the path diagram (004:FR-001 – 004:FR-003, 004:SC-001)
import { expect, test } from '@playwright/test';
import { releases } from '../../src/site/career.ts';
import { patterns } from '../../src/site/patterns.ts';

test.describe('method page: premise', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('opens with premise, principle and diagnosis', async ({ page }) => {
    await page.goto('/method/');
    const first = page.locator('main [data-spec="004:FR-002"]');
    await expect(first.getByRole('heading', { level: 1 })).toHaveText('Golden paths');
    await expect(first).toContainText('People take the path of least resistance.');
    await expect(first.locator('.principle')).toHaveText('Make the right thing the easy thing.');
    await expect(first).toContainText('Most transformations fail on the wrong image of people');
    const firstSection = await page.locator('main section').first().getAttribute('data-spec');
    expect(firstSection).toBe('004:FR-002');
  });

  test('shows an accessible path diagram above the fold with the principle', async ({ page }) => {
    await page.goto('/method/');
    const diagram = page.locator('[data-spec="004:FR-002"] [data-spec="004:FR-003"]');
    await expect(diagram).toHaveAttribute('role', 'img');
    await expect(page.getByRole('img', { name: /desired path/i })).toBeVisible();
    await expect(diagram.locator('desc')).toContainText(/current habit/i);
    await expect(page.locator('.principle')).toBeInViewport();
    await expect(diagram).toBeInViewport();
  });
});

// 004:T004 Levers and assumptions (004:FR-004, 004:FR-005)
test.describe('method page: levers and assumptions', () => {
  test('two levers with their instruments, and the pragmatism rule', async ({ page }) => {
    await page.goto('/method/');
    const section = page.locator('[data-spec="004:FR-004"]');
    const lower = section.locator('.lever.lower');
    const raise = section.locator('.lever.raise');
    await expect(lower.getByRole('heading')).toHaveText('Lower the resistance on the right path');
    await expect(lower.locator('li')).toHaveCount(4);
    await expect(raise.getByRole('heading')).toHaveText('Raise the resistance on the wrong path');
    await expect(raise.locator('li')).toHaveCount(3);
    await expect(section.locator('.pragmatism')).toContainText('we learn from them');
  });

  test('four assumptions in order, each with what it means in practice', async ({ page }) => {
    await page.goto('/method/');
    const items = page.locator('[data-spec="004:FR-005"] ol > li');
    await expect(items).toHaveCount(4);
    await expect(items.locator('.statement')).toHaveText([
      'Our users are skilled engineers with good intentions',
      'Learning requires room to fail safely',
      'People are inherently lazy',
      'With great freedom comes great responsibility',
    ]);
    await expect(items.nth(2).locator('.subtitle')).toHaveText(
      'Not a judgement, a design constraint: people take the path of least resistance.',
    );
    for (const item of await items.all()) {
      await expect(item.locator('.in-practice')).not.toBeEmpty();
    }
  });
});

// 004:T006 Phases with proof, release anchors, compliance (004:FR-006 – 004:FR-008, 004:SC-002)

test.describe('method page: phases and proof', () => {
  // 006:T006 Only the proof list: the community phase also carries a further-reading link
  test('each phase links to every release tagged with it', async ({ page }) => {
    await page.goto('/method/');
    const phases = page.locator('[data-spec="004:FR-006"] .phase');
    await expect(phases).toHaveCount(patterns.length);
    for (const [i, phase] of patterns.entries()) {
      const card = phases.nth(i);
      await expect(card.getByRole('heading', { level: 3 })).toHaveText(phase.name.en);
      const hrefs = await card
        .locator('.proof a')
        .evaluateAll((as) => as.map((a) => a.getAttribute('href')));
      expect(hrefs).toEqual(
        releases
          .filter((r) => r.patterns.includes(phase.id))
          .map((r) => `/career/#release-${r.id}`),
      );
    }
  });

  test('a proof link lands on that release in the deployment history', async ({ page }) => {
    await page.goto('/method/');
    await page
      .locator('[data-spec="004:FR-006"] a[href="/career/#release-rabo-da"]')
      .first()
      .click();
    await expect(page).toHaveURL(/\/career\/#release-rabo-da$/);
    const target = page.locator('#release-rabo-da');
    await expect(target).toHaveAttribute('data-release', 'rabo-da');
    await expect(target).toBeInViewport();
    expect(await target.evaluate((el) => el.matches(':target'))).toBe(true);
  });

  test('every release in the history has a stable anchor', async ({ page }) => {
    await page.goto('/career/');
    const ids = await page
      .locator('[data-spec="003:FR-001"] > li')
      .evaluateAll((els) => els.map((el) => el.id));
    expect(ids).toEqual(releases.map((r) => `release-${r.id}`));
  });

  test('compliance is explained as a four-step platform property', async ({ page }) => {
    await page.goto('/method/');
    const section = page.locator('[data-spec="004:FR-008"]');
    await expect(section.getByRole('heading', { level: 2 })).toHaveText('Compliance, built in');
    await expect(section.locator('ol > li')).toHaveCount(4);
  });
});

// 004:T008 The science as dependencies, without statistics (004:FR-009, 004:SC-003)
test.describe('method page: dependencies', () => {
  test('lists six models with manifest id, name, authors and takeaway', async ({ page }) => {
    await page.goto('/method/');
    const section = page.locator('[data-spec="004:FR-009"]');
    await expect(section.getByRole('heading', { level: 2 })).toHaveText('Dependencies');
    const items = section.locator('ul > li');
    await expect(items).toHaveCount(6);
    await expect(items.first().locator('code')).toHaveText('kahneman/dual-process@2011');
    for (const item of await items.all()) {
      await expect(item.locator('.name')).not.toBeEmpty();
      await expect(item.locator('.authors')).not.toBeEmpty();
      await expect(item.locator('.takeaway')).not.toBeEmpty();
    }
    await expect(section).toContainText(
      'De Vries, Dijkstra & Kuhlman, building on Fishbein & Ajzen',
    );
  });

  test('the whole page states no percentages', async ({ page }) => {
    await page.goto('/method/');
    expect(await page.locator('main').innerText()).not.toMatch(/\d\s*%/);
  });
});

// 004:T010 Findability and Dutch (004:FR-010, 004:FR-011, 004:SC-005)
test.describe('method page: findability and Dutch', () => {
  test('navigation order is Overview, Golden paths, Deployment history, API docs, TechDocs', async ({
    page,
  }) => {
    await page.goto('/method/');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    // 005:T008 API docs added as the fourth section (005:FR-010); 006:T005 TechDocs fifth (006:FR-008)
    await expect(nav.locator('.term')).toHaveText([
      'Overview',
      'Golden paths',
      'Deployment history',
      'API docs',
      'TechDocs',
    ]);
    await expect(nav.getByRole('link', { name: /Golden paths/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(nav.getByRole('link', { name: /Golden paths/ })).toContainText('how I work');
  });

  for (const [from, scope, label, target] of [
    ['/', '[data-spec="002:FR-007"]', 'How I work', '/method/'],
    ['/nl/', '[data-spec="002:FR-007"]', 'Hoe ik werk', '/nl/methode/'],
    ['/career/', '[data-spec="003:FR-007"]', 'The method behind it', '/method/'],
    ['/nl/loopbaan/', '[data-spec="003:FR-007"]', 'De methode erachter', '/nl/methode/'],
  ] as const) {
    test(`${from}: links to the method from ${scope}`, async ({ page }) => {
      await page.goto(from);
      const link = page.locator(scope).getByRole('link', { name: label });
      await expect(link).toHaveAttribute('data-spec', '004:FR-011');
      await expect(link).toHaveAttribute('href', target);
    });
  }

  test('the language switch maps /method/ to /nl/methode/ and back', async ({ page }) => {
    await page.goto('/method/');
    await page
      .getByRole('navigation', { name: 'Language' })
      .getByRole('link', { name: 'Nederlands' })
      .click();
    await expect(page).toHaveURL(/\/nl\/methode\/$/);
    await page
      .getByRole('navigation', { name: 'Taal' })
      .getByRole('link', { name: 'English' })
      .click();
    await expect(page).toHaveURL(/\/method\/$/);
  });

  test('the Dutch page is in Dutch and links to Dutch releases', async ({ page }) => {
    await page.goto('/nl/methode/');
    await expect(page.locator('.principle')).toHaveText('Maak het juiste het makkelijkste.');
    await expect(page.getByRole('img', { name: /gewenste route/ })).toBeVisible();
    await expect(page.locator('[data-spec="004:FR-005"] .statement').nth(2)).toHaveText(
      'Mensen zijn van nature lui',
    );
    const proof = page.locator('[data-spec="004:FR-006"] a').first();
    await expect(proof).toHaveAttribute('href', /^\/nl\/loopbaan\/#release-/);
  });
});
