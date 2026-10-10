// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { runInNewContext } from 'node:vm';
import { readFileSync } from 'node:fs';
import { LOCALES } from '../localeCatalog.js';
import { resolveVisitorLanguage } from '../visitorLanguage.js';
import { injectLocaleBootstrap, localeBootstrapScript } from '../localeBootstrap.js';
import { onRequest } from '../../../functions/_middleware.js';

function bootstrap({
  path = '/', search = '', hash = '', browser = ['de-DE'], country = 'MZ',
  stored = {}, cookie = '', userAgent = 'Chrome', storageDisabled = false,
} = {}) {
  const values = new Map(Object.entries(stored));
  const element = { style: {}, lang: 'en-GB', setAttribute(name, value) { this[name] = value; } };
  const document = { documentElement: element, cookie };
  const window = {
    __CF_COUNTRY__: country,
    location: { pathname: path, search, hash, protocol: 'https:', replace: vi.fn(), assign: vi.fn() },
    setTimeout: vi.fn(),
  };
  const script = localeBootstrapScript().match(/<script[^>]*>([\s\S]*)<\/script>/)[1];
  runInNewContext(script, {
    window, document, URLSearchParams,
    navigator: { languages: browser, language: browser[0], userAgent },
    localStorage: {
      getItem(key) { if (storageDisabled) throw new Error('Disabled'); return values.get(key) || null; },
      setItem(key, value) { if (storageDisabled) throw new Error('Disabled'); values.set(key, String(value)); },
    },
  });
  return { window, document, values };
}

describe('browser-first language preference', () => {
  it.each(LOCALES.map(({ code }) => code))('recognizes supported locale %s', (code) => {
    expect(resolveVisitorLanguage({ browserLanguages: [code], countryCode: 'MZ' }))
      .toEqual({ lang: code, source: 'browser' });
  });

  it('honors a language URL ahead of query, manual choice, browser and country', () => {
    expect(resolveVisitorLanguage({
      pathname: '/fr/book-direct', queryLanguage: 'ja', storedLanguage: 'pt-BR',
      storedSource: 'user', browserLanguages: ['de-DE'], countryCode: 'MZ',
    })).toEqual({ lang: 'fr-FR', source: 'url' });
  });

  it('preserves a saved manual choice', () => {
    expect(resolveVisitorLanguage({
      storedLanguage: 'en-GB', storedSource: 'user', browserLanguages: ['de'], countryCode: 'MZ',
    })).toEqual({ lang: 'en-GB', source: 'user' });
  });

  it('ignores a cached automatic IP choice', () => {
    expect(resolveVisitorLanguage({
      storedLanguage: 'pt-BR', storedSource: 'auto', browserLanguages: ['de-AT'], countryCode: 'MZ',
    })).toEqual({ lang: 'de-DE', source: 'browser' });
  });

  it('tries later supported browser preferences before IP', () => {
    expect(resolveVisitorLanguage({ browserLanguages: ['ar', 'fr-CA'], countryCode: 'US' }))
      .toEqual({ lang: 'fr-FR', source: 'browser' });
  });

  it.each([[], ['ar', 'xx']])('uses IP when no supported preference exists (%j)', (languages) => {
    expect(resolveVisitorLanguage({ browserLanguages: languages, countryCode: 'MZ' }))
      .toEqual({ lang: 'pt-BR', source: 'ip' });
  });

  it('uses English only as the final fallback', () => {
    expect(resolveVisitorLanguage({ browserLanguages: ['ar'], countryCode: 'XX' }))
      .toEqual({ lang: 'en-GB', source: 'default' });
  });
});

