import { LOCALES } from './localeCatalog.js';
import { COUNTRY_LANGUAGES, resolveVisitorLanguage } from './visitorLanguage.js';
import { CC_TO_CURRENCY, resolveVisitorCurrency } from './visitorCurrency.js';

// Only routes with native language-aware UI may negotiate a locale URL.
// Legal documents, staff pages, APIs and unknown paths are deliberately absent.
const LOCALE_DOCUMENTS = [
  '/', '/story', '/safari', '/comfort', '/cottage', '/chalet', '/why-ponta',
  '/ponta-do-ouro', '/ponta-do-ouro-accommodation', '/safari-tents-ponta-do-ouro',
  '/diving-dolphin-accommodation', '/getting-to-ponta-do-ouro',
  '/ponta-do-ouro-without-4x4', '/devocean-lodge-meals',
  '/experiences/dolphins', '/experiences/diving', '/experiences/seafari',
  '/experiences/safari', '/experiences/fishing', '/experiences/surfing', '/experiences/lighthouse',
  '/book-direct', '/booking-confirmed', '/gift-vouchers', '/gift-confirmed',
];

// No outer references: this runs before React and on standalone HTML pages.
function initializeVisitorLocale(resolve, resolveCurrency, locales, countries, currencies, documentPaths) {
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* preferences can be unavailable */ } },
  };
  const params = new URLSearchParams(window.location.search);
  const first = window.location.pathname.split('/').filter(Boolean)[0]?.toLowerCase();
  const pathLocale = locales.find((locale) => locale.path && locale.path === first);
  // Keep helpers as object methods: Wrangler's keepNames compilation adds
  // external naming helpers to nested declarations, breaking toString() embeds.
  const operations = {
    getBasePath(pathname) {
      const firstSegment = pathname.split('/').filter(Boolean)[0]?.toLowerCase();
      const locale = locales.find((item) => item.path && item.path === firstSegment);
      return (locale ? pathname.slice(locale.path.length + 1) || '/' : pathname)
        .replace(/\.html$/i, '').replace(/\/+$/, '') || '/';
    },
    rememberLanguage(lang) {
      storage.set('site.lang', lang);
      storage.set('site.lang_source', 'user');
      try {
        document.cookie = `dv_lang=${encodeURIComponent(lang)}; Max-Age=31536000; Path=/; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
      } catch { /* localStorage remains usable when cookies are unavailable */ }
    },
    normalizeLanguage(value) {
      const result = resolve({ browserLanguages: [value] }, locales, {});
      return result.source === 'browser' ? result.lang : null;
    },
    setSiteLocale({ lang, currency } = {}) {
      // Currency is independent: a language selection must not change it.
      if (currency && /^[A-Za-z]{3}$/.test(currency)) {
        storage.set('site.currency', currency.toUpperCase());
        storage.set('site.currency.source', 'user');
      }
      const normalized = operations.normalizeLanguage(lang);
      if (!normalized) return;
      operations.rememberLanguage(normalized);
      const locale = locales.find((item) => item.code === normalized);
      const currentBase = operations.getBasePath(window.location.pathname);
      const path = locale.path ? `/${locale.path}${currentBase === '/' ? '/' : currentBase}` : currentBase;
      if (documentPaths.includes(currentBase)) {
        window.location.assign(path + window.location.search + window.location.hash);
      }
    },
  };
  const basePath = operations.getBasePath(window.location.pathname);
  const canLocalize = documentPaths.includes(basePath);
  const isCrawler = /bot|crawler|spider|slurp|facebookexternalhit|bingpreview/i.test(navigator.userAgent || '');
  let cookieLanguage = null;
  let entryLanguage = null;
  try {
    const cookie = document.cookie.match(/(?:^|;\s*)dv_lang=([^;]*)/);
    cookieLanguage = cookie ? decodeURIComponent(cookie[1]) : null;
    const entry = document.cookie.match(/(?:^|;\s*)dv_lang_entry=([^;]*)/);
    entryLanguage = entry ? operations.normalizeLanguage(decodeURIComponent(entry[1])) : null;
  } catch { /* malformed or disabled cookies */ }
  const storedLanguage = storage.get('site.lang');
  const storedSource = storage.get('site.lang_source');
  const preferences = {
    pathname: window.location.pathname,
    // A just-redirected explicit choice outranks an older saved preference.
    storedLanguage: entryLanguage || (storedSource === 'user' ? storedLanguage : cookieLanguage),
    storedSource: entryLanguage || storedSource === 'user' || cookieLanguage ? 'user' : null,
    browserLanguages: navigator.languages?.length ? navigator.languages : [navigator.language].filter(Boolean),
    countryCode: window.__CF_COUNTRY__,
  };
  const selected = isCrawler
    ? { lang: pathLocale?.code || locales[0].code, source: 'url' }
    : resolve(preferences, locales, countries);
  // A language URL wins, but visiting the chosen URL must not erase an
  // existing manual preference (including English's unprefixed URL).
  const remembered = resolve({
    storedLanguage: preferences.storedLanguage, storedSource: preferences.storedSource,
  }, locales, {});
  if (selected.lang === remembered.lang && remembered.source === 'user') {
    selected.source = 'user';
  }

  window.__DEVOCEAN_LOCALE_API__ = {
    rememberLanguage: operations.rememberLanguage,
    normalizeLanguage: operations.normalizeLanguage,
    get basePath() { return operations.getBasePath(window.location.pathname); },
  };
  window.setSiteLocale = operations.setSiteLocale;
  const selectedCurrency = resolveCurrency({
    storedCurrency: storage.get('site.currency'),
    storedSource: storage.get('site.currency.source'),
    storedCountry: storage.get('site.currency.country'),
    browserLanguages: preferences.browserLanguages,
    countryCode: preferences.countryCode,
  }, currencies);
  storage.set('site.currency', selectedCurrency.currency);
  storage.set('site.currency.source', selectedCurrency.source);
  storage.set('site.currency.country', selectedCurrency.country || '');
  if (!canLocalize) return;

  if (entryLanguage) {
    if (selected.lang === entryLanguage) operations.rememberLanguage(selected.lang);
    try {
      document.cookie = `dv_lang_entry=; Max-Age=0; Path=/; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
    } catch { /* short-lived entry cookie will expire even if clearing fails */ }
  }
  window.__DEVOCEAN_LOCALE__ = selected.lang;
  window.__DEVOCEAN_LOCALE_SOURCE__ = selected.source;
  window.__DEVOCEAN_LOCALE_BOOTSTRAPPED__ = true;
  document.documentElement.setAttribute('lang', selected.lang);
  storage.set('site.lang', selected.lang);
  storage.set('site.lang_source', selected.source);
  const locale = locales.find((item) => item.code === selected.lang);
  const targetPath = locale.path ? `/${locale.path}${basePath === '/' ? '/' : basePath}` : basePath;
  const search = params.toString();
  const target = targetPath + (search ? `?${search}` : '') + window.location.hash;
  const current = window.location.pathname + window.location.search + window.location.hash;
  if (!isCrawler && !pathLocale && target !== current) {
    // No English/IP-language flash while negotiating the first locale URL.
    document.documentElement.style.visibility = 'hidden';
    window.setTimeout(() => { document.documentElement.style.visibility = ''; }, 2500);
    window.location.replace(target);
  }
}

