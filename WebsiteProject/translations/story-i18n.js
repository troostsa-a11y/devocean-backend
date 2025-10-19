/**
 * Story Page i18n System
 * Standalone vanilla JavaScript translation system for story.html
 * Mirrors the React-based i18n logic from the main site
 */

// Supported languages (must match main site)
const SUPPORTED_LANGS = [
  "en", "en-us", "pt", "nl", "fr", "it", "de", "es", 
  "sv", "pl", "af-za", "zu", "sw", "ja", "zh", "ru"
];

// Map country codes to primary language (IP-based fallback)
const CC_TO_LANGUAGE = {
  // English-speaking countries
  US: "en-us", GB: "en", IE: "en", AU: "en", NZ: "en", CA: "en", 
  ZA: "en", NA: "en", ZW: "en", BW: "en", NG: "en", GH: "en", ZM: "en", MW: "en", 
  SZ: "en", LS: "en", MU: "en", SC: "en", JM: "en", TT: "en", 
  BB: "en", FJ: "en", PG: "en", SB: "en", VU: "en",
  
  // Portuguese-speaking countries
  PT: "pt", BR: "pt", MZ: "pt", AO: "pt",
  
  // Dutch-speaking countries
  NL: "nl", BE: "nl", SR: "nl",
  
  // French-speaking countries  
  FR: "fr", MC: "fr", LU: "fr", CH: "fr", RE: "fr", 
  SN: "fr", CI: "fr", CM: "fr", DJ: "fr", NC: "fr", PF: "fr",
  
  // Italian-speaking countries
  IT: "it", SM: "it", VA: "it",
  
  // German-speaking countries
  DE: "de", AT: "de", LI: "de",
  
  // Spanish-speaking countries
  ES: "es", MX: "es", AR: "es", CO: "es", PE: "es", VE: "es",
  CL: "es", EC: "es", GT: "es", CU: "es", BO: "es", DO: "es",
  HN: "es", PY: "es", SV: "es", NI: "es", CR: "es", PA: "es",
  UY: "es", GQ: "es",
  
  // Swedish-speaking countries
  SE: "sv", FI: "sv",
  
  // Polish-speaking countries
  PL: "pl",
  
  // Japanese-speaking countries
  JP: "ja",
  
  // Chinese-speaking countries/regions
  CN: "zh", HK: "zh", TW: "zh", SG: "zh",
  
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

// Booking engine locale mapping
const LOCALE_BY_LANG = {
  en: "en-GB", "en-us": "en-US", pt: "pt-PT", nl: "nl-NL",
  fr: "fr-FR", it: "it-IT", de: "de-DE", es: "es-ES", sv: "sv", pl: "pl", 
  ja: "ja-JP", zh: "zh-CN", ru: "ru", "af-za": "af-ZA", zu: "en-GB", sw: "sw",
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
 * Get booking locale with smart currency-based mapping
 * Mirrors the React app's getBookingLocale() function
 * Note: Hotelrunner only supports pt-PT and pt-BR (not pt-MZ)
 */
function getBookingLocale(lang, currency, countryCode) {
  // Handle Portuguese - use region-aware locale (Hotelrunner only supports pt-PT and pt-BR)
  if (lang === 'pt') {
    if (currency === 'EUR' || countryCode === 'PT') return 'pt-PT'; // Portugal
    return 'pt-BR'; // Brazil, Mozambique, Angola (use Brazilian variant)
  }
  
  // Handle English - distinguish US from UK
  if (lang === 'en-us') return 'en-US';
  if (lang === 'en') return 'en-GB';
  
  // Standard language mappings (Afrikaans always af-ZA, currency is separate parameter)
  return LOCALE_BY_LANG[lang] || "en-GB";
}

/**
 * Build booking URL with locale and currency
 */
function buildBookingUrl(locale, currency) {
  return `https://book.devoceanlodge.com/bv3/search?locale=${locale}&currency=${currency}`;
}

/**
 * Normalize language code
 */
function normLang(raw) {
  if (!raw) return "en";
  let s = String(raw).toLowerCase();
  
  // Special cases: keep region codes for languages that need them
  if (s === "en-us") return "en-us";
  if (s === "af-za") return "af-za";
  
  // Handle other locale codes
  if (/^[a-z]{2}-[a-z]{2}$/i.test(s)) s = s.split("-")[0];
  if (s === "pt-mz" || s === "pt-pt" || s === "pt-br") s = "pt";
  return SUPPORTED_LANGS.includes(s) ? s : "en";
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
    
    // Special case: detect US English browser language
    if (lower === "en-us" || lower.startsWith("en-us")) {
      return "en-us";
    }
    
    // Standard language detection
    const base = lower.split("-")[0];
    if (SUPPORTED_LANGS.includes(base)) return base;
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
    return "en-us";
  }
  return "en"; // UK English for Europe, Asia, Oceania, Africa
}

/**
 * Load translation file
 */
async function loadTranslations(lang) {
  try {
    const response = await fetch('/translations/story-translations-template.json');
    if (!response.ok) throw new Error('Failed to load translations');
    const data = await response.json();
    return data[lang] || data['en']; // Fallback to English if language not found
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