describe('first-paint language bootstrap', () => {
  it('selects browser language before IP and navigates to its stable URL', () => {
    const { window, document, values } = bootstrap();
    expect(document.documentElement.lang).toBe('de-DE');
    expect(window.location.replace).toHaveBeenCalledWith('/de/');
    expect(document.documentElement.style.visibility).toBe('hidden');
    expect(values.get('site.lang_source')).toBe('browser');
  });

  it('keeps an explicit URL even when browser and IP disagree', () => {
    const { window, document } = bootstrap({ path: '/pt-pt/book-direct', browser: ['de-DE'] });
    expect(document.documentElement.lang).toBe('pt-PT');
    expect(window.location.replace).not.toHaveBeenCalled();
  });

  it('keeps saved manual English on the unprefixed URL', () => {
    const { window, document } = bootstrap({ stored: { 'site.lang': 'en-GB', 'site.lang_source': 'user' } });
    expect(document.documentElement.lang).toBe('en-GB');
    expect(window.location.replace).not.toHaveBeenCalled();
  });

  it('does not erase a manual preference when visiting its language URL', () => {
    const { values } = bootstrap({
      path: '/de/', stored: { 'site.lang': 'de-DE', 'site.lang_source': 'user' },
    });
    expect(values.get('site.lang_source')).toBe('user');
  });

  it('also preserves legacy short-code manual preferences', () => {
    const { values } = bootstrap({
      path: '/de/', stored: { 'site.lang': 'de', 'site.lang_source': 'user' },
    });
    expect(values.get('site.lang')).toBe('de-DE');
    expect(values.get('site.lang_source')).toBe('user');
  });

  it('uses the current SPA route when switching language through the global API', () => {
    const { window } = bootstrap({ browser: ['en-GB'] });
    window.location.pathname = '/book-direct';
    window.location.search = '?adults=2';
    window.setSiteLocale({ lang: 'de-DE' });
    expect(window.location.assign).toHaveBeenCalledWith('/de/book-direct?adults=2');
    expect(window.__DEVOCEAN_LOCALE_API__.basePath).toBe('/book-direct');
  });

  it('preserves checkout parameters and anchors through locale navigation', () => {
    const { window } = bootstrap({ path: '/book-direct', search: '?checkin=2027-01-05&adults=2', hash: '#rooms' });
    expect(window.location.replace).toHaveBeenCalledWith('/de/book-direct?checkin=2027-01-05&adults=2#rooms');
  });

  it('does not change an IP-based or manually overridden currency', () => {
    const { values } = bootstrap({ stored: { 'site.currency': 'ZAR', 'site.currency.source': 'user' } });
    expect(values.get('site.currency')).toBe('ZAR');
    expect(values.get('site.currency.source')).toBe('user');
  });

  it('bootstraps browser currency before IP even on standalone pages', () => {
    const { values } = bootstrap({ path: '/de/safari', browser: ['de-CH'], country: 'MZ' });
    expect(values.get('site.currency')).toBe('CHF');
    expect(values.get('site.currency.source')).toBe('browser');
    expect(values.get('site.currency.country')).toBe('CH');
  });

  it('uses IP currency for a bare browser language and USD without IP', () => {
    expect(bootstrap({ browser: ['de'] }).values.get('site.currency')).toBe('MZN');
    expect(bootstrap({ browser: ['de'], country: '' }).values.get('site.currency')).toBe('USD');
    expect(bootstrap({ browser: ['de'], country: 'XX' }).values.get('site.currency')).toBe('USD');
  });

  it('falls back to IP when the browser preference is unsupported', () => {
    const { window } = bootstrap({ browser: ['ar'] });
    expect(window.location.replace).toHaveBeenCalledWith('/pt-br/');
  });

  it('still selects browser language with localStorage disabled', () => {
    expect(bootstrap({ storageDisabled: true }).document.documentElement.lang).toBe('de-DE');
  });

  it('preserves explicit English with cookies when storage is unavailable', () => {
    const { window, document } = bootstrap({ cookie: 'dv_lang=en-GB', storageDisabled: true });
    expect(document.documentElement.lang).toBe('en-GB');
    expect(window.location.replace).not.toHaveBeenCalled();
  });

  it('lets a fresh explicit English redirect override older manual German', async () => {
    const response = await onRequest({
      request: new Request('https://devoceanlodge.com/?lang=en-GB&ref=demo', {
        headers: { accept: 'text/html' },
      }),
    });
    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe('https://devoceanlodge.com/?ref=demo');
    expect(response.headers.get('set-cookie')).toContain('dv_lang_entry=en-GB');
    const { window, document, values } = bootstrap({
      cookie: 'dv_lang=en-GB; dv_lang_entry=en-GB', search: '?ref=demo',
      stored: { 'site.lang': 'de-DE', 'site.lang_source': 'user' },
    });
    expect(window.location.replace).not.toHaveBeenCalled();
    expect(document.documentElement.lang).toBe('en-GB');
    expect(values.get('site.lang')).toBe('en-GB');
    expect(values.get('site.lang_source')).toBe('user');
    expect(document.cookie).toContain('dv_lang_entry=; Max-Age=0');
  });

  it('does not let a fresh English-entry signal override a different explicit locale URL', () => {
    const { document } = bootstrap({ path: '/fr/', cookie: 'dv_lang=en-GB; dv_lang_entry=en-GB' });
    expect(document.documentElement.lang).toBe('fr-FR');
  });

  it('negotiates the lighthouse experience locale too', () => {
    expect(bootstrap({ path: '/experiences/lighthouse' }).window.location.replace)
      .toHaveBeenCalledWith('/de/experiences/lighthouse');
  });
  it('remembers and cleans an explicit English query choice', () => {
    const { window, document, values } = bootstrap({ search: '?lang=en-GB&ref=demo' });
    expect(window.location.replace).toHaveBeenCalledWith('/?ref=demo');
    expect(document.cookie).toContain('dv_lang=en-GB');
    expect(values.get('site.lang_source')).toBe('user');
  });

  it('does not create a manual choice from an unsupported query', () => {
    const { values, document } = bootstrap({ search: '?lang=unknown', browser: ['ar'] });
    expect(values.get('site.lang_source')).toBe('ip');
    expect(document.cookie).toBe('');
  });

  it('keeps crawler rendering at the canonical root language', () => {
    const { window, document } = bootstrap({ userAgent: 'Googlebot' });
    expect(document.documentElement.lang).toBe('en-GB');
    expect(window.location.replace).not.toHaveBeenCalled();
  });

  it('does not redirect staff pages or untranslated legal documents', () => {
    for (const path of ['/admin', '/legal/privacy']) {
      const { window, document } = bootstrap({ path });
      expect(window.location.replace).not.toHaveBeenCalled();
      expect(document.documentElement.lang).toBe('en-GB');
    }
  });

  it('adds Chrome suppression and exactly one bootstrap, after charset', () => {
    const html = '<html lang="en"><head><meta charset="utf-8"></head><body></body></html>';
    const result = injectLocaleBootstrap(injectLocaleBootstrap(html));
    expect(result.match(/id="devocean-locale-bootstrap"/g)).toHaveLength(1);
    expect(result.match(/name="google" content="notranslate"/g)).toHaveLength(1);
    expect(result.indexOf('charset=')).toBeLessThan(result.indexOf('id="devocean-locale-bootstrap"'));
  });

  it('busts cached navigation and Marin loader URLs without duplicating queries', () => {
    const html = '<head></head><script src="/js/shared-nav.js?v=old"></script>' +
      '<script>var src="https://reception.example/widget-loader.js";</script>' +
      '<script src="/translations/accommodation-detail-i18n.js?v=4"></script>';
    const result = injectLocaleBootstrap(injectLocaleBootstrap(html));
    expect(result).toContain('/js/shared-nav.js?v=20261010-browser-first"');
    expect(result).toContain('/widget-loader.js?v=20261010-browser-first"');
    expect(result).toContain('/translations/accommodation-detail-i18n.js?v=20261010-browser-first"');
    expect(result).not.toContain('browser-first?v=');
  });
});

