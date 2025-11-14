/**
 * Story Page i18n System
 * Standalone vanilla JavaScript translation system for story.html
 * Mirrors the React-based i18n logic from the main site
 */

// Supported languages (must match main site - Hotelrunner locale codes)
const SUPPORTED_LANGS = [
  "en-GB", "en-US", "pt-PT", "pt-BR", "nl-NL", "fr-FR", "it-IT", "de-DE", "es-ES", 
  "sv", "pl", "af-ZA", "zu", "sw", "ja-JP", "zh-CN", "ru"
];

// Map country codes to primary language (IP-based fallback)
const CC_TO_LANGUAGE = {
  // English-speaking countries
  US: "en-US", GB: "en-GB", IE: "en-GB", AU: "en-GB", NZ: "en-GB", CA: "en-GB", 
  ZA: "en-GB", NA: "en-GB", ZW: "en-GB", BW: "en-GB", NG: "en-GB", GH: "en-GB", ZM: "en-GB", MW: "en-GB", 
  SZ: "en-GB", LS: "en-GB", MU: "en-GB", SC: "en-GB", JM: "en-GB", TT: "en-GB", 
  BB: "en-GB", FJ: "en-GB", PG: "en-GB", SB: "en-GB", VU: "en-GB",
  
  // Portuguese-speaking countries
  PT: "pt-PT", BR: "pt-BR", MZ: "pt-BR", AO: "pt-BR",
  
  // Dutch-speaking countries
  NL: "nl-NL", BE: "nl-NL", SR: "nl-NL",
  
  // French-speaking countries  
  FR: "fr-FR", MC: "fr-FR", LU: "fr-FR", CH: "fr-FR", RE: "fr-FR", 
  SN: "fr-FR", CI: "fr-FR", CM: "fr-FR", DJ: "fr-FR", NC: "fr-FR", PF: "fr-FR",
  
  // Italian-speaking countries
  IT: "it-IT", SM: "it-IT", VA: "it-IT",
  
  // German-speaking countries
  DE: "de-DE", AT: "de-DE", LI: "de-DE",
  
  // Spanish-speaking countries
  ES: "es-ES", MX: "es-ES", AR: "es-ES", CO: "es-ES", PE: "es-ES", VE: "es-ES",
  CL: "es-ES", EC: "es-ES", GT: "es-ES", CU: "es-ES", BO: "es-ES", DO: "es-ES",
  HN: "es-ES", PY: "es-ES", SV: "es-ES", NI: "es-ES", CR: "es-ES", PA: "es-ES",
  UY: "es-ES", GQ: "es-ES",
  
  // Swedish-speaking countries
  SE: "sv", FI: "sv",
  
  // Polish-speaking countries
  PL: "pl",
  
  // Japanese-speaking countries
  JP: "ja-JP",
  
  // Chinese-speaking countries/regions
  CN: "zh-CN", HK: "zh-CN", TW: "zh-CN", SG: "zh-CN",
  
  // Russian-speaking countries
  RU: "ru", BY: "ru", KZ: "ru", UA: "ru", UZ: "ru", KG: "ru",
  
  // Swahili-speaking countries
  KE: "sw", TZ: "sw", UG: "sw",
};

