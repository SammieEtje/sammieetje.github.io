// 001:T012 Route registry: the single source for pages, counterparts and navigation (001:FR-004)
import type { Locale, UiKey } from '../i18n/ui.ts';
import { t } from '../i18n/utils.ts';

export interface Route {
  id: string;
  paths: Record<Locale, string>;
  titleKey: UiKey;
  descriptionKey: UiKey;
  nav?: { termKey: UiKey; subtitleKey: UiKey };
}

export const routes: readonly Route[] = [
  {
    id: 'overview',
    paths: { en: '/', nl: '/nl/' },
    titleKey: 'page.overview.title',
    descriptionKey: 'page.overview.description',
    nav: { termKey: 'nav.overview.term', subtitleKey: 'nav.overview.subtitle' },
  },
];

const withSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`);

export function findRoute(pathname: string): Route | undefined {
  const path = withSlash(pathname);
  return routes.find((route) => Object.values(route.paths).includes(path));
}

export function counterpartPath(pathname: string, target: Locale): string {
  const route = findRoute(pathname) ?? routes[0]!;
  return route.paths[target];
}

export interface NavItem {
  href: string;
  term: string;
  subtitle: string;
  current: boolean;
}

export function navItems(locale: Locale, currentPath: string): NavItem[] {
  const current = withSlash(currentPath);
  return routes.flatMap((route) =>
    route.nav
      ? [
          {
            href: route.paths[locale],
            term: t(locale, route.nav.termKey),
            subtitle: t(locale, route.nav.subtitleKey),
            current: route.paths[locale] === current,
          },
        ]
      : [],
  );
}
