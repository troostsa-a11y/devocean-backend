import { LOCALES } from './localeCatalog.js';

// IP is a fallback for language, not a proxy for the visitor's preference.
export const COUNTRY_LANGUAGES = {
  US: 'en-US', GB: 'en-GB', IE: 'en-GB', AU: 'en-GB', NZ: 'en-GB', CA: 'en-GB',
  ZA: 'en-GB', NA: 'en-GB', ZW: 'en-GB', BW: 'en-GB', NG: 'en-GB', GH: 'en-GB',
  ZM: 'en-GB', MW: 'en-GB', SZ: 'en-GB', LS: 'en-GB', MU: 'en-GB', SC: 'en-GB',
  JM: 'en-GB', TT: 'en-GB', BB: 'en-GB', FJ: 'en-GB', PG: 'en-GB', SB: 'en-GB', VU: 'en-GB',
  PT: 'pt-PT', BR: 'pt-BR', MZ: 'pt-BR', AO: 'pt-BR',
  NL: 'nl-NL', BE: 'nl-NL', SR: 'nl-NL',
  FR: 'fr-FR', MC: 'fr-FR', LU: 'fr-FR', CH: 'fr-FR', RE: 'fr-FR',
  SN: 'fr-FR', CI: 'fr-FR', CM: 'fr-FR', DJ: 'fr-FR', NC: 'fr-FR', PF: 'fr-FR',
  IT: 'it-IT', SM: 'it-IT', VA: 'it-IT',
  DE: 'de-DE', AT: 'de-DE', LI: 'de-DE',
  ES: 'es-ES', MX: 'es-ES', AR: 'es-ES', CO: 'es-ES', PE: 'es-ES', VE: 'es-ES',
  CL: 'es-ES', EC: 'es-ES', GT: 'es-ES', CU: 'es-ES', BO: 'es-ES', DO: 'es-ES',
  HN: 'es-ES', PY: 'es-ES', SV: 'es-ES', NI: 'es-ES', CR: 'es-ES', PA: 'es-ES', UY: 'es-ES', GQ: 'es-ES',
  SE: 'sv', FI: 'sv', PL: 'pl', RO: 'ro', MD: 'ro', RS: 'sr', ME: 'sr', BA: 'sr', HR: 'hr', CZ: 'cs', TR: 'tr',
  JP: 'ja-JP', CN: 'zh-CN', HK: 'zh-CN', TW: 'zh-CN', SG: 'zh-CN',
  RU: 'ru', BY: 'ru', KZ: 'ru', UA: 'ru', UZ: 'ru', KG: 'ru', KE: 'sw', TZ: 'sw', UG: 'sw',
};

/**
 * Self-contained so the exact same resolver can run in an early inline script.
 * Unsupported browser languages return null, rather than prematurely becoming
 * English and preventing the IP fallback or the next browser preference.
 */
export function resolveVisitorLanguage(
  preferences = {},
  locales = LOCALES,
  countryLanguages = COUNTRY_LANGUAGES,
) {
  // Object methods retain their native names without esbuild's external
  // __name helper, which would otherwise leak into the serialized function.
  const codes = {
    normalize(value) {
      if (!value) return null;
      const key = String(value).trim().toLowerCase().replace(/_/g, '-');
      const exact = locales.find((locale) =>
        locale.code.toLowerCase() === key ||
        locale.hreflang.toLowerCase() === key ||
        (locale.path && locale.path === key));
      if (exact) return exact.code;
      if (key === 'ptmz' || key === 'pt-mz') return 'pt-BR';
      if (key === 'cz') return 'cs';
      const base = key.split('-')[0];
      return locales.find((locale) => locale.code.toLowerCase().split('-')[0] === base)?.code || null;
    },
  };

  const firstSegment = String(preferences.pathname || '/').split('/').filter(Boolean)[0]?.toLowerCase();
  const pathLocale = locales.find((locale) => locale.path && locale.path === firstSegment);
  if (pathLocale) return { lang: pathLocale.code, source: 'url' };

  const manualLocale = preferences.storedSource === 'user' && codes.normalize(preferences.storedLanguage);
  if (manualLocale) return { lang: manualLocale, source: 'user' };

  for (const language of preferences.browserLanguages || []) {
    const supported = codes.normalize(language);
    if (supported) return { lang: supported, source: 'browser' };
  }

  const country = String(preferences.countryCode || '').toUpperCase();
  const ipLocale = codes.normalize(countryLanguages[country]);
  if (ipLocale) return { lang: ipLocale, source: 'ip' };

  return { lang: locales[0].code, source: 'default' };
}