export function localeBootstrapScript() {
  const data = [LOCALES, COUNTRY_LANGUAGES, CC_TO_CURRENCY, LOCALE_DOCUMENTS]
    .map((value) => JSON.stringify(value).replace(/</g, '\\u003c'));
  return `<script id="devocean-locale-bootstrap">(${initializeVisitorLocale.toString()})(${resolveVisitorLanguage.toString()},${resolveVisitorCurrency.toString()},${data.join(',')});</script>`;
}

export function injectLocaleBootstrap(html) {
  const hints = '<meta name="google" content="notranslate" />';
  let output = html;
  if (!/<meta\b[^>]*name=["']google["'][^>]*content=["']notranslate["']/i.test(output)) {
    output = output.replace('<head>', `<head>${hints}`);
  }
  if (!output.includes('id="devocean-locale-bootstrap"')) {
    // Keep the encoding declaration in the first 1024 bytes of the document.
    const script = localeBootstrapScript();
    output = /<meta\b[^>]*charset=[^>]*>/i.test(output)
      ? output.replace(/<meta\b[^>]*charset=[^>]*>/i, (tag) => tag + script)
      : output.replace('<head>', `<head>${script}`);
  }
  // These assets keep stable filenames, so old browser/edge caches need a new
  // request URL too. Covers both script tags and inline widget-loader imports.
  output = output.replace(
    /(\/(?:js\/shared-nav|translations\/(?:accommodation-detail|story|meals)-i18n|legal\/legal-i18n)\.js)(?:\?[^"'<>\s]*)?/g,
    '$1?v=20261027-locale-paths',
  ).replace(
    /(\/widget-loader\.js)(?:\?[^"'<>\s]*)?/g,
    '$1?v=20261010-browser-first',
  );
  return output;
}
