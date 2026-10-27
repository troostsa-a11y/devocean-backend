import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocale } from '../useLocale.js';

vi.mock('../loadTranslation.js', () => ({
  loadTranslation: vi.fn(async () => ({ nav: {} })),
}));

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  window.history.replaceState(null, '', '/');
  window.__CF_COUNTRY__ = 'MZ';
  delete window.__DEVOCEAN_LOCALE_BOOTSTRAPPED__;
  delete window.__DEVOCEAN_LOCALE_API__;
  vi.stubGlobal('navigator', { languages: ['de-DE'], language: 'de-DE' });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete window.__CF_COUNTRY__;
  localStorage.clear();
});

describe('language stays independent of country, currency and region', () => {
  it.each([
    '//attacker.example/path',
    '/\\attacker.example/path',
    '/de/..//attacker.example/path',
  ])('retired language queries do not select a language or redirect hostile path %s', async pathname => {
    const url = new URL(window.location.href);
    url.pathname = pathname;
    url.search = '?lang=en&utm_source=mail';
    url.hash = '#contact';
    window.history.replaceState(null, '', url.href);
    const replace = vi.spyOn(window.location, 'replace').mockImplementation(() => {});
    const { result } = renderHook(() => useLocale());
    await act(async () => {});
    expect(replace).not.toHaveBeenCalled();
    expect(result.current.lang).toBe('de-DE');
    expect(localStorage.getItem('site.lang_source')).toBe('browser');
  });

  it('ignores a retired query-language choice without changing other URL data', async () => {
    window.history.replaceState(null, '', '/experiences/diving?lang=pt&utm_source=mail#inquiry');
    const replace = vi.spyOn(window.location, 'replace').mockImplementation(() => {});
    const { result } = renderHook(() => useLocale());
    await act(async () => {});
    expect(result.current.lang).toBe('de-DE');
    expect(replace).not.toHaveBeenCalled();
    expect(window.location.search).toBe('?lang=pt&utm_source=mail');
    expect(window.location.hash).toBe('#inquiry');
  });

  it('still honors the current locale path ahead of browser and retired query preferences', async () => {
    window.history.replaceState(null, '', '/pt-pt/experiences/diving?lang=ja&utm_source=mail#inquiry');
    const { result } = renderHook(() => useLocale());
    await act(async () => {});
    expect(result.current.lang).toBe('pt-PT');
    expect(localStorage.getItem('site.lang_source')).toBe('url');
  });

  it('manual language navigation also stays same origin on double-slash paths', async () => {
    window.history.replaceState(null, '', `${window.location.origin}//attacker.example/path`);
    const assign = vi.spyOn(window.location, 'assign').mockImplementation(() => {});
    const { result } = renderHook(() => useLocale());
    await act(async () => { result.current.setLang('en'); });
    expect(assign).toHaveBeenCalledOnce();
    expect(new URL(assign.mock.calls[0][0]).origin).toBe(window.location.origin);
  });

  it('keeps German and browser-derived EUR while retaining Mozambique geography, including after idle work', async () => {
    localStorage.setItem('cf.country', 'DE');
    localStorage.setItem('cf.country.ts', String(Date.now()));
    localStorage.setItem('site.region', 'westEu');
    localStorage.setItem('site.region.source', 'auto');
    localStorage.setItem('site.region.version', '3');
    const { result } = renderHook(() => useLocale());
    await act(async () => { vi.advanceTimersByTime(250); });
    expect(result.current.lang).toBe('de-DE');
    expect(result.current.countryCode).toBe('MZ');
    expect(result.current.region).toBe('africa');
    expect(result.current.currency).toBe('EUR');
    expect(localStorage.getItem('site.currency.source')).toBe('browser');
    expect(localStorage.getItem('site.lang_source')).toBe('browser');
  });

  it('preserves manual language and currency choices without changing IP geography', async () => {
    localStorage.setItem('site.lang', 'en-GB');
    localStorage.setItem('site.lang_source', 'user');
    localStorage.setItem('site.currency', 'USD');
    localStorage.setItem('site.currency.source', 'user');
    const { result } = renderHook(() => useLocale());
    await act(async () => { vi.advanceTimersByTime(250); });
    expect(result.current.lang).toBe('en-GB');
    expect(result.current.currency).toBe('USD');
    expect(result.current.countryCode).toBe('MZ');
    expect(result.current.region).toBe('africa');
  });

  it('uses IP currency when the browser has only a bare language', async () => {
    vi.stubGlobal('navigator', { languages: ['de'], language: 'de' });
    const { result } = renderHook(() => useLocale());
    await act(async () => { vi.advanceTimersByTime(250); });
    expect(result.current.lang).toBe('de-DE');
    expect(result.current.currency).toBe('MZN');
  });

  it('does not change browser currency when a region is selected', async () => {
    const { result } = renderHook(() => useLocale());
    await act(async () => { result.current.setRegion('americas'); });
    expect(result.current.currency).toBe('EUR');
    expect(result.current.region).toBe('americas');
  });
});
