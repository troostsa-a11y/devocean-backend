import { useState, useEffect } from 'react';
import { CRITICAL_NAV } from './critical.js';

const SUPPORTED_LANGS = ["en", "pt", "nl", "fr", "it", "de", "es", "sv", "pl", "ja", "zh", "ru"];
const ALLOWED_CURRENCIES = ["USD", "MZN", "ZAR", "EUR", "GBP", "SEK", "PLN", "JPY", "CNY"];
const SUPPORTED_REGIONS = ["europe", "asia", "americas", "africa", "oceania"];

const CC_TO_CURRENCY = {
  US: "USD", GB: "GBP",
  NL: "EUR", BE: "EUR", FR: "EUR", DE: "EUR", IT: "EUR", ES: "EUR",
  PT: "EUR", IE: "EUR", AT: "EUR", FI: "EUR", GR: "EUR",
  ZA: "ZAR", MZ: "MZN",
  SE: "SEK",
  PL: "PLN",
  JP: "JPY",
  CN: "CNY",
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
  RU: "europe",
  
  // Africa
  ZA: "africa", MZ: "africa", KE: "africa", TZ: "africa", UG: "africa",
  ZW: "africa", BW: "africa", NA: "africa", EG: "africa", MA: "africa",
  SZ: "africa", RE: "africa", MU: "africa", SC: "africa", LS: "africa",
  AO: "africa", GH: "africa", NG: "africa", ET: "africa", SD: "africa",
  DZ: "africa", TN: "africa", LY: "africa", SN: "africa", CI: "africa",
  CM: "africa", RW: "africa", BI: "africa", SO: "africa", DJ: "africa",
  
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
  
  // Oceania
  AU: "oceania", NZ: "oceania", FJ: "oceania", PG: "oceania", NC: "oceania",
  PF: "oceania", WS: "oceania", TO: "oceania", VU: "oceania", SB: "oceania",
};

// Meridian-based continent detection using GMT offsets
const CONTINENT_MERIDIANS = {
  americas: { base: -5, min: -11, max: -3 },
  africa: { base: 2, min: 0, max: 4 },     // Base at +2 for South Africa, East Africa (UTC+0 to +4)
  europe: { base: 1, min: -1, max: 2 },    // Base at +1 for Central Europe (UTC-1 to +2)
  asia: { base: 7, min: 3, max: 12 },      // Base at +7 for SE Asia, shift to avoid overlap (UTC+3 to +12)
  oceania: { base: 11, min: 10, max: 13 }, // Australia East/NZ/Pacific (UTC+10 to +13)
};

const LANG_TO_CURRENCY_HINT = {
  "nl": "EUR", "de": "EUR", "fr": "EUR", "pt": "EUR", "es": "EUR", "it": "EUR",
  "sv": "SEK",
  "pl": "PLN",
  "en-gb": "GBP", "en-us": "USD",
};

// Booking engine locale mapping (base, can be overridden by region)
export const LOCALE_BY_LANG = {
  en: "en-GB", pt: "pt-PT", nl: "nl-NL",
  fr: "fr-FR", it: "it-IT", de: "de-DE", es: "es-ES", sv: "sv", pl: "pl", ja: "ja-JP", zh: "zh-CN", ru: "ru-RU",
};

// Region-specific locale overrides for Portuguese
export const getBookingLocaleForRegion = (lang, region) => {
  if (lang === 'pt' && region === 'africa') {
    return 'pt-BR'; // African Portuguese uses Brazilian locale
  }
  return LOCALE_BY_LANG[lang] || "en-GB";
};

// Native date pickers: force dd/mm/yyyy display
export const DATE_LANG_BY_LANG = {
  en: "en-GB", pt: "pt-PT", nl: "nl-NL",
  fr: "fr-FR", it: "it-IT", de: "de-DE", es: "es-ES", sv: "sv-SE", pl: "pl-PL", ja: "ja-JP", zh: "zh-CN", ru: "ru-RU",
};

