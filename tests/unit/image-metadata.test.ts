// 002:T004 Source images carry no embedded metadata (002:FR-003, 002:SC-006)
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

const dir = 'src/assets';
const images = readdirSync(dir).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f));

describe('source images', () => {
  it('include the profile photo', () => {
    expect(images).toContain('profile.jpg');
  });

  for (const file of images) {
    it(`${file} has no EXIF, XMP or IPTC metadata`, async () => {
      const meta = await sharp(join(dir, file)).metadata();
      expect({ exif: meta.exif, xmp: meta.xmp, iptc: meta.iptc }).toEqual({
        exif: undefined,
        xmp: undefined,
        iptc: undefined,
      });
    });
  }
});
