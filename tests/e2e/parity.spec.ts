// 001:T030 Every built page exists in both languages (001:FR-007, 001:FR-010, 001:SC-002)
import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { expect, test } from '@playwright/test';
import { locales } from '../../src/i18n/ui.ts';
import { routes } from '../../src/site/routes.ts';

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? htmlFiles(path) : name.endsWith('.html') ? [path] : [];
  });
}

const toUrlPath = (file: string) =>
  `/${relative('dist', file).split(sep).join('/')}`.replace(/index\.html$/, '');

test('every registry route is built in every language', () => {
  const built = new Set(htmlFiles('dist').map(toUrlPath));
  for (const route of routes) {
    for (const locale of locales) {
      expect(built.has(route.paths[locale]), `${route.id} (${locale})`).toBe(true);
    }
  }
});

test('every built page except 404 belongs to a bilingual registry route', () => {
  const known = new Set(routes.flatMap((route) => Object.values(route.paths)));
  const pages = htmlFiles('dist')
    .map(toUrlPath)
    .filter((path) => path !== '/404.html');
  for (const path of pages) {
    expect(known.has(path), path).toBe(true);
  }
});
