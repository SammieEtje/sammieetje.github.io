// 001:T011 Locale helpers
import { defaultLocale, locales, ui, type Locale, type UiKey } from './ui.ts';

export function t(locale: Locale, key: UiKey): string {
  return ui[locale][key];
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function localeFromPath(pathname: string): Locale {
  const [first] = pathname.split('/').filter(Boolean);
  return first && isLocale(first) ? first : defaultLocale;
}
