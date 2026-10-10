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
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete window.__CF_COUNTRY__;
  localStorage.clear();
});

describe('language stays independent of country, currency and region', () => {
  it('keeps German while using Mozambique geography and currency, including after idle work', async () => {
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
    expect(result.current.currency).toBe('MZN');
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
});
