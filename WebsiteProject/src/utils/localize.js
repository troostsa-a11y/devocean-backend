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
    // English variants
    "en-GB": "en", "en-US": "en", "en-AU": "en", "en-NZ": "en", "en-CA": "en", "en-ZA": "en",
    
    // Portuguese variants
    "pt-PT": "pt", "pt-BR": "pt", "pt-MZ": "pt", "pt-AO": "pt",
    
    // Dutch variants
    "nl-NL": "nl", "nl-BE": "nl", "nl-SR": "nl",
    
    // French variants
    "fr-FR": "fr", "fr-BE": "fr", "fr-CH": "fr", "fr-CA": "fr", "fr-MC": "fr", "fr-LU": "fr",
    
    // Italian variants
    "it-IT": "it", "it-CH": "it",
    
    // German variants
    "de-DE": "de", "de-AT": "de", "de-CH": "de", "de-LI": "de",
    
    // Spanish variants
    "es-ES": "es", "es-MX": "es", "es-AR": "es", "es-CO": "es", "es-PE": "es", "es-VE": "es",
    "es-CL": "es", "es-EC": "es", "es-GT": "es", "es-CU": "es", "es-BO": "es", "es-DO": "es",
    "es-HN": "es", "es-PY": "es", "es-SV": "es", "es-NI": "es", "es-CR": "es", "es-PA": "es",
    "es-UY": "es", "es-GQ": "es",
    
    // Swedish variants
    "sv": "sv", "sv-SE": "sv", "sv-FI": "sv",
    
    // Polish
    "pl": "pl", "pl-PL": "pl",
    
    // Japanese variants
    "ja-JP": "ja", "ja": "ja",
    
    // Chinese variants
    "zh-CN": "zh", "zh-HK": "zh", "zh-TW": "zh", "zh-SG": "zh", "zh": "zh",
    
    // Russian variants
    "ru": "ru", "ru-RU": "ru", "ru-BY": "ru", "ru-KZ": "ru", "ru-UA": "ru", "ru-UZ": "ru", "ru-KG": "ru",
    
    // Afrikaans variants
    "af-ZA": "af", "af": "af",
    
    // Zulu variants
    "zu": "zu", "zu-ZA": "zu",
    
    // Swahili variants
    "sw": "sw", "sw-KE": "sw", "sw-TZ": "sw", "sw-UG": "sw"
  };
  return mapping[locale] || "en";
};

export const buildBookingUrl = (locale, currency, countryCode = null, ccToCurrency = {}) => {
  const lang = localeToISO6391(locale);
  
  // Use static EN-GB.html for English
  if (lang === 'en') {
    return `/book/EN-GB.html?currency=${currency}`;
  }
  
  // Use dynamic booking page for other languages
  return `/booking.html?lang=${lang}&cur=${currency}`;
};