describe.each(['public/translations', 'translations'])('accommodation bridge (%s)', (folder) => {
  function bridge(lang = 'en-US', storageDisabled = false, stored = {}) {
    const source = readFileSync(new URL(`../../../${folder}/accommodation-detail-i18n.js`, import.meta.url), 'utf8');
    const values = new Map(Object.entries(stored));
    const context = {
      window: { __DEVOCEAN_LOCALE_BOOTSTRAPPED__: true, __DEVOCEAN_LOCALE__: lang, __CF_COUNTRY__: 'MZ' },
      document: { readyState: 'loading', addEventListener: vi.fn(), documentElement: { lang } },
      navigator: { languages: ['de-DE'] }, URLSearchParams,
      localStorage: {
        getItem(key) { if (storageDisabled) throw new Error('Disabled'); return values.get(key) || null; },
        setItem(key, value) { if (storageDisabled) throw new Error('Disabled'); values.set(key, value); },
      },
    };
    runInNewContext(source, context);
    return { context, values };
  }

  it.each(LOCALES.map(({ code }) => code))('retains the pre-paint locale %s', (code) => {
    const { context, values } = bridge(code);
    expect(runInNewContext('detectLanguage()', context)).toBe(code);
    expect(context.document.documentElement.lang).toBe(code);
    expect(values.has('site.lang')).toBe(false);
  });

  it('works without storage and still reads the IP currency', () => {
    const { context } = bridge('pt-PT', true);
    expect(runInNewContext('detectLanguage()', context)).toBe('pt-PT');
    expect(runInNewContext('detectCurrency()', context)).toBe('MZN');
  });

  it('keeps deliberate currency overrides but prefers current IP over an automatic cache', () => {
    const { context } = bridge('en-US', false, { 'site.currency': 'USD', 'site.currency.source': 'ip' });
    expect(runInNewContext('detectCurrency()', context)).toBe('MZN');
    const manual = bridge('en-US', false, { 'site.currency': 'USD', 'site.currency.source': 'user' });
    expect(runInNewContext('detectCurrency()', manual.context)).toBe('USD');
  });
});
