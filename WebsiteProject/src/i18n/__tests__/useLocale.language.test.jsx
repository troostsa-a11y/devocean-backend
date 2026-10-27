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
  ])('legacy English query cannot redirect hostile path %s off site', async pathname => {
    const url = new URL(window.location.href);
    url.pathname = pathname;
    url.search = '?lang=en&utm_source=mail';
    url.hash = '#contact';
    window.history.replaceState(null, '', url.href);
    const replace = vi.spyOn(window.location, 'replace').mockImplementation(() => {});
    renderHook(() => useLocale());
    await act(async () => {});
    expect(replace).toHaveBeenCalledOnce();
    const destination = new URL(replace.mock.calls[0][0], window.location.origin);
    expect(destination.origin).toBe(window.location.origin);
    expect(destination.search).toBe('?utm_source=mail');
    expect(destination.hash).toBe('#contact');
  });

  it('legacy locale links preserve ordinary route, query and anchor navigation', async () => {
    window.history.replaceState(null, '', '/experiences/diving?lang=pt&utm_source=mail#inquiry');
    const replace = vi.spyOn(window.location, 'replace').mockImplementation(() => {});
    const { result } = renderHook(() => useLocale());
    await act(async () => {});
    expect(result.current.lang).toBe('pt-PT');
    expect(replace).toHaveBeenCalledWith(`${window.location.origin}/pt-pt/experiences/diving?utm_source=mail#inquiry`);
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
