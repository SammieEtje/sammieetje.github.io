// 001:T013 Page metadata: title, description, canonical, hreflang and social tags (001:FR-006, 001:FR-009)
import { locales, type Locale } from '../i18n/ui.ts';
import { t } from '../i18n/utils.ts';
import type { Route } from './routes.ts';

export const siteUrl = 'https://sammieetje.github.io';

const ogLocale: Record<Locale, string> = { en: 'en_GB', nl: 'nl_NL' };

export interface PageMeta {
  lang: Locale;
  title: string;
  description: string;
  canonical: string;
  // 002:T020 Sharing image in the page language (002:FR-010)
  image: { url: string; width: number; height: number; alt: string };
  alternates: { hreflang: string; href: string }[];
  og: {
    title: string;
    description: string;
    type: 'website';
    url: string;
    locale: string;
    localeAlternate: string[];
  };
}

export interface PageMetaInput {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  /** Path per locale when the page exists in every language; null for single pages such as 404. */
  paths: Record<Locale, string> | null;
}

export function buildPageMeta({
  locale,
  path,
  title,
  description,
  paths,
}: PageMetaInput): PageMeta {
  const fullTitle = `${title} · ${t(locale, 'site.name')}`;
  const canonical = `${siteUrl}${path}`;
  const alternates = paths
    ? [
        ...locales.map((l) => ({ hreflang: l as string, href: `${siteUrl}${paths[l]}` })),
        { hreflang: 'x-default', href: `${siteUrl}${paths.en}` },
      ]
    : [];
  return {
    lang: locale,
    title: fullTitle,
    description,
    canonical,
    image: {
      url: `${siteUrl}/og/${locale}.jpg`, // 003:T013 JPEG (003:FR-011)
      width: 1200,
      height: 630,
      alt: t(locale, 'og.alt'),
    },
    alternates,
    og: {
      title: fullTitle,
      description,
      type: 'website',
      url: canonical,
      locale: ogLocale[locale],
      localeAlternate: paths ? locales.filter((l) => l !== locale).map((l) => ogLocale[l]) : [],
    },
  };
}

export function routeMeta(route: Route, locale: Locale): PageMeta {
  return buildPageMeta({
    locale,
    path: route.paths[locale],
    title: t(locale, route.titleKey),
    description: t(locale, route.descriptionKey),
    paths: route.paths,
  });
}
