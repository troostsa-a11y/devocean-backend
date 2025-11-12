import { useState, useEffect, useMemo } from 'react';
import { CRITICAL_NAV } from './critical.js';
import { safeLocalStorage } from '../utils/safeStorage.js';

const SUPPORTED_LANGS = ["en-GB", "en-US", "pt-PT", "pt-BR", "nl-NL", "fr-FR", "it-IT", "de-DE", "es-ES", "sv", "pl", "ja-JP", "zh-CN", "ru", "af-ZA", "zu", "sw"];
const SUPPORTED_REGIONS = ["europe", "asia", "americas", "africa", "oceania"];

// Language-to-region mapping (module-level constant)
const LANGUAGE_TO_REGION = {
  'europe': ['en-GB', 'pt-PT', 'nl-NL', 'fr-FR', 'it-IT', 'de-DE', 'es-ES', 'sv', 'pl'],
  'asia': ['en-GB', 'ja-JP', 'zh-CN', 'ru'],
  'americas': ['en-US', 'pt-BR', 'es-ES', 'fr-FR'],
  'africa': ['en-GB', 'fr-FR', 'pt-BR', 'af-ZA', 'zu', 'sw'],
  'oceania': ['en-GB']
};

// Helper to get URL parameters
function getUrlParam(name) {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Normalize short language codes to full locale codes
function normalizeLangCode(langCode) {
  if (!langCode) return null;
  
  // Mapping of short codes to preferred full locale codes
  const SHORT_TO_FULL = {
    'en': 'en-GB',
    'pt': 'pt-BR',  // Default Portuguese to Brazilian
    'nl': 'nl-NL',
    'fr': 'fr-FR',
    'it': 'it-IT',
    'de': 'de-DE',
    'es': 'es-ES',
    'ja': 'ja-JP',
    'zh': 'zh-CN',
    'af': 'af-ZA'
  };
  
  // If it's already a full code and supported, return it
  if (SUPPORTED_LANGS.includes(langCode)) {
    return langCode;
  }
  
  // Try to normalize short code
  const normalized = SHORT_TO_FULL[langCode.toLowerCase()];
  if (normalized && SUPPORTED_LANGS.includes(normalized)) {
    return normalized;
  }
  
  // If no normalization found, return null (invalid code)
  return null;
}

// Comprehensive country-to-currency mapping (legal tender for each country)
export const CC_TO_CURRENCY = {
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

// Meridian-based continent detection using GMT offsets
const CONTINENT_MERIDIANS = {
  americas: { base: -5, min: -11, max: -3 },
  africa: { base: 2, min: 0, max: 4 },     // Base at +2 for South Africa, East Africa (UTC+0 to +4)
  europe: { base: 1, min: -1, max: 2 },    // Base at +1 for Central Europe (UTC-1 to +2)
  asia: { base: 7, min: 3, max: 12 },      // Base at +7 for SE Asia, shift to avoid overlap (UTC+3 to +12)
  oceania: { base: 11, min: 10, max: 13 }, // Australia East/NZ/Pacific (UTC+10 to +13)
};

// Booking engine locale mapping (1:1 passthrough now that we use Hotelrunner codes everywhere)
export const LOCALE_BY_LANG = {
  "en-GB": "en-GB", "en-US": "en-US", "pt-PT": "pt-PT", "pt-BR": "pt-BR", "nl-NL": "nl-NL",
  "fr-FR": "fr-FR", "it-IT": "it-IT", "de-DE": "de-DE", "es-ES": "es-ES", "sv": "sv", "pl": "pl", "ja-JP": "ja-JP", "zh-CN": "zh-CN", "ru": "ru", "af-ZA": "af-ZA", "zu": "zu", "sw": "sw",
};

// Get booking locale based on language + currency combination
export const getBookingLocale = (lang, currency, countryCode) => {
  // Direct mapping for most languages (including pt-PT and pt-BR)
  if (LOCALE_BY_LANG[lang]) {
    return LOCALE_BY_LANG[lang];
  }
  
  // Fallback to UK English
  return "en-GB";
};

// Native date pickers: force dd/mm/yyyy display
export const DATE_LANG_BY_LANG = {
  "en-GB": "en-GB", "en-US": "en-US", "pt-PT": "pt-PT", "pt-BR": "pt-BR", "nl-NL": "nl-NL",
  "fr-FR": "fr-FR", "it-IT": "it-IT", "de-DE": "de-DE", "es-ES": "es-ES", "sv": "sv-SE", "pl": "pl-PL", "ja-JP": "ja-JP", "zh-CN": "zh-CN", "ru": "ru-RU", "af-ZA": "af-ZA", "zu": "en-GB", "sw": "sw-KE",
};

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

function clampCur(cur) {
  if (!cur) return null;
  const c = String(cur).toUpperCase().replace(/[^A-Z]/g, "");
  return c.length === 3 ? c : null;
}

function getCountryCode() {
  // Cache Cloudflare country code for instant reuse (hydration optimization)
  const CACHE_KEY = 'cf.country';
  const CACHE_TIMESTAMP_KEY = 'cf.country.ts';
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  
  try {
    // Check cache first (instant return)
    const cached = safeLocalStorage.getItem(CACHE_KEY);
    const cachedTime = safeLocalStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (cached && cachedTime) {
      const age = Date.now() - parseInt(cachedTime, 10);
      if (age < CACHE_TTL) {
        return cached; // Instant return from cache
      }
    }
    
    // Use Cloudflare's IP-based country detection (production only)
    if (typeof window !== 'undefined' && window.__CF_COUNTRY__ && window.__CF_COUNTRY__ !== '') {
      const country = window.__CF_COUNTRY__;
      // Update cache
      safeLocalStorage.setItem(CACHE_KEY, country);
      safeLocalStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()));
      return country;
    }
    
    // Return cached value even if expired (better than null)
    if (cached) return cached;
  } catch (e) {
    // localStorage may be disabled
  }
  
  // No fallback - if Cloudflare fails, return null and default to Europe
  return null;
}

