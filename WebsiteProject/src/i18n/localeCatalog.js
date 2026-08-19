/**
 * The public locale contract for devoceanlodge.com.
 *
 * English (UK) keeps the historical root URLs. Every other locale gets a
 * lowercase, shareable path prefix. This file deliberately has no React or
 * browser dependencies because Cloudflare Pages middleware imports it too.
 */
export const DEFAULT_LOCALE = 'en-GB';

export const LOCALES = [
  { code: 'en-GB', path: '',        hreflang: 'en-GB',   label: 'English (UK)' },
  { code: 'en-US', path: 'en-us',   hreflang: 'en-US',   label: 'English (US)' },
  { code: 'pt-PT', path: 'pt-pt',   hreflang: 'pt-PT',   label: 'Português (Portugal)' },
  { code: 'pt-BR', path: 'pt-br',   hreflang: 'pt-BR',   label: 'Português (Brasil)' },
  { code: 'nl-NL', path: 'nl',      hreflang: 'nl-NL',   label: 'Nederlands' },
  { code: 'fr-FR', path: 'fr',      hreflang: 'fr-FR',   label: 'Français' },
  { code: 'it-IT', path: 'it',      hreflang: 'it-IT',   label: 'Italiano' },
  { code: 'de-DE', path: 'de',      hreflang: 'de-DE',   label: 'Deutsch' },
  { code: 'es-ES', path: 'es',      hreflang: 'es-ES',   label: 'Español' },
  { code: 'sv',    path: 'sv',      hreflang: 'sv',      label: 'Svenska' },
  { code: 'pl',    path: 'pl',      hreflang: 'pl',      label: 'Polski' },
  { code: 'ro',    path: 'ro',      hreflang: 'ro',      label: 'Română' },
  { code: 'sr',    path: 'sr',      hreflang: 'sr',      label: 'Srpski' },
  { code: 'hr',    path: 'hr',      hreflang: 'hr',      label: 'Hrvatski' },
  { code: 'cs',    path: 'cs',      hreflang: 'cs',      label: 'Čeština' },
  { code: 'tr',    path: 'tr',      hreflang: 'tr',      label: 'Türkçe' },
  { code: 'ja-JP', path: 'ja',      hreflang: 'ja-JP',   label: '日本語' },
  { code: 'zh-CN', path: 'zh-hans', hreflang: 'zh-Hans', label: '中文（简体）' },
  { code: 'ru',    path: 'ru',      hreflang: 'ru',      label: 'Русский' },
  { code: 'af-ZA', path: 'af',      hreflang: 'af-ZA',   label: 'Afrikaans' },
  { code: 'zu',    path: 'zu',      hreflang: 'zu',      label: 'isiZulu' },
  { code: 'sw',    path: 'sw',      hreflang: 'sw',      label: 'Kiswahili' },
];

const BY_CODE = new Map(LOCALES.map((locale) => [locale.code.toLowerCase(), locale]));
const BY_PATH = new Map(LOCALES.filter((locale) => locale.path).map((locale) => [locale.path, locale]));

const LEGACY_CODES = {
  en: 'en-GB',
  'en-gb': 'en-GB',
  'en-us': 'en-US',
  pt: 'pt-PT',
  'pt-pt': 'pt-PT',
  'pt-br': 'pt-BR',
  nl: 'nl-NL',
  fr: 'fr-FR',
  it: 'it-IT',
  de: 'de-DE',
  es: 'es-ES',
  'sv-se': 'sv',
  'pl-pl': 'pl',
  'ja-jp': 'ja-JP',
  'zh-cn': 'zh-CN',
  zh: 'zh-CN',
  'ru-ru': 'ru',
  'af-za': 'af-ZA',
  'zu-za': 'zu',
  'sw-tz': 'sw',
};

export function normalizeLocale(value) {
  if (!value) return null;
  const key = String(value).trim().toLowerCase();
  return BY_CODE.get(key)?.code || (LEGACY_CODES[key] || null);
}

export function getLocale(value) {
  const normalized = normalizeLocale(value);
  return normalized ? BY_CODE.get(normalized.toLowerCase()) : null;
}

export function localeFromPath(pathname = '/') {
  const firstSegment = String(pathname).split('/').filter(Boolean)[0]?.toLowerCase();
  return firstSegment ? (BY_PATH.get(firstSegment) || null) : null;
}

export function stripLocalePrefix(pathname = '/') {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const locale = localeFromPath(path);
  if (!locale) return path;
  const remainder = path.slice(locale.path.length + 1);
  return remainder || '/';
}

export function localizedPath(pathname = '/', localeCode = DEFAULT_LOCALE) {
  const locale = getLocale(localeCode) || getLocale(DEFAULT_LOCALE);
  const basePath = stripLocalePrefix(pathname);
  if (!locale.path) return basePath;
  return basePath === '/' ? `/${locale.path}/` : `/${locale.path}${basePath}`;
}

export function localizedUrl(pathname, localeCode, search = '', hash = '') {
  const normalizedSearch = search && search !== '?' ? (search.startsWith('?') ? search : `?${search}`) : '';
  const normalizedHash = hash && hash !== '#' ? (hash.startsWith('#') ? hash : `#${hash}`) : '';
  return `${localizedPath(pathname, localeCode)}${normalizedSearch}${normalizedHash}`;
}

export function allHreflangPaths(pathname = '/') {
  return LOCALES.map((locale) => ({
    ...locale,
    pathname: localizedPath(pathname, locale.code),
  }));
}