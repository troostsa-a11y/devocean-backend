import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  LOCALES,
  allHreflangPaths,
  localeFromPath,
  localizedPath,
  normalizeLocale,
  stripLocalePrefix,
} from '../localeCatalog.js';

describe('public locale URL contract', () => {
  it('keeps historical English routes at the root and prefixes other locales', () => {
    expect(DEFAULT_LOCALE).toBe('en-GB');
    expect(localizedPath('/chalet', 'en-GB')).toBe('/chalet');
    expect(localizedPath('/chalet', 'pt-PT')).toBe('/pt-pt/chalet');
    expect(localizedPath('/', 'zh-CN')).toBe('/zh-hans/');
  });

  it('recognises and strips exactly one locale prefix', () => {
    expect(localeFromPath('/pt-pt/chalet')?.code).toBe('pt-PT');
    expect(stripLocalePrefix('/pt-pt/chalet')).toBe('/chalet');
    expect(stripLocalePrefix('/pt-pt/')).toBe('/');
    expect(stripLocalePrefix('/chalet')).toBe('/chalet');
  });

  it('normalises legacy booking and language-query values', () => {
    expect(normalizeLocale('pt')).toBe('pt-PT');
    expect(normalizeLocale('zh-CN')).toBe('zh-CN');
    expect(normalizeLocale('sv-SE')).toBe('sv');
    expect(normalizeLocale('not-a-locale')).toBeNull();
  });

  it('produces one unique alternate URL per supported locale', () => {
    const alternates = allHreflangPaths('/devocean-lodge-meals');
    expect(alternates).toHaveLength(LOCALES.length);
    expect(new Set(alternates.map(({ hreflang }) => hreflang)).size).toBe(LOCALES.length);
    expect(new Set(alternates.map(({ pathname }) => pathname)).size).toBe(LOCALES.length);
    expect(alternates.find(({ code }) => code === 'pt-PT')?.pathname).toBe('/pt-pt/devocean-lodge-meals');
  });
});