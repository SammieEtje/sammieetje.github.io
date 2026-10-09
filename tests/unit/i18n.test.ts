// 001:T007 Dictionary parity and lookup (001:FR-010)
import { describe, expect, it } from 'vitest';
import { defaultLocale, locales, ui } from '../../src/i18n/ui.ts';
import { isLocale, localeFromPath, t } from '../../src/i18n/utils.ts';

describe('dictionaries', () => {
  it('supports exactly English and Dutch, English first', () => {
    expect(locales).toEqual(['en', 'nl']);
    expect(defaultLocale).toBe('en');
  });

  it('has identical key sets in every locale', () => {
    const enKeys = Object.keys(ui.en).sort();
    for (const locale of locales) {
      expect(Object.keys(ui[locale]).sort()).toEqual(enKeys);
    }
  });

  it('has no empty values', () => {
    for (const locale of locales) {
      for (const [key, value] of Object.entries(ui[locale])) {
        expect(value.trim(), `${locale}.${key}`).not.toBe('');
      }
    }
  });
});

describe('t()', () => {
  it('returns the string for the requested locale', () => {
    expect(t('en', 'skip.link')).toBe('Skip to content');
    expect(t('nl', 'skip.link')).toBe('Naar de inhoud');
  });
});

describe('locale helpers', () => {
  it('recognises supported locales only', () => {
    expect(isLocale('nl')).toBe(true);
    expect(isLocale('de')).toBe(false);
  });

  it('derives the locale from a path', () => {
    expect(localeFromPath('/')).toBe('en');
    expect(localeFromPath('/nl/')).toBe('nl');
    expect(localeFromPath('/nl')).toBe('nl');
    expect(localeFromPath('/nlx/')).toBe('en');
  });
});
