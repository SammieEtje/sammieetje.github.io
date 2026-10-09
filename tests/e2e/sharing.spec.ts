// 002:T019 Sharing metadata and build-generated sharing images (002:FR-010, 002:FR-011, 002:SC-004)
// 003:T012 JPEG, simpler and smaller (003:FR-010, 003:FR-011, 003:SC-005)
import { existsSync, readdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import sharp from 'sharp';
import { pages } from './pages.ts';

const site = 'https://sammieetje.github.io';

for (const { path, lang } of pages) {
  test(`${path} declares a large sharing image in its own language`, async ({ page }) => {
    await page.goto(path);
    const head = page.locator('head');
    const image = `${site}/og/${lang}.jpg`;
    await expect(head.locator('meta[property="og:image"]')).toHaveAttribute('content', image);
    await expect(head.locator('meta[property="og:image:width"]')).toHaveAttribute(
      'content',
      '1200',
    );
    await expect(head.locator('meta[property="og:image:height"]')).toHaveAttribute(
      'content',
      '630',
    );
    await expect(head.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', /.+/);
    await expect(head.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
    await expect(head.locator('meta[name="twitter:image"]')).toHaveAttribute('content', image);
  });
}

test('the build serves a 1200 × 630 JPEG per language, different per language', async ({
  request,
}) => {
  const bodies: Buffer[] = [];
  for (const lang of ['en', 'nl']) {
    const response = await request.get(`/og/${lang}.jpg`);
    expect(response.status()).toBe(200);
    const body = await response.body();
    const meta = await sharp(body).metadata();
    expect({ format: meta.format, width: meta.width, height: meta.height }).toEqual({
      format: 'jpeg',
      width: 1200,
      height: 630,
    });
    expect(body.length).toBeLessThanOrEqual(125 * 1024);
    bodies.push(body);
  }
  expect(bodies[0]!.equals(bodies[1]!)).toBe(false);
});

test('the PNG sharing images from 002 are no longer built', () => {
  expect(existsSync('dist/og/en.png') || existsSync('dist/og/nl.png')).toBe(false);
});

test('no sharing image is committed by hand', () => {
  const committed = existsSync('public/og') ? readdirSync('public/og') : [];
  expect(committed).toEqual([]);
});
