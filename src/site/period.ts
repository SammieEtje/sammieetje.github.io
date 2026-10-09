// 003:T003 Release labels and periods per language (003:FR-002, 003:FR-003)
import type { Locale } from '../i18n/ui.ts';
import { t } from '../i18n/utils.ts';

/** A month (`YYYY-MM`) or, when only the year is known, a year (`YYYY`). */
export type YearMonth = string;

const intlLocale: Record<Locale, string> = { en: 'en-GB', nl: 'nl-NL' };

export function releaseLabel(start: YearMonth): string {
  return `v${start.replace('-', '.')}`;
}

export function formatPoint(value: YearMonth, locale: Locale): string {
  const [year, month] = value.split('-').map(Number);
  if (!month) return String(year);
  return new Intl.DateTimeFormat(intlLocale[locale], {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year!, month - 1, 1)));
}

export function formatPeriod(start: YearMonth, end: YearMonth | null, locale: Locale): string {
  const until = end === null ? t(locale, 'release.present') : formatPoint(end, locale);
  return `${formatPoint(start, locale)} – ${until}`;
}
