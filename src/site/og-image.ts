// 002:T021 Sharing image rendered at build time from the same photo and dictionary as the page (002:FR-010, 002:FR-011)
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
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
      el('div', { width: 18, height: '100%', background: colors.accent }),
      el('div', { display: 'flex', flexDirection: 'column', flex: 1, padding: '64px 72px 56px' }, [
        el('div', { display: 'flex', alignItems: 'center', gap: 56, flex: 1 }, [
          el(
            'img',
            { width: 300, height: 300, borderRadius: 48, border: `2px solid ${colors.line}` },
            undefined,
            {
              src: photoDataUri,
              width: 300,
              height: 300,
            },
          ),
          el('div', { display: 'flex', flexDirection: 'column', flex: 1, gap: 18 }, [
            el(
              'div',
              { fontSize: 68, fontWeight: 700, letterSpacing: -2, lineHeight: 1 },
              profile.name,
            ),
            el('div', { fontSize: 26, color: colors.muted }, t(locale, 'profile.role')),
            el(
              'div',
              {
                fontSize: 34,
                lineHeight: 1.3,
                marginTop: 12,
                paddingLeft: 24,
                borderLeft: `5px solid ${colors.accent}`,
              },
              t(locale, 'profile.headline'),
            ),
          ]),
        ]),
        el(
          'div',
          {
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: 24,
            borderTop: `2px solid ${colors.line}`,
            fontSize: 24,
            color: colors.muted,
          },
          [el('div', {}, 'sammieetje.github.io'), el('div', {}, t(locale, 'profile.positioning'))],
        ),
      ]),
    ],
  );
}

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
  return new Uint8Array(new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng());
}
