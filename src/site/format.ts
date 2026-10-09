// 002:T005 Locale number formatting (002:FR-005)
import type { Locale } from '../i18n/ui.ts';

const intlLocale: Record<Locale, string> = { en: 'en-GB', nl: 'nl-NL' };

export function formatNumber(value: number, locale: Locale, suffix = ''): string {
  return `${new Intl.NumberFormat(intlLocale[locale], { useGrouping: 'always' }).format(value)}${suffix}`;
}
