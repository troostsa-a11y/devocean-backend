import { getL10N } from '../i18n/loadTranslation';
import { ACCOMMODATION_TRANSLATIONS } from '../i18n/accommodationTranslations';
import { UNIT_BASE, EXP_BASE } from '../data/content';

export function localizeUnits(lang) {
  // Map language-region codes to base language keys for translations
  const langKey = 
    (lang === "en-US") ? "en-us" :
    (lang === "en-GB") ? "en" :
    (lang === "pt-PT" || lang === "pt-BR") ? "pt" :
    (lang === "af-ZA") ? "af" :
    (lang === "ja-JP") ? "ja" :
    (lang === "zh-CN") ? "zh" :
    (lang === "nl-NL") ? "nl" :
    (lang === "fr-FR") ? "fr" :
    (lang === "it-IT") ? "it" :
    (lang === "de-DE") ? "de" :
    (lang === "es-ES") ? "es" :
    lang;  // For sv, pl, ru, sw, zu that don't have region codes
  const tr = ACCOMMODATION_TRANSLATIONS[langKey] || ACCOMMODATION_TRANSLATIONS['en'] || {};
  
  return UNIT_BASE.map((u) => ({
    ...u,
    title: tr[u.key]?.title || u.title,
    short: tr[u.key]?.short || u.short,
    details: tr[u.key]?.details || u.details,
  }));
}

export function localizeExperiences(lang) {
  // Map language-region codes to translation keys
  // L10N uses full locale codes like "en-GB", "pt-PT", "nl-NL", etc.
  const langKey = 
    (lang === "en-US" || lang === "en-us") ? "en-US" :
    (lang === "en-GB" || lang === "en-gb" || lang === "en") ? "en-GB" :
    (lang === "pt-PT" || lang === "pt-BR" || lang === "pt") ? "pt-PT" :
    (lang === "af-ZA" || lang === "af") ? "af-ZA" :
    (lang === "ja-JP" || lang === "ja") ? "ja-JP" :
    (lang === "zh-CN" || lang === "zh") ? "zh-CN" :
    (lang === "nl-NL" || lang === "nl") ? "nl-NL" :
    (lang === "fr-FR" || lang === "fr") ? "fr-FR" :
    (lang === "it-IT" || lang === "it") ? "it-IT" :
    (lang === "de-DE" || lang === "de") ? "de-DE" :
    (lang === "es-ES" || lang === "es") ? "es-ES" :
    lang;  // For sv, pl, ru, sw, zu that don't have region codes
  
  const L10N = getL10N(langKey) || getL10N('en-GB');
  console.log('[DEBUG] localizeExperiences:', { lang, langKey, hasL10N: !!L10N, hasExperiences: !!L10N?.experiences });
  const tr = L10N?.experiences || {};
  return EXP_BASE.map((e) => ({
    ...e,
    title: tr[e.key]?.title || e.title,
    desc: tr[e.key]?.desc || e.desc,
  }));
}

export const toDDMMYYYY = (iso) => (iso ? iso.split("-").reverse().join("/") : "");

export const fromDDMMYYYY = (s) => {
  if (!s) return "";
  const m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
  if (!m) return "";
  const d = m[1].padStart(2, "0");
  const mo = m[2].padStart(2, "0");
  return `${m[3]}-${mo}-${d}`;
};

export const mapEmbed = (lat, lng, zoom = 13) =>
  `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;

export const directionsUrl = (lat, lng) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

// Convert Hotelrunner locale codes to ISO 639-1 two-letter codes (lowercase)
const localeToISO6391 = (locale) => {
  const mapping = {
    "en-GB": "en",
    "en-US": "en",
    "pt-PT": "pt",
    "pt-BR": "pt",
    "nl-NL": "nl",
    "fr-FR": "fr",
    "it-IT": "it",
    "de-DE": "de",
    "es-ES": "es",
    "ja-JP": "ja",
    "zh-CN": "zh",
    "af-ZA": "af",
    "sv": "sv",
    "pl": "pl",
    "ru": "ru",
    "zu": "zu",
    "sw": "sw"
  };
  return mapping[locale] || "en";
};

export const buildBookingUrl = (locale, currency, countryCode = null, ccToCurrency = {}) => {
  const lang = localeToISO6391(locale);
  return `/booking.html?lang=${lang}&cur=${currency}`;
};