function getTimezoneContinent() {
  try {
    // Get UTC offset in hours (e.g., -5 for EST, +2 for SAST)
    const offset = -new Date().getTimezoneOffset() / 60;
    
    // Priority order for tie-breaking (when multiple continents match)
    const priority = { europe: 0, africa: 1, asia: 2, americas: 3, oceania: 4 };
    
    // Find all continents that match this offset range
    const matches = [];
    for (const [continent, meridian] of Object.entries(CONTINENT_MERIDIANS)) {
      if (offset >= meridian.min && offset <= meridian.max) {
        matches.push({ 
          continent, 
          distance: Math.abs(offset - meridian.base),
          priority: priority[continent] || 999
        });
      }
    }
    
    // Sort by distance first, then by priority for ties
    if (matches.length > 0) {
      matches.sort((a, b) => {
        if (a.distance !== b.distance) return a.distance - b.distance;
        return a.priority - b.priority;
      });
      return matches[0].continent;
    }
  } catch { }
  return null;
}

function pickInitialLang() {
  // URL override takes highest priority (booking engine return)
  const urlLang = getUrlParam('lang');
  if (urlLang) {
    const normalized = normalizeLangCode(urlLang);
    if (normalized) {
      return normalized;
    }
  }

  // Check if user manually selected language (vs auto-detection)
  const langSource = safeLocalStorage.getItem("site.lang_source");
  const stored = safeLocalStorage.getItem("site.lang");
  
  // If user manually selected language, respect their choice (but normalize it)
  if (langSource === "user" && stored) {
    const normalized = normalizeLangCode(stored);
    if (normalized) {
      return normalized;
    }
  }

  // Priority: Use Cloudflare IP geolocation (same as hero placeholder)
  const cc = getCountryCode();
  if (cc && CC_TO_LANGUAGE[cc]) {
    return CC_TO_LANGUAGE[cc];
  }

  // Fallback to stored language (auto-detected previously, but normalize it)
  if (stored) {
    const normalized = normalizeLangCode(stored);
    if (normalized) {
      return normalized;
    }
  }

  // Fallback to browser language
  const list = (navigator.languages && navigator.languages.length)
    ? navigator.languages
    : [navigator.language].filter(Boolean);

  for (const l of list) {
    const lower = String(l || "").toLowerCase();
    const normalized = normLang(lower);
    if (SUPPORTED_LANGS.includes(normalized)) return normalized;
  }

  // Final fallback to UK English
  return "en-GB";
}

