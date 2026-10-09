// 002:T010 Overview cards on both home pages (002:FR-004, 002:FR-005, 002:FR-006)
import { expect, test } from '@playwright/test';

const expected = {
  '/': {
    title: 'Key numbers',
    values: ['10,000', '5×', '2.5×'],
    contexts: [
      'Rabobank · 2016–2020',
      'Rabobank · 2011–2016',
      'TenneT · Infrastructure, Integration & Cloud · 2023–2026',
    ],
    firstLabel: 'voluntary users on the CI/CD platform',
  },
  '/nl/': {
    title: 'Kerncijfers',
    values: ['10.000', '5×', '2,5×'],
    contexts: [
      'Rabobank · 2016–2020',
      'Rabobank · 2011–2016',
      'TenneT · Infrastructuur, Integratie & Cloud · 2023–2026',
    ],
    firstLabel: 'vrijwillige gebruikers op het CI/CD-platform',
  },
} as const;

for (const [path, e] of Object.entries(expected)) {
  test.describe(path, () => {
    test('key numbers card shows three numbers with label and context', async ({ page }) => {
      await page.goto(path);
      const card = page.locator('[data-spec="002:FR-004"]');
      await expect(card.getByRole('heading', { level: 2 })).toHaveText(e.title);
      const tiles = card.locator('li[data-spec="002:FR-006"]');
      await expect(tiles).toHaveCount(3);
      for (let i = 0; i < 3; i++) {
        const tile = tiles.nth(i);
        await expect(tile.locator('[data-spec="002:FR-005"]')).toHaveText(e.values[i]!);
        await expect(tile.locator('.context')).toHaveText(e.contexts[i]!);
      }
    });

    test('value and label form one statement', async ({ page }) => {
      await page.goto(path);
      const statement = page.locator('li[data-spec="002:FR-006"]').first().locator('p').first();
      await expect(statement).toContainText(e.values[0]);
      await expect(statement).toContainText(e.firstLabel);
    });
  });
}

// 002:T012 About card (002:FR-007)
const about = {
  '/': {
    title: 'About',
    text: "For nearly twenty years I have turned IT departments in banking and energy into platform organisations that teams actually want to use. My thesis on behaviour change taught me that people take the path of least resistance, so I don't push change: I redesign the environment until the right thing is the easy thing. Today I lead the Data & Analytics Platform at TenneT, where data and AI power the energy transition.",
  },
  '/nl/': {
    title: 'Over mij',
    text: 'Al bijna twintig jaar maak ik van IT-afdelingen in bankwezen en energie platformorganisaties die teams echt willen gebruiken. Mijn afstudeeronderzoek naar gedragsverandering leerde me dat mensen de weg van de minste weerstand kiezen; daarom duw ik niet, maar herontwerp ik de omgeving tot het juiste het makkelijkste is. Vandaag leid ik het Data & Analytics Platform bij TenneT, waar data en AI de energietransitie aandrijven.',
  },
} as const;

for (const [path, e] of Object.entries(about)) {
  test(`${path}: About card shows the agreed three sentences`, async ({ page }) => {
    await page.goto(path);
    const card = page.locator('[data-spec="002:FR-007"]');
    await expect(card.getByRole('heading', { level: 2 })).toHaveText(e.title);
    await expect(card.locator('p')).toHaveText(e.text);
  });
}

// 002:T014 Links card (002:FR-008)
for (const [path, names] of [
  ['/', { linkedin: 'LinkedIn profile', github: 'GitHub profile' }],
  ['/nl/', { linkedin: 'LinkedIn-profiel', github: 'GitHub-profiel' }],
] as const) {
  test(`${path}: Links card lists LinkedIn and GitHub as the owner's profiles`, async ({
    page,
  }) => {
    await page.goto(path);
    const card = page.locator('[data-spec="002:FR-008"]');
    const linkedin = card.getByRole('link', { name: new RegExp(names.linkedin) });
    const github = card.getByRole('link', { name: new RegExp(names.github) });
    await expect(linkedin).toHaveAttribute('href', 'https://www.linkedin.com/in/sanderettema/');
    await expect(github).toHaveAttribute('href', 'https://github.com/SammieEtje');
    for (const link of [linkedin, github]) {
      await expect(link).toHaveAttribute('rel', /\bme\b/);
    }
  });
}

// 002:T016 Overview layout (002:FR-009, 002:SC-001)
const cardSelectors = [
  '[data-spec="001:FR-001"]',
  '[data-spec="002:FR-004"]',
  '[data-spec="002:FR-007"]',
  '[data-spec="002:FR-008"]',
];

test('cards appear in the order identity, key numbers, About, Links', async ({ page }) => {
  await page.goto('/');
  const order = await page
    .locator('[data-spec="002:FR-009"] > *')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-spec')));
  expect(order).toEqual(cardSelectors.map((s) => s.match(/"(.+)"/)![1]));
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('cards stack in a single column', async ({ page }) => {
    await page.goto('/');
    const lefts = await Promise.all(
      cardSelectors.map(async (s) => (await page.locator(s).boundingBox())!.x),
    );
    expect(new Set(lefts).size).toBe(1);
  });
});

test.describe('on a 1280 × 800 screen', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('photo, name, headline and the first key number are visible without scrolling', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('picture[data-spec="002:FR-001"] img')).toBeInViewport();
    await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
    await expect(page.getByText('People take the path of least resistance.')).toBeInViewport();
    await expect(page.locator('li[data-spec="002:FR-006"]').first()).toBeInViewport({ ratio: 1 });
  });

  test('cards form a multi-column grid: key numbers beside the identity card', async ({ page }) => {
    await page.goto('/');
    const identity = (await page.locator(cardSelectors[0]!).boundingBox())!;
    const numbers = (await page.locator(cardSelectors[1]!).boundingBox())!;
    expect(numbers.x).toBeGreaterThan(identity.x + identity.width - 1);
    expect(Math.abs(numbers.y - identity.y)).toBeLessThan(1);
  });
});