function normLang(raw) {
  if (!raw) return "en";
  let s = String(raw).toLowerCase();
  if (/^[a-z]{2}-[a-z]{2}$/i.test(s)) s = s.split("-")[0];
  if (s === "pt-mz" || s === "pt-pt" || s === "pt-br") s = "pt";
  return SUPPORTED_LANGS.includes(s) ? s : "en";
}

function clampCur(cur) {
  if (!cur) return null;
  const c = String(cur).toUpperCase().replace(/[^A-Z]/g, "");
  return c.length === 3 ? c : null;
}

function getCountryCode() {
  // Priority 1: Use Cloudflare's IP-based country detection (production)
  if (typeof window !== 'undefined' && window.__CF_COUNTRY__) {
    console.warn('[DEVOCEAN GeoIP] ✓ Using Cloudflare country:', window.__CF_COUNTRY__);
    return window.__CF_COUNTRY__;
  }
  
  // Priority 2: Fall back to browser language detection (local dev)
  const list = (navigator.languages && navigator.languages.length)
    ? navigator.languages
    : [navigator.language].filter(Boolean);

  console.warn('[DEVOCEAN Browser Debug] Languages:', list);

  // Collect all country codes from browser languages
  const countryCodes = [];
  for (const l of list) {
    const m = String(l || "").toUpperCase().match(/-([A-Z]{2})/);
    if (m) countryCodes.push(m[1]);
  }
  
  console.warn('[DEVOCEAN Browser Debug] Country codes found:', countryCodes);
  
  // Look for African country codes first (target market)
  const africanCodes = ['ZA', 'MZ', 'KE', 'TZ', 'UG', 'ZW', 'BW', 'NA', 'EG', 'MA', 'SZ', 'RE', 'MU', 'SC', 'LS'];
  for (const cc of countryCodes) {
    if (africanCodes.includes(cc)) {
      console.warn('[DEVOCEAN Browser Debug] ✓ Found African code:', cc);
      return cc;
    }
  }
  
  // Return first country code found
  if (countryCodes.length > 0) {
    console.warn('[DEVOCEAN Browser Debug] Using first code:', countryCodes[0]);
    return countryCodes[0];
  }
  
  // Try Intl.DateTimeFormat locale
  try {
    const loc = new Intl.DateTimeFormat().resolvedOptions().locale || "";
    const m = loc.toUpperCase().match(/-([A-Z]{2})/);
    if (m) {
      console.warn('[DEVOCEAN Browser Debug] Using Intl code:', m[1]);
      return m[1];
    }
  } catch { }
  
  console.warn('[DEVOCEAN Browser Debug] ⚠️ No country code found');
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

  const list = (navigator.languages && navigator.languages.length)
    ? navigator.languages
    : [navigator.language].filter(Boolean);

  for (const l of list) {
    const base = String(l || "").toLowerCase().split("-")[0];
    if (SUPPORTED_LANGS.includes(base)) return base;
  }
  return "en";
}

function pickInitialCurrency(langBase) {
  const saved = localStorage.getItem("site.currency");
  console.warn('[DEVOCEAN Currency Debug] Saved:', saved, 'Lang:', langBase);
  
  if (saved && ALLOWED_CURRENCIES.includes(saved)) {
    console.warn('[DEVOCEAN Currency Debug] Using saved currency:', saved);
    return saved;
  }

  // Priority 1: Check country code (Cloudflare IP or browser hint)
  const cc = getCountryCode();
  const byCC = (cc && CC_TO_CURRENCY[cc]) || null;
  console.warn('[DEVOCEAN Currency Debug] Country code:', cc, '→ Currency:', byCC);
  
  if (byCC && ALLOWED_CURRENCIES.includes(byCC)) {
    console.warn('[DEVOCEAN Currency Debug] ✓ Using currency from country code:', byCC);
    return byCC;
  }

  // Priority 2: Check language hints
  if (langBase && LANG_TO_CURRENCY_HINT[langBase]) {
    console.warn('[DEVOCEAN Currency Debug] Using lang hint:', LANG_TO_CURRENCY_HINT[langBase]);
    return LANG_TO_CURRENCY_HINT[langBase];
  }
  const nav = (navigator.language || "").toLowerCase();
  if (LANG_TO_CURRENCY_HINT[nav]) {
    console.warn('[DEVOCEAN Currency Debug] Using nav hint:', LANG_TO_CURRENCY_HINT[nav]);
    return LANG_TO_CURRENCY_HINT[nav];
  }

  console.warn('[DEVOCEAN Currency Debug] ⚠️ Defaulting to USD');
  return "USD";
}