// Deferred lang detection (runs after render in useEffect)
function detectLangFromIP() {
  const cc = getCountryCode();
  
  // Use IP-based country → language mapping
  if (cc && CC_TO_LANGUAGE[cc]) {
    return CC_TO_LANGUAGE[cc];
  }

  // Fallback: Americas → US English, others → UK English
  const continent = cc ? CC_TO_CONTINENT[cc] : null;
  if (continent === "americas") {
    return "en-US";
  }
  return "en-GB";
}

function pickInitialCurrency() {
  // Auto-assign currency based on Cloudflare IP country detection
  // No manual selection allowed - currency is determined by visitor's location
  const cc = getCountryCode();
  
  if (cc && CC_TO_CURRENCY[cc]) {
    return CC_TO_CURRENCY[cc];
  }
  
  // Default to USD (Hotelrunner base currency) if country detection fails
  return "USD";
}

function pickInitialRegion() {
  // Fast path: Return stored region immediately (no detection)
  const saved = safeLocalStorage.getItem("site.region");
  const savedVersion = safeLocalStorage.getItem("site.region.version");
  
  // Version 2: IP-based geolocation (Oct 2024)
  if (saved && SUPPORTED_REGIONS.includes(saved) && savedVersion === "2") {
    return saved;
  }
  
  // Fallback to Europe (defer IP-based detection to useEffect)
  return "europe";
}

// Deferred region detection (runs after render in useEffect)
function detectRegionFromIP() {
  const cc = getCountryCode();
  
  // Priority 1: Use country code → continent mapping (most accurate)
  if (cc && CC_TO_CONTINENT[cc]) {
    return CC_TO_CONTINENT[cc];
  }
  
  // Priority 2: Use timezone-based detection (fallback for unmapped countries)
  const tzContinent = getTimezoneContinent();
  if (tzContinent) {
    return tzContinent;
  }
  
  // Final fallback to Europe as default
  return "europe";
}

// Find compatible region for a language (module-level helper)
function findRegionForLanguage(language) {
  // Find first region that supports this language
  for (const [regionKey, languages] of Object.entries(LANGUAGE_TO_REGION)) {
    if (languages.includes(language)) {
      return regionKey;
    }
  }
  
  // Fallback to IP-detected region or europe
  return detectRegionFromIP();
}

// Dynamically load translations for a specific language
// Now loads only the needed language file (~7KB) instead of all languages (152KB)
async function loadTranslations(lang) {
  try {
    const { loadTranslation } = await import('./loadTranslation.js');
    return await loadTranslation(lang);
  } catch (error) {
    console.error('Failed to load translations for:', lang, error);
    throw error;
  }
}

