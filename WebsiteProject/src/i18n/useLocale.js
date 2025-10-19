import { useState, useEffect } from 'react';
import { CRITICAL_NAV } from './critical.js';

const SUPPORTED_LANGS = ["en", "en-US", "pt-PT", "pt-BR", "nl", "fr", "it", "de", "es", "sv", "pl", "ja", "zh", "ru", "af-ZA", "zu", "sw"];
const SUPPORTED_REGIONS = ["europe", "asia", "americas", "africa", "oceania"];

// Helper to get URL parameters
function getUrlParam(name) {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
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
  US: "en-us", GB: "en", IE: "en", AU: "en", NZ: "en", CA: "en", 
  ZA: "en", NA: "en", ZW: "en", BW: "en", NG: "en", GH: "en", ZM: "en", MW: "en", 
  SZ: "en", LS: "en", MU: "en", SC: "en", JM: "en", TT: "en", 
  BB: "en", FJ: "en", PG: "en", SB: "en", VU: "en",
  
  // Portuguese-speaking countries
  PT: "pt-PT", BR: "pt-BR", MZ: "pt-BR", AO: "pt-BR",
  
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

// Meridian-based continent detection using GMT offsets
const CONTINENT_MERIDIANS = {
  americas: { base: -5, min: -11, max: -3 },
  africa: { base: 2, min: 0, max: 4 },     // Base at +2 for South Africa, East Africa (UTC+0 to +4)
  europe: { base: 1, min: -1, max: 2 },    // Base at +1 for Central Europe (UTC-1 to +2)
  asia: { base: 7, min: 3, max: 12 },      // Base at +7 for SE Asia, shift to avoid overlap (UTC+3 to +12)
  oceania: { base: 11, min: 10, max: 13 }, // Australia East/NZ/Pacific (UTC+10 to +13)
};

// Booking engine locale mapping (base, can be overridden by region)
export const LOCALE_BY_LANG = {
  en: "en-GB", "en-US": "en-US", "pt-PT": "pt-PT", "pt-BR": "pt-BR", nl: "nl-NL",
  fr: "fr-FR", it: "it-IT", de: "de-DE", es: "es-ES", sv: "sv", pl: "pl", ja: "ja-JP", zh: "zh-CN", ru: "ru", "af-ZA": "af-ZA", zu: "en-GB", sw: "sw",
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
  en: "en-GB", "en-US": "en-US", "pt-PT": "pt-PT", "pt-BR": "pt-BR", nl: "nl-NL",
  fr: "fr-FR", it: "it-IT", de: "de-DE", es: "es-ES", sv: "sv-SE", pl: "pl-PL", ja: "ja-JP", zh: "zh-CN", ru: "ru-RU", "af-ZA": "af-ZA", zu: "en-GB", sw: "sw-KE",
};

function normLang(raw) {
  if (!raw) return "en";
  let s = String(raw).toLowerCase();
  
  // Special cases: preserve specific language-region codes with proper capitalization
  if (s === "en-us") return "en-US";
  if (s === "af-za") return "af-ZA";
  if (s === "pt-pt") return "pt-PT";
  if (s === "pt-br") return "pt-BR";
  if (s === "pt-mz") return "pt-BR"; // Mozambique uses Brazilian variant
  
  // Handle other locale codes - strip region if not needed
  if (/^[a-z]{2}-[a-z]{2}$/i.test(s)) s = s.split("-")[0];
  
  return SUPPORTED_LANGS.includes(s) ? s : "en";
}

function clampCur(cur) {
  if (!cur) return null;
  const c = String(cur).toUpperCase().replace(/[^A-Z]/g, "");
  return c.length === 3 ? c : null;
}

function getCountryCode() {
  // Use Cloudflare's IP-based country detection (production only)
  if (typeof window !== 'undefined' && window.__CF_COUNTRY__ && window.__CF_COUNTRY__ !== '') {
    return window.__CF_COUNTRY__;
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
  const stored = localStorage.getItem("site.lang");
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;

  // Get country code for IP-based fallback
  const cc = getCountryCode();

  // Check browser language preferences first
  const list = (navigator.languages && navigator.languages.length)
    ? navigator.languages
    : [navigator.language].filter(Boolean);

  for (const l of list) {
    const lower = String(l || "").toLowerCase();
    
    // Special case: detect US English browser language
    if (lower === "en-us" || lower.startsWith("en-us")) {
      return "en-US";
    }
    
    // Standard language detection
    const base = lower.split("-")[0];
    if (SUPPORTED_LANGS.includes(base)) return base;
  }

  // Fallback: Use IP-based country → language mapping
  // This catches visitors with non-local browser settings (e.g., English browser in Japan)
  if (cc && CC_TO_LANGUAGE[cc]) {
    return CC_TO_LANGUAGE[cc];
  }

  // Final fallback to English - region-aware
  // Americas → US English, others → UK English
  const continent = cc ? CC_TO_CONTINENT[cc] : null;
  if (continent === "americas") {
    return "en-US";
  }
  return "en"; // UK English for Europe, Asia, Oceania, Africa
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

function pickInitialRegion(langBase) {
  // Check localStorage but validate it's not corrupted
  const saved = localStorage.getItem("site.region");
  const savedVersion = localStorage.getItem("site.region.version");
  
  // Version 2: IP-based geolocation (Oct 2024)
  // Clear old cached values from browser-based detection
  if (saved && SUPPORTED_REGIONS.includes(saved) && savedVersion === "2") {
    return saved;
  }
  
  // Get country code (Cloudflare IP-based or browser fallback)
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

// Dynamically load translations for a specific language
async function loadTranslations(lang) {
  const { UI } = await import('./translations.js');
  // Map language-region codes to base language keys for translations
  const translationKey = 
    (lang === "en-US") ? "en" :
    (lang === "pt-PT" || lang === "pt-BR") ? "pt" :
    (lang === "af-ZA") ? "af" :
    lang;
  return UI[translationKey] || UI.en;
}

// Build minimal UI object with critical nav for instant rendering
function getCriticalUI(lang) {
  // Map language-region codes to base language keys for critical nav
  const navKey = 
    (lang === "en-US") ? "en" :
    (lang === "pt-PT" || lang === "pt-BR") ? "pt" :
    (lang === "af-ZA") ? "af" :
    lang;
  const nav = CRITICAL_NAV[navKey] || CRITICAL_NAV.en;
  return {
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
    // Minimal placeholders for other sections (will be replaced when full translations load)
    hero: { ctaPrimary: nav.bookNow },
    stay: { moreDetails: "..." },
    form: { send: "..." }
  };
}

export function useLocale() {
  const [lang, setLangState] = useState(() => {
    // Priority 1: URL parameter (for return from booking engine)
    const urlLang = getUrlParam('lang');
    if (urlLang && SUPPORTED_LANGS.includes(urlLang)) {
      localStorage.setItem("site.lang", urlLang);
      localStorage.setItem("site.lang_source", "url");
      return urlLang;
    }
    
    // Priority 2: localStorage
    const stored = localStorage.getItem("site.lang");
    if (stored && SUPPORTED_LANGS.includes(stored)) {
      return stored;
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
    const storedCurrency = localStorage.getItem("site.currency");
    const storedCountry = localStorage.getItem("site.currency.country");
    
    // If IP country changed, update to new currency
    if (cc && storedCountry && cc !== storedCountry) {
      console.log(`Location changed from ${storedCountry} to ${cc}, updating currency from ${storedCurrency} to ${ipCurrency}`);
      localStorage.setItem("site.currency", ipCurrency);
      localStorage.setItem("site.currency.country", cc);
      return ipCurrency;
    }
    
    // If we have IP currency and it differs from stored, update it
    // This fixes wrong cached currencies (e.g., region defaults like ZAR instead of country currency MZN)
    if (ipCurrency && storedCurrency && ipCurrency !== storedCurrency) {
      console.log(`Correcting currency from ${storedCurrency} to ${ipCurrency} based on IP location (${cc || 'unknown'})`);
      localStorage.setItem("site.currency", ipCurrency);
      localStorage.setItem("site.currency.country", cc || "unknown");
      return ipCurrency;
    }
    
    // Use stored currency if it matches current IP
    if (storedCurrency && storedCurrency.length === 3) {
      return storedCurrency;
    }
    
    // Priority 3: Auto-detect from IP
    localStorage.setItem("site.currency", ipCurrency);
    localStorage.setItem("site.currency.country", cc || "unknown");
    return ipCurrency;
  });

  const [region, setRegionState] = useState(() => {
    // Only trust localStorage if it has the correct version (IP-based)
    const stored = localStorage.getItem("site.region");
    const version = localStorage.getItem("site.region.version");
    
    if (stored && SUPPORTED_REGIONS.includes(stored) && version === "2") {
      return stored;
    }
    
    // Clear old cached value and detect fresh
    if (stored && version !== "2") {
      localStorage.removeItem("site.region");
      localStorage.removeItem("site.region.version");
    }
    
    return pickInitialRegion(pickInitialLang());
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
    localStorage.setItem("site.lang", normalized);
    localStorage.setItem("site.lang_source", "user");
    document.documentElement.setAttribute("lang", normalized);
    
    // Don't change currency when language changes - currency is tied to region/location, not language
  };

  const setRegion = (newRegion) => {
    if (SUPPORTED_REGIONS.includes(newRegion)) {
      setRegionState(newRegion);
      localStorage.setItem("site.region", newRegion);
      localStorage.setItem("site.region.version", "2");
      localStorage.setItem("site.region.source", "user"); // Mark as user-selected
      
      // Currency NEVER changes - it always stays as the IP-detected legal tender
      // Users can change language/region, but currency is based on their physical location
    }
  };

  const countryCode = getCountryCode();
  
  return {
    lang,
    currency, // Always IP-detected legal tender, never changes
    region,
    setLang,
    setRegion,
    ui,
    criticalUI, // Provide critical nav separately for header
    loading,
    bookingLocale: getBookingLocale(lang, currency, countryCode),
    dateLocale: DATE_LANG_BY_LANG[lang] || "en-GB",
    countryCode, // Expose country code for booking URL
  };
}
