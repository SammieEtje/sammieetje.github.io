// 008:T003 Playground interaction (008:FR-004, 008:FR-005, 008:SC-001, 008:SC-003)
import { expect, test } from '@playwright/test';
import { leverIds } from '../../src/site/adoption-model.ts';

const summary = (page: import('@playwright/test').Page) =>
  page.locator('[data-spec="008:FR-005"] .summary');
const adoptionPath = (page: import('@playwright/test').Page) =>
  page.locator('[data-spec="008:FR-005"] path.adoption');

test.describe('playground: levers', () => {
  test('shows seven levers in two labelled groups and a mandate switch, enabled', async ({
    page,
  }) => {
    await page.goto('/playground/');
    const form = page.locator('[data-spec="008:FR-004"]');
    await expect(form.locator('fieldset.controls')).toBeEnabled();
    await expect(
      form
        .getByRole('group', { name: 'Lower the resistance on the right path' })
        .getByRole('checkbox'),
    ).toHaveCount(4);
    await expect(
      form
        .getByRole('group', { name: 'Raise the resistance on the wrong path' })
        .getByRole('checkbox'),
    ).toHaveCount(3);
    await expect(form.getByRole('checkbox', { name: /Mandate/ })).not.toBeChecked();
    for (const box of await form.getByRole('checkbox').all()) await expect(box).not.toBeChecked();
  });

  test('starts from the stalled default, announced politely', async ({ page }) => {
    await page.goto('/playground/');
    await expect(summary(page)).toHaveAttribute('role', 'status');
    await expect(summary(page)).toHaveAttribute('aria-live', 'polite');
    await expect(summary(page)).toContainText('never gets past its early adopters');
  });

  test('a lever updates the curve and the summary within 100 ms', async ({ page }) => {
    await page.goto('/playground/');
    const before = await adoptionPath(page).getAttribute('d');
    const elapsed = await page.evaluate(async () => {
      const box = document.querySelector<HTMLInputElement>('input[value="selfservice"]')!;
      const path = document.querySelector('[data-spec="008:FR-005"] path.adoption')!;
      const start = performance.now();
      const changed = new Promise<number>((resolve) =>
        new MutationObserver(() => resolve(performance.now() - start)).observe(path, {
          attributes: true,
        }),
      );
      box.click();
      return changed;
    });
    expect(elapsed).toBeLessThan(100);
    expect(await adoptionPath(page).getAttribute('d')).not.toBe(before);
  });

  test('every lever on: everyone chose it', async ({ page }) => {
    await page.goto('/playground/');
    for (const id of leverIds) await page.locator(`input[value="${id}"]`).check();
    await expect(summary(page)).toContainText('All of them chose it.');
  });

  test('a mandate without levers: high adoption, mostly reluctant', async ({ page }) => {
    await page.goto('/playground/');
    await page.getByRole('checkbox', { name: /Mandate/ }).check();
    await expect(summary(page)).toContainText('only because they have to');
    const band = await page.locator('[data-spec="008:FR-005"] path.reluctant').boundingBox();
    expect(band!.height).toBeGreaterThan(20);
  });
});

// 008:T005 Explanation, no-JS, findability, Dutch (008:FR-006, 008:FR-007, 008:FR-009)
test.describe('playground: explanation, no JavaScript, findability, Dutch', () => {
  test('explains the model, says it is illustrative and links to the source', async ({ page }) => {
    await page.goto('/playground/');
    const section = page.locator('[data-spec="008:FR-007"]');
    await expect(section.getByRole('heading', { level: 2 })).toHaveText('How the model works');
    await expect(section.locator('ol > li')).toHaveCount(5);
    await expect(section).toContainText('They are not measurements.');
    await expect(section).toContainText(
      'At Rabobank, with all of these levers in place and no mandate',
    );
    await expect(section.getByRole('link', { name: 'Read the model source' })).toHaveAttribute(
      'href',
      'https://github.com/SammieEtje/sammieetje.github.io/blob/main/src/site/adoption-model.ts',
    );
  });

  test('the method premise invites visitors to try it', async ({ page }) => {
    await page.goto('/method/');
    const link = page.locator('[data-spec="004:FR-002"] a[data-spec="008:FR-009"]');
    await expect(link).toHaveText(/Try it in the playground/);
    await expect(link).toHaveAttribute('href', '/playground/');
  });

  test('the navigation lists the playground, current on its page', async ({ page }) => {
    await page.goto('/playground/');
    const item = page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: /Playground/ });
    await expect(item).toContainText('try it');
    await expect(item).toHaveAttribute('aria-current', 'page');
  });

  test('the Dutch page is in Dutch and its summary updates in Dutch', async ({ page }) => {
    await page.goto('/nl/speeltuin/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Speeltuin');
    await expect(summary(page)).toContainText('komt nooit verder dan de early adopters');
    await page.getByRole('checkbox', { name: /Verplicht het platform/ }).check();
    await expect(summary(page)).toContainText('alleen omdat het moet');
  });
});

test.describe('playground without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('shows the default result, with the controls disabled and explained', async ({ page }) => {
    await page.goto('/playground/');
    // A disabled fieldset disables every control inside it; assert what visitors experience.
    for (const box of await page.locator('[data-spec="008:FR-004"]').getByRole('checkbox').all()) {
      await expect(box).toBeDisabled();
    }
    await expect(page.locator('[data-spec="008:FR-006"]')).toHaveText(
      'Changing the scenario needs JavaScript; this is the default scenario.',
    );
    await expect(summary(page)).toContainText('never gets past its early adopters');
    await expect(adoptionPath(page)).toHaveAttribute('d', /^M/);
  });
});