// Build minimal UI object with critical nav for instant rendering
function getCriticalUI(lang) {
  // Use lang directly - critical nav keys now match Hotelrunner codes
  const nav = CRITICAL_NAV[lang] || CRITICAL_NAV["en-GB"];
  return {
    menu: nav.menu || "Menu",
    regions: {
      europe: "Europe",
      asia: "Asia", 
      americas: "Americas",
      africa: "Africa",
      oceania: "Oceania"
    },
    nav: {
      home: nav.home,
      stay: nav.stay,
      experiences: nav.experiences,
      todo: nav.todo,
      gallery: nav.gallery,
      location: nav.location,
      contact: nav.contact
    },
    contact: {
      bookNow: nav.bookNow
    },
    // English currency fallbacks to prevent flash when full translations load
    currencies: {
      USD: "US-Dollar",
      JPY: "Yen",
      CNY: "RMB",
      RUB: "Ruble",
      MZN: "Meticais",
      ZAR: "Rand",
      TZS: "TZ Shilling",
      KES: "KE Shilling",
      EUR: "Euro",
      GBP: "GB-Pound",
      SEK: "Krona",
      PLN: "Zloty"
    },
    // Critical hero text for LCP optimization - renders immediately for fast paint
    hero: { 
      title: nav.heroTitle || "DEVOCEAN Lodge",
      subtitle: nav.heroSubtitle || "Eco-friendly stays a few hundred meters from the beach in Ponta do Ouro, Southern Mozambique.",
      ctaPrimary: nav.bookNow,
      ctaSecondary: nav.heroExplore || "Explore the lodge",
      badge: "..." // Placeholder until full translations load
    },
    stay: { moreDetails: "..." },
    form: { send: "..." }
  };
}