// Comprehensive country-to-currency mapping (legal tender for each country)
const CC_TO_CURRENCY = {
  // Europe
  GB: "GBP", IE: "EUR", NL: "EUR", BE: "EUR", FR: "EUR", 
  DE: "EUR", IT: "EUR", ES: "EUR", PT: "EUR", AT: "EUR",
  FI: "EUR", SE: "SEK", PL: "PLN", GR: "EUR", NO: "NOK",
  DK: "DKK", CH: "CHF", CZ: "CZK", HU: "HUF", RO: "RON",
  RS: "RSD", HR: "EUR", SI: "EUR", BA: "BAM", BG: "BGN",
  SK: "EUR", EE: "EUR", LV: "EUR", LT: "EUR", MT: "EUR",
  CY: "EUR", LU: "EUR", IS: "ISK", LI: "CHF", MC: "EUR",
  UA: "UAH", BY: "BYN", MD: "MDL", AL: "ALL", MK: "MKD",
  ME: "EUR", XK: "EUR", AD: "EUR", SM: "EUR", VA: "EUR",
  
  // Africa
  ZA: "ZAR", MZ: "MZN", KE: "KES", TZ: "TZS", UG: "UGX",
  ZW: "USD", BW: "BWP", NA: "NAD", EG: "EGP", MA: "MAD",
  SZ: "SZL", RE: "EUR", MU: "MUR", SC: "SCR", LS: "LSL",
  ZM: "ZMW", MW: "MWK", AO: "AOA", GH: "GHS", NG: "NGN", 
  ET: "ETB", SD: "SDG", DZ: "DZD", TN: "TND", LY: "LYD", 
  SN: "XOF", CI: "XOF", CM: "XAF", RW: "RWF", BI: "BIF", 
  SO: "SOS", DJ: "DJF",
  
  // Americas
  US: "USD", CA: "CAD", MX: "MXN", BR: "BRL", AR: "ARS",
  CL: "CLP", CO: "COP", PE: "PEN", VE: "VES", EC: "USD",
  UY: "UYU", PY: "PYG", BO: "BOB", CR: "CRC", PA: "PAB",
  GT: "GTQ", HN: "HNL", SV: "USD", NI: "NIO", CU: "CUP",
  DO: "DOP", HT: "HTG", JM: "JMD", TT: "TTD", BB: "BBD",
  
  // Asia & Middle East
  CN: "CNY", JP: "JPY", KR: "KRW", IN: "INR", TH: "THB",
  SG: "SGD", MY: "MYR", ID: "IDR", PH: "PHP", VN: "VND",
  AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD", BH: "BHD",
  OM: "OMR", IL: "ILS", JO: "JOD", LB: "LBP", TR: "TRY",
  PK: "PKR", BD: "BDT", LK: "LKR", NP: "NPR", MM: "MMK",
  KH: "KHR", LA: "LAK", MN: "MNT", KZ: "KZT", UZ: "UZS",
  RU: "RUB",
  
  // Oceania
  AU: "AUD", NZ: "NZD", FJ: "FJD", PG: "PGK", NC: "XPF",
  PF: "XPF", WS: "WST", TO: "TOP", VU: "VUV", SB: "SBD",
};

// Map country codes to continents (comprehensive)
const CC_TO_CONTINENT = {
  // Europe
  GB: "europe", IE: "europe", NL: "europe", BE: "europe", FR: "europe", 
  DE: "europe", IT: "europe", ES: "europe", PT: "europe", AT: "europe",
  FI: "europe", SE: "europe", PL: "europe", GR: "europe", NO: "europe",
  DK: "europe", CH: "europe", CZ: "europe", HU: "europe", RO: "europe",
  RS: "europe", HR: "europe", SI: "europe", BA: "europe", BG: "europe",
  SK: "europe", EE: "europe", LV: "europe", LT: "europe", MT: "europe",
  CY: "europe", LU: "europe", IS: "europe", LI: "europe", MC: "europe",
  UA: "europe", BY: "europe", MD: "europe", AL: "europe", MK: "europe",
  ME: "europe", XK: "europe", AD: "europe", SM: "europe", VA: "europe",
  
  // Africa
  ZA: "africa", MZ: "africa", KE: "africa", TZ: "africa", UG: "africa",
  ZW: "africa", BW: "africa", NA: "africa", EG: "africa", MA: "africa",
  SZ: "africa", RE: "africa", MU: "africa", SC: "africa", LS: "africa",
  ZM: "africa", MW: "africa", AO: "africa", GH: "africa", NG: "africa", 
  ET: "africa", SD: "africa", DZ: "africa", TN: "africa", LY: "africa", 
  SN: "africa", CI: "africa", CM: "africa", RW: "africa", BI: "africa", 
  SO: "africa", DJ: "africa",
  
  // Americas
  US: "americas", CA: "americas", MX: "americas", BR: "americas", AR: "americas",
  CL: "americas", CO: "americas", PE: "americas", VE: "americas", EC: "americas",
  UY: "americas", PY: "americas", BO: "americas", CR: "americas", PA: "americas",
  GT: "americas", HN: "americas", SV: "americas", NI: "americas", CU: "americas",
  DO: "americas", HT: "americas", JM: "americas", TT: "americas", BB: "americas",
  
  // Asia & Middle East
  CN: "asia", JP: "asia", KR: "asia", IN: "asia", TH: "asia",
  SG: "asia", MY: "asia", ID: "asia", PH: "asia", VN: "asia",
  AE: "asia", SA: "asia", QA: "asia", KW: "asia", BH: "asia",
  OM: "asia", IL: "asia", JO: "asia", LB: "asia", TR: "asia",
  PK: "asia", BD: "asia", LK: "asia", NP: "asia", MM: "asia",
  KH: "asia", LA: "asia", MN: "asia", KZ: "asia", UZ: "asia",
  RU: "asia",
  
  // Oceania
  AU: "oceania", NZ: "oceania", FJ: "oceania", PG: "oceania", NC: "oceania",
  PF: "oceania", WS: "oceania", TO: "oceania", VU: "oceania", SB: "oceania",
};

