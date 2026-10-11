import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CRITICAL_NAV } from '../critical.js';
import { getCriticalUI, useLocale } from '../useLocale.js';
import { loadTranslation } from '../loadTranslation.js';
import { LOCALES } from '../localeCatalog.js';

vi.mock('../loadTranslation.js', () => ({ loadTranslation: vi.fn() }));

const FULL_UI_MODULES = import.meta.glob('../langs/*.js', { eager: true, import: 'UI' });
const languages = LOCALES.map(({ code }) => code);

describe('first-render header and hero translations', () => {
  it.each(languages)('%s: matches the full language module without a network round-trip', lang => {
    const full = FULL_UI_MODULES[`../langs/${lang}.js`];
    const critical = getCriticalUI(lang);

    for (const key of ['menu', 'regions', 'currencies', 'nav', 'hero']) {
      expect(critical[key], `${lang}: ${key}`).toEqual(full[key]);
    }
    expect(critical.stay.ourStory).toBe(full.stay.ourStory);
    expect(CRITICAL_NAV[lang].menu).toBe(full.menu);
    expect(CRITICAL_NAV[lang].food).toBe(full.nav.food);
    expect(CRITICAL_NAV[lang].heroSubtitle).toBe(full.hero.subtitle);
    expect(CRITICAL_NAV[lang].heroExplore).toBe(full.hero.ctaSecondary);

    for (const key of ['subtitle', 'ctaPrimary', 'ctaSecondary', 'badge', 'clickReviews', 'villageHighlights', 'goDiving']) {
      expect(typeof critical.hero[key]).toBe('string');
      expect(critical.hero[key].trim()).not.toBe('');
    }
  });

  it.each(languages.filter(lang => !lang.startsWith('en-')))(
    '%s: hero subtitle and lodge button are not English placeholders',
    lang => {
      const critical = getCriticalUI(lang);
      const english = getCriticalUI('en-GB');
      expect(critical.hero.subtitle).not.toBe(english.hero.subtitle);
      expect(critical.hero.ctaSecondary).not.toBe(english.hero.ctaSecondary);
    },
  );

  it('uses "Ga duiken" on the Dutch diving button before and after translations load', () => {
    expect(getCriticalUI('nl-NL').hero.goDiving).toBe('Ga duiken');
    expect(FULL_UI_MODULES['../langs/nl-NL.js'].hero.goDiving).toBe('Ga duiken');
  });

  it('keeps complete English fallbacks for an unsupported locale', () => {
    const fallback = getCriticalUI('xx-UNKNOWN');
    const english = getCriticalUI('en-GB');
    for (const key of ['menu', 'regions', 'currencies', 'nav', 'hero']) {
      expect(fallback[key]).toEqual(english[key]);
    }
  });
});

describe('slow translation loading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    window.history.replaceState(null, '', '/de/');
    window.__CF_COUNTRY__ = 'MZ';
    delete window.__DEVOCEAN_LOCALE_BOOTSTRAPPED__;
    delete window.__DEVOCEAN_LOCALE_API__;
    vi.stubGlobal('navigator', { languages: ['de-DE'], language: 'de-DE' });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    localStorage.clear();
    delete window.__CF_COUNTRY__;
    window.history.replaceState(null, '', '/');
  });

  it('shows German immediately and keeps the same text after the pending translation resolves', async () => {
    let finishLoading;
    const pending = new Promise(resolve => { finishLoading = resolve; });
    vi.mocked(loadTranslation).mockReturnValueOnce(pending);
    localStorage.setItem('site.currency', 'ZAR');
    localStorage.setItem('site.currency.source', 'user');

    const { result } = renderHook(() => useLocale());
    const full = FULL_UI_MODULES['../langs/de-DE.js'];
    expect(result.current.ui).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.criticalUI.menu).toBe('Menü');
    expect(result.current.criticalUI.hero.subtitle).toBe(full.hero.subtitle);
    expect(result.current.criticalUI.hero.ctaSecondary).toBe('Lodge entdecken');
    expect(result.current.criticalUI.regions.africa).toBe('Afrika');
    expect(result.current.criticalUI.nav.food).toBe('Essen');
    expect(result.current.criticalUI.stay.ourStory).toBe('Unsere Geschichte');

    // Geography and the saved display currency must not change with copy.
    await act(async () => { vi.advanceTimersByTime(250); });
    expect(result.current.lang).toBe('de-DE');
    expect(result.current.countryCode).toBe('MZ');
    expect(result.current.currency).toBe('ZAR');
    expect(result.current.ui).toBeNull();

    const firstPaint = result.current.criticalUI;
    await act(async () => { finishLoading(full); });
    expect(result.current.loading).toBe(false);
    for (const key of ['menu', 'regions', 'currencies', 'nav', 'hero']) {
      expect(result.current.ui[key]).toEqual(firstPaint[key]);
    }
    expect(result.current.currency).toBe('ZAR');
  });
});