function pickInitialRegion(langBase) {
  // Check localStorage but validate it's not corrupted
  const saved = localStorage.getItem("site.region");
  const savedVersion = localStorage.getItem("site.region.version");
  
  // Version 2: IP-based geolocation (Oct 2024)
  // Clear old cached values from browser-based detection
  if (saved && SUPPORTED_REGIONS.includes(saved) && savedVersion === "2") {
    console.warn('[DEVOCEAN Region Debug] Using saved region (v2):', saved);
    return saved;
  }
  
  // Get country code (Cloudflare IP-based or browser fallback)
  const cc = getCountryCode();
  console.warn('[DEVOCEAN Region Debug] Country code from Cloudflare/Browser:', cc);
  
  // Priority 1: Use country code → continent mapping (most accurate)
  if (cc && CC_TO_CONTINENT[cc]) {
    console.warn('[DEVOCEAN Region Debug] ✓ Mapped to continent:', CC_TO_CONTINENT[cc]);
    return CC_TO_CONTINENT[cc];
  }
  
  // Priority 2: Use timezone-based detection (fallback for unmapped countries)
  const tzContinent = getTimezoneContinent();
  if (tzContinent) {
    console.warn('[DEVOCEAN Region Debug] ⚠️ Country', cc, 'not mapped! Using timezone:', tzContinent);
    return tzContinent;
  }
  
  // Final fallback to Europe as default
  console.warn('[DEVOCEAN Region Debug] ⚠️ No detection worked, defaulting to europe');
  return "europe";
}

// Dynamically load translations for a specific language
async function loadTranslations(lang) {
  const { UI } = await import('./translations.js');
  return UI[lang] || UI.en;
}

// Build minimal UI object with critical nav for instant rendering
function getCriticalUI(lang) {
  const nav = CRITICAL_NAV[lang] || CRITICAL_NAV.en;
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
    // Minimal placeholders for other sections (will be replaced when full translations load)
    hero: { ctaPrimary: nav.bookNow },
    stay: { moreDetails: "..." },
    form: { send: "..." }
  };
}

export function useLocale() {
  const [lang, setLangState] = useState(() => {
    const stored = localStorage.getItem("site.lang");
    return stored && SUPPORTED_LANGS.includes(stored) ? stored : pickInitialLang();
  });

  const [currency, setCurrencyState] = useState(() => {
    const stored = localStorage.getItem("site.currency");
    return stored && ALLOWED_CURRENCIES.includes(stored) ? stored : pickInitialCurrency(pickInitialLang());
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
  };

  const setCurrency = (newCur) => {
    const clamped = clampCur(newCur) || "USD";
    setCurrencyState(clamped);
    localStorage.setItem("site.currency", clamped);
  };

  const setRegion = (newRegion) => {
    if (SUPPORTED_REGIONS.includes(newRegion)) {
      setRegionState(newRegion);
      localStorage.setItem("site.region", newRegion);
      localStorage.setItem("site.region.version", "2"); // Mark as IP-based version
    }
  };

  return {
    lang,
    currency,
    region,
    setLang,
    setCurrency,
    setRegion,
    ui,
    criticalUI, // Provide critical nav separately for header
    loading,
    bookingLocale: getBookingLocaleForRegion(lang, region),
    dateLocale: DATE_LANG_BY_LANG[lang] || "en-GB",
  };
}
