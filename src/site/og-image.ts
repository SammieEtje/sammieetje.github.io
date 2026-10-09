// 002:T021 Sharing image rendered at build time from the same photo and dictionary as the page (002:FR-010, 002:FR-011)
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import sharp from 'sharp';
import type { Locale } from '../i18n/ui.ts';
import { t } from '../i18n/utils.ts';
import { profile } from './profile.ts';

const require = createRequire(import.meta.url);
const font = (weight: 400 | 700) =>
  readFileSync(require.resolve(`@fontsource/inter/files/inter-latin-${weight}-normal.woff`));

const colors = {
  paper: '#f6f5f2',
  ink: '#1b1d22',
  muted: '#555b69',
  accent: '#b93d0b',
  line: '#dedad2',
};

type Node = { type: string; props: Record<string, unknown> & { style?: Record<string, unknown> } };
const el = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
  extra = {},
): Node => ({
  type,
  props: { style, children, ...extra },
});

// 003:T013 Fewer, larger elements survive LinkedIn's re-encoding: photo, name, headline (003:FR-010)
export function ogTree(locale: Locale, photoDataUri: string): Node {
  return el(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      background: colors.paper,
      fontFamily: 'Inter',
      color: colors.ink,
    },
    [
      el('div', { width: 24, height: '100%', background: colors.accent }),
      el('div', { display: 'flex', alignItems: 'center', gap: 64, flex: 1, padding: '0 80px' }, [
        el(
          'img',
          { width: 340, height: 340, borderRadius: 56, border: `3px solid ${colors.line}` },
          undefined,
          { src: photoDataUri, width: 340, height: 340 },
        ),
        el('div', { display: 'flex', flexDirection: 'column', flex: 1, gap: 28 }, [
          el(
            'div',
            { fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1 },
            profile.name,
          ),
          el(
            'div',
            {
              fontSize: 44,
              lineHeight: 1.25,
              paddingLeft: 28,
              borderLeft: `6px solid ${colors.accent}`,
            },
            t(locale, 'profile.headline'),
          ),
        ]),
      ]),
    ],
  );
}

// 003:T013 High-quality JPEG, full chroma so text edges stay sharp (003:FR-010)
export async function renderOgImage(locale: Locale): Promise<Uint8Array<ArrayBuffer>> {
  const photo = readFileSync(join(process.cwd(), 'src/assets/profile.jpg')).toString('base64');
  const svg = await satori(ogTree(locale, `data:image/jpeg;base64,${photo}`) as never, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: font(400), weight: 400, style: 'normal' },
      { name: 'Inter', data: font(700), weight: 700, style: 'normal' },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  const jpeg = await sharp(png)
    .jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toBuffer();
  return new Uint8Array(jpeg);
}