// Booking engine locale mapping (story page specific)
const STORY_LOCALE_BY_LANG = {
  "en-GB": "en-GB", "en-US": "en-US", "pt-PT": "pt-PT", "pt-BR": "pt-BR", "nl-NL": "nl-NL",
  "fr-FR": "fr-FR", "it-IT": "it-IT", "de-DE": "de-DE", "es-ES": "es-ES", "sv": "sv", "pl": "pl", 
  "ja-JP": "ja-JP", "zh-CN": "zh-CN", "ru": "ru", "af-ZA": "af-ZA", "zu": "en-GB", "sw": "sw",
};

/**
 * Get Cloudflare country code from global variable
 */
function getCountryCode() {
  return window.__CF_COUNTRY__ || null;
}

/**
 * Pick initial currency based on visitor's country
 * Checks localStorage first for consistency with main page, but validates against current location
 */
function pickInitialCurrency() {
  const cc = getCountryCode();
  
  // Check localStorage first (set by main page), but verify country code matches
  const stored = localStorage.getItem("site.currency");
  const storedCountry = localStorage.getItem("site.currency.country");
  
  // If cached currency exists AND country code matches, use cached value
  if (stored && stored.length === 3 && storedCountry === cc) {
    return stored;
  }
  
  // Otherwise, detect fresh from IP
  if (cc && CC_TO_CURRENCY[cc]) {
    const detected = CC_TO_CURRENCY[cc];
    // Store for consistency with country code
    localStorage.setItem("site.currency", detected);
    localStorage.setItem("site.currency.country", cc);
    return detected;
  }
  
  // Default to USD if country detection fails
  localStorage.setItem("site.currency", "USD");
  localStorage.setItem("site.currency.country", cc || "unknown");
  return "USD";
}

/**
 * Pick initial region based on visitor's country
 */
function pickInitialRegion() {
  const cc = getCountryCode();
  if (cc && CC_TO_CONTINENT[cc]) {
    return CC_TO_CONTINENT[cc];
  }
  return "europe"; // Default to Europe
}

/**
 * Get booking locale - direct mapping from language code
 * Note: Hotelrunner supports pt-PT and pt-BR
 */
function getBookingLocale(lang, currency, countryCode) {
  // Direct mapping for all languages (including pt-PT and pt-BR)
  if (STORY_LOCALE_BY_LANG[lang]) {
    return STORY_LOCALE_BY_LANG[lang];
  }
  
  // Fallback to UK English
  return "en-GB";
}

/**
 * Build booking URL - map to new static booking pages
 */
function buildBookingUrl(locale, currency) {
  // Map locale to booking page filename (EN.html, DE.html, etc.)
  const langMap = {
    'en-GB': 'EN', 'en-US': 'EN', 'en': 'EN',
    'de-DE': 'DE', 'de': 'DE',
    'pt-PT': 'PT', 'pt-BR': 'PT', 'pt': 'PT',
    'fr-FR': 'FR', 'fr': 'FR',
    'it-IT': 'IT', 'it': 'IT',
    'nl-NL': 'NL', 'nl': 'NL',
    'es-ES': 'ES', 'es': 'ES',
    'ja-JP': 'JA', 'ja': 'JA',
    'zh-CN': 'ZH', 'zh': 'ZH',
    'ru': 'RU',
    'sv': 'SV',
    'pl': 'PL',
    'af-ZA': 'AF', 'af': 'AF',
    'zu': 'ZU',
    'sw': 'SW'
  };
  const bookingPage = langMap[locale] || 'EN';
  return `/book/${bookingPage}.html?currency=${currency}`;
}

/**
 * Normalize language code to Hotelrunner locale format
 */
function normLang(raw) {
  if (!raw) return "en-GB";
  let s = String(raw).toLowerCase();
  
  // Preserve full Hotelrunner locale codes with proper capitalization
  if (s === "en-gb" || s === "en") return "en-GB";
  if (s === "en-us") return "en-US";
  if (s === "pt-pt") return "pt-PT";
  if (s === "pt-br") return "pt-BR";
  if (s === "pt-mz") return "pt-BR"; // Mozambique uses Brazilian variant
  if (s === "nl-nl" || s === "nl") return "nl-NL";
  if (s === "fr-fr" || s === "fr") return "fr-FR";
  if (s === "it-it" || s === "it") return "it-IT";
  if (s === "de-de" || s === "de") return "de-DE";
  if (s === "es-es" || s === "es") return "es-ES";
  if (s === "ja-jp" || s === "ja") return "ja-JP";
  if (s === "zh-cn" || s === "zh") return "zh-CN";
  if (s === "af-za" || s === "af") return "af-ZA";
  if (s === "sv") return "sv";
  if (s === "pl") return "pl";
  if (s === "ru") return "ru";
  if (s === "zu") return "zu";
  if (s === "sw") return "sw";
  
  return "en-GB";
}