export function useLocale() {
  const [lang, setLangState] = useState(() => {
    // Priority 1: URL parameter (for return from booking engine)
    const urlLang = getUrlParam('lang');
    if (urlLang) {
      const normalized = normalizeLangCode(urlLang);
      if (normalized) {
        safeLocalStorage.setItem("site.lang", normalized);
        safeLocalStorage.setItem("site.lang_source", "url");
        return normalized;
      }
    }
    
    // Priority 2: localStorage (MUST normalize in case old short codes are stored)
    const stored = safeLocalStorage.getItem("site.lang");
    if (stored) {
      const normalized = normalizeLangCode(stored);
      if (normalized) {
        // Update localStorage with normalized value to prevent future issues
        if (normalized !== stored) {
          safeLocalStorage.setItem("site.lang", normalized);
        }
        return normalized;
      }
    }
    
    // Priority 3: Auto-detect
    return pickInitialLang();
  });

  // Currency - always based on current IP-detected country
  // Updates automatically if user's location changes (e.g., traveling)
  const [currency, setCurrencyState] = useState(() => {
    // Always use current IP-detected currency (legal tender requirement)
    // URL parameters are ignored to ensure currency always matches visitor's actual location
    const cc = getCountryCode();
    const ipCurrency = pickInitialCurrency(); // Current IP-based currency
    const storedCurrency = safeLocalStorage.getItem("site.currency");
    const storedCountry = safeLocalStorage.getItem("site.currency.country");
    
    // If IP country changed, update to new currency
    if (cc && storedCountry && cc !== storedCountry) {
      safeLocalStorage.setItem("site.currency", ipCurrency);
      safeLocalStorage.setItem("site.currency.country", cc);
      return ipCurrency;
    }
    
    // If we have IP currency and it differs from stored, update it
    // This fixes wrong cached currencies (e.g., region defaults like ZAR instead of country currency MZN)
    if (ipCurrency && storedCurrency && ipCurrency !== storedCurrency) {
      safeLocalStorage.setItem("site.currency", ipCurrency);
      safeLocalStorage.setItem("site.currency.country", cc || "unknown");
      return ipCurrency;
    }
    
    // Use stored currency if it matches current IP
    if (storedCurrency && storedCurrency.length === 3) {
      return storedCurrency;
    }
    
    // Priority 3: Auto-detect from IP
    safeLocalStorage.setItem("site.currency", ipCurrency);
    safeLocalStorage.setItem("site.currency.country", cc || "unknown");
    return ipCurrency;
  });

  const [region, setRegionState] = useState(() => {
    // Check if language was set via URL parameter
    const urlLang = getUrlParam('lang');
    if (urlLang) {
      const normalized = normalizeLangCode(urlLang);
      if (normalized) {
        // Check if existing stored region already supports this language
        const storedRegion = safeLocalStorage.getItem("site.region");
        if (storedRegion && SUPPORTED_REGIONS.includes(storedRegion)) {
          const storedRegionLanguages = LANGUAGE_TO_REGION[storedRegion] || [];
          if (storedRegionLanguages.includes(normalized)) {
            // Existing region supports this language - keep it!
            return storedRegion;
          }
        }
        
        // Existing region doesn't support this language, find compatible one
        const compatibleRegion = findRegionForLanguage(normalized);
        if (compatibleRegion) {
          safeLocalStorage.setItem("site.region", compatibleRegion);
          safeLocalStorage.setItem("site.region.version", "2");
          safeLocalStorage.setItem("site.region.source", "auto"); // Auto-set based on language
          return compatibleRegion;
        }
      }
    }
    
    // Only trust localStorage if it has the correct version (IP-based)
    const stored = safeLocalStorage.getItem("site.region");
    const version = safeLocalStorage.getItem("site.region.version");
    
    if (stored && SUPPORTED_REGIONS.includes(stored) && version === "2") {
      return stored;
    }
    
    // Clear old cached value and detect fresh
    if (stored && version !== "2") {
      safeLocalStorage.removeItem("site.region");
      safeLocalStorage.removeItem("site.region.version");
    }
    
    return pickInitialRegion();
  });

  // Initialize with critical nav for header (immediate render)
  const [criticalUI, setCriticalUI] = useState(() => getCriticalUI(lang));
  const [ui, setUi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Update critical UI when language changes
  useEffect(() => {
    setCriticalUI(getCriticalUI(lang));
  }, [lang]);

  // Ensure region is compatible with current language
  useEffect(() => {
    const regionSource = safeLocalStorage.getItem("site.region.source");
    
    // Only auto-adjust region if it wasn't manually selected by user
    if (regionSource === "user") {
      return; // User manually selected region, don't override
    }
    
    const currentRegionLanguages = LANGUAGE_TO_REGION[region] || [];
    
    // If current language is not in current region, find compatible region
    if (!currentRegionLanguages.includes(lang)) {
      const compatibleRegion = findRegionForLanguage(lang);
      if (compatibleRegion && compatibleRegion !== region) {
        setRegionState(compatibleRegion);
        safeLocalStorage.setItem("site.region", compatibleRegion);
        safeLocalStorage.setItem("site.region.version", "2");
        safeLocalStorage.setItem("site.region.source", "auto");
      }
    }
  }, [lang, region]); // Removed findRegionForLanguage from dependencies to prevent infinite loop

  // Deferred IP-based detection (runs during idle time for better INP)
  useEffect(() => {
    // Use requestIdleCallback to defer heavy detection logic to idle time
    // This prevents blocking the main thread during initial render/hydration
    const scheduleDetection = () => {
      const callback = () => {
        const hasStoredLang = safeLocalStorage.getItem("site.lang");
        const hasStoredRegion = safeLocalStorage.getItem("site.region");
        const langSource = safeLocalStorage.getItem("site.lang_source");
        const langVersion = safeLocalStorage.getItem("site.lang.version");
        
        // Version 2: Force IP-based re-detection (Nov 2025 - fix language detection)
        const CURRENT_VERSION = "2";
        
        // CRITICAL: Always skip if user has manually selected language or came from booking engine
        // This prevents overriding user preferences during navigation
        if (langSource === "user" || langSource === "url") {
          // Set version flag even for user-selected languages to prevent re-detection
          if (langVersion !== CURRENT_VERSION) {
            safeLocalStorage.setItem("site.lang.version", CURRENT_VERSION);
          }
          return;
        }
        
        // Force re-detection if version is old or missing (only for auto-detected languages)
        if (langVersion !== CURRENT_VERSION) {
          const detectedLang = detectLangFromIP();
          const detectedRegion = detectRegionFromIP();
          
          if (detectedLang && detectedLang !== lang) {
            setLangState(detectedLang);
            safeLocalStorage.setItem("site.lang", detectedLang);
            safeLocalStorage.setItem("site.lang_source", "auto");
            safeLocalStorage.setItem("site.lang.version", CURRENT_VERSION);
          }
          
          if (detectedRegion && detectedRegion !== region) {
            setRegionState(detectedRegion);
            safeLocalStorage.setItem("site.region", detectedRegion);
            safeLocalStorage.setItem("site.region.version", "2");
          }
          return;
        }
        
        // Skip if we already have stored preferences with correct version
        if (hasStoredLang && hasStoredRegion) return;
        
        // Detect language from IP if not stored
        if (!hasStoredLang) {
          const detectedLang = detectLangFromIP();
          if (detectedLang && detectedLang !== lang) {
            setLangState(detectedLang);
            safeLocalStorage.setItem("site.lang", detectedLang);
            safeLocalStorage.setItem("site.lang_source", "ip");
          }
        }
        
        // Detect region from IP if not stored
        if (!hasStoredRegion) {
          const detectedRegion = detectRegionFromIP();
          if (detectedRegion && detectedRegion !== region) {
            setRegionState(detectedRegion);
            safeLocalStorage.setItem("site.region", detectedRegion);
            safeLocalStorage.setItem("site.region.version", "2");
          }
        }
      };
      
      // Use requestIdleCallback if available, otherwise fallback to setTimeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(callback, { timeout: 2000 }); // Max 2s delay
      } else {
        setTimeout(callback, 100);
      }
    };
    
    scheduleDetection();
  }, []); // Run once on mount

  // Load full translations
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setUi(null); // Clear UI immediately so Header falls back to criticalUI during load

    loadTranslations(lang)
      .then((translations) => {
        if (!cancelled) {
          setUi(translations);
          setLoading(false);
          setInitialLoadDone(true);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to load translations:', err);
          setLoading(false);
          setInitialLoadDone(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lang, initialLoadDone]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const setLang = (newLang) => {
    const normalized = normLang(newLang);
    setLangState(normalized);
    safeLocalStorage.setItem("site.lang", normalized);
    safeLocalStorage.setItem("site.lang_source", "user");
    safeLocalStorage.setItem("site.lang.version", "2"); // Mark with current version to prevent auto-detection override
    document.documentElement.setAttribute("lang", normalized);
    
    // Don't change currency when language changes - currency is tied to region/location, not language
  };

  const setRegion = (newRegion) => {
    if (SUPPORTED_REGIONS.includes(newRegion)) {
      setRegionState(newRegion);
      safeLocalStorage.setItem("site.region", newRegion);
      safeLocalStorage.setItem("site.region.version", "2");
      safeLocalStorage.setItem("site.region.source", "user"); // Mark as user-selected
      
      // Currency NEVER changes - it always stays as the IP-detected legal tender
      // Users can change language/region, but currency is based on their physical location
    }
  };

  // Memoize country code to avoid repeated function calls
  const countryCode = useMemo(() => getCountryCode(), []);
  
  // Memoize booking locale calculation
  const bookingLocale = useMemo(() => 
    getBookingLocale(lang, currency, countryCode),
    [lang, currency, countryCode]
  );
  
  // Memoize date locale lookup
  const dateLocale = useMemo(() => 
    DATE_LANG_BY_LANG[lang] || "en-GB",
    [lang]
  );
  
  return {
    lang,
    currency, // Always IP-detected legal tender, never changes
    region,
    setLang,
    setRegion,
    ui,
    criticalUI, // Provide critical nav separately for header
    loading,
    bookingLocale,
    dateLocale,
    countryCode, // Expose country code for booking URL
  };
}
