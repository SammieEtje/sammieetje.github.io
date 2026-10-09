// 002:T004 Built images carry no embedded metadata; runs after the build (002:FR-003, 002:SC-006)
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import sharp from 'sharp';

function rasterFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return rasterFiles(path);
    return /\.(jpe?g|png|webp|avif)$/i.test(name) ? [path] : [];
  });
}

test('every raster image in the build is free of EXIF, XMP and IPTC metadata', async () => {
  const files = rasterFiles('dist');
  expect(files.length).toBeGreaterThan(0);
  for (const file of files) {
    const meta = await sharp(file).metadata();
    expect({ file, exif: meta.exif, xmp: meta.xmp, iptc: meta.iptc }).toEqual({
      file,
      exif: undefined,
      xmp: undefined,
      iptc: undefined,
    });
  }
});