/**
 * Get URL parameter by name
 */
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Pick initial language using multi-tier detection
 * Priority: URL parameter → localStorage → browser language → IP-based country mapping → region-aware English fallback
 */
function pickInitialLang() {
  // Priority 1: Check URL parameter (for navigation from main site)
  const urlLang = getUrlParam('lang');
  if (urlLang) {
    const normalized = normLang(urlLang);
    if (SUPPORTED_LANGS.includes(normalized)) {
      // Store in localStorage for consistency
      localStorage.setItem("site.lang", normalized);
      return normalized;
    }
  }

  // Priority 2: Check localStorage
  const stored = localStorage.getItem("site.lang");
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;

  // Get country code for IP-based fallback
  const cc = getCountryCode();

  // Priority 3: Check browser language preferences
  const list = (navigator.languages && navigator.languages.length)
    ? navigator.languages
    : [navigator.language].filter(Boolean);

  for (const l of list) {
    const lower = String(l || "").toLowerCase();
    
    // Normalize browser language to our Hotelrunner codes
    const normalized = normLang(lower);
    if (SUPPORTED_LANGS.includes(normalized)) return normalized;
  }

  // Priority 4: Use IP-based country → language mapping
  // This catches visitors with non-local browser settings (e.g., English browser in Japan)
  if (cc && CC_TO_LANGUAGE[cc]) {
    return CC_TO_LANGUAGE[cc];
  }

  // Final fallback to region-aware English
  // Americas → US English, others → UK English
  const continent = cc ? CC_TO_CONTINENT[cc] : null;
  if (continent === "americas") {
    return "en-US";
  }
  return "en-GB"; // UK English for Europe, Asia, Oceania, Africa
}

/**
 * Load translation file
 */
async function loadTranslations(lang) {
  try {
    const response = await fetch('/translations/story-translations-template.json');
    if (!response.ok) throw new Error('Failed to load translations');
    const data = await response.json();
    
    // Story JSON keys now match our Hotelrunner codes exactly (1:1 mapping)
    // en-GB, en-US, pt-PT, pt-BR, nl-NL, fr-FR, it-IT, de-DE, es-ES, ja-JP, zh-CN, af-ZA, sv, pl, ru, zu, sw
    console.log('Loading story translations for:', lang);
    const translations = data[lang];
    if (!translations) {
      console.warn('No translations found for', lang, 'falling back to English');
    }
    return translations || data['en-GB']; // Fallback to UK English if language not found
  } catch (error) {
    console.error('Error loading translations:', error);
    return null;
  }
}

/**
 * Get nested value from object using dot notation (e.g., "hero.title")
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Apply translations to DOM
 */
function applyTranslations(translations) {
  if (!translations) return;

  // Find all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const value = getNestedValue(translations, key);
    
    if (value) {
      // Check if element should use innerHTML (for content with <strong> tags)
      if (element.hasAttribute('data-i18n-html')) {
        element.innerHTML = value;
      } else {
        element.textContent = value;
      }
    }
  });
}

/**
 * Update booking button URL with detected locale and currency
 * Now uses the smart currency-based locale mapping
 */
function updateBookingUrl(lang) {
  const currency = pickInitialCurrency();
  const countryCode = getCountryCode();
  const bookingLocale = getBookingLocale(lang, currency, countryCode);
  const bookingUrl = buildBookingUrl(bookingLocale, currency);
  
  console.log('Story page booking:', { lang, currency, countryCode, bookingLocale, bookingUrl });
  
  // Update the Book button href
  const bookButton = document.querySelector('a[data-testid="button-book-now"]');
  if (bookButton) {
    bookButton.href = bookingUrl;
  }
}

/**
 * Initialize i18n system
 */
async function initI18n() {
  const lang = pickInitialLang();
  console.log('Story page detected language:', lang);
  
  const translations = await loadTranslations(lang);
  if (translations) {
    applyTranslations(translations);
  }
  
  // Update booking URL with detected locale and currency
  updateBookingUrl(lang);
  
  // Add lang attribute to html element
  document.documentElement.lang = lang;
}

/**
 * Handle navigation to main page with #stay anchor
 * Ensures proper scroll after page load
 */
function setupStayNavigation() {
  const stayLink = document.querySelector('a[href="/#stay"]');
  if (stayLink) {
    stayLink.addEventListener('click', (e) => {
      e.preventDefault();
      // Navigate to main page with hash, then let the main page handle scroll
      window.location.href = '/#stay';
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initI18n();
    setupStayNavigation();
  });
} else {
  initI18n();
  setupStayNavigation();
}
