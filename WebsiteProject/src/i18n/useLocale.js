import { useState, useEffect } from 'react';

const SUPPORTED_LANGS = ["en", "pt", "nl", "fr", "it", "de", "es", "sv", "pl"];
const ALLOWED_CURRENCIES = ["USD", "MZN", "ZAR", "EUR", "GBP", "SEK", "PLN"];
const SUPPORTED_REGIONS = ["europe", "asia", "americas", "africa", "oceania"];

const CC_TO_CURRENCY = {
  US: "USD", GB: "GBP",
  NL: "EUR", BE: "EUR", FR: "EUR", DE: "EUR", IT: "EUR", ES: "EUR",
  PT: "EUR", IE: "EUR", AT: "EUR", FI: "EUR", GR: "EUR",
  ZA: "ZAR", MZ: "MZN",
  SE: "SEK",
  PL: "PLN",
};

// Map country codes to continents
const CC_TO_CONTINENT = {
  // Europe
  GB: "europe", IE: "europe", NL: "europe", BE: "europe", FR: "europe", 
  DE: "europe", IT: "europe", ES: "europe", PT: "europe", AT: "europe",
  FI: "europe", SE: "europe", PL: "europe", GR: "europe", NO: "europe",
  DK: "europe", CH: "europe", CZ: "europe", HU: "europe", RO: "europe",
  // Africa
  ZA: "africa", MZ: "africa", KE: "africa", TZ: "africa", UG: "africa",
  ZW: "africa", BW: "africa", NA: "africa", EG: "africa", MA: "africa",
  // Americas
  US: "americas", CA: "americas", MX: "americas", BR: "americas", AR: "americas",
  CL: "americas", CO: "americas", PE: "americas",
  // Asia
  CN: "asia", JP: "asia", KR: "asia", IN: "asia", TH: "asia",
  SG: "asia", MY: "asia", ID: "asia", PH: "asia", VN: "asia",
  // Oceania
  AU: "oceania", NZ: "oceania", FJ: "oceania",
};

// Meridian-based continent detection using GMT offsets
const CONTINENT_MERIDIANS = {
  americas: { base: -7, min: -11, max: -3 },
  africa: { base: 1, min: -1, max: 3 },
  europe: { base: 1, min: -1, max: 3 },
  asia: { base: 7, min: 2, max: 12 },
  oceania: { base: 9, min: 8, max: 10 },
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
  fr: "fr-FR", it: "it-IT", de: "de-DE", es: "es-ES", sv: "sv", pl: "pl",
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
  fr: "fr-FR", it: "it-IT", de: "de-DE", es: "es-ES", sv: "sv-SE", pl: "pl-PL",
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

function getRegionFromNavigator() {
  const list = (navigator.languages && navigator.languages.length)
    ? navigator.languages
    : [navigator.language].filter(Boolean);

  for (const l of list) {
    const m = String(l || "").toUpperCase().match(/-([A-Z]{2})/);
    if (m) return m[1];
  }
  try {
    const loc = new Intl.DateTimeFormat().resolvedOptions().locale || "";
    const m = loc.toUpperCase().match(/-([A-Z]{2})/);
    if (m) return m[1];
  } catch { }
  return null;
}

function getTimezoneContinent() {
  try {
    // Get UTC offset in hours (e.g., -5 for EST, +2 for SAST)
    const offset = -new Date().getTimezoneOffset() / 60;
    
    // Find all continents that match this offset range
    const matches = [];
    for (const [continent, meridian] of Object.entries(CONTINENT_MERIDIANS)) {
      if (offset >= meridian.min && offset <= meridian.max) {
        matches.push({ continent, distance: Math.abs(offset - meridian.base) });
      }
    }
    
    // If matches found, return the one with closest meridian
    if (matches.length > 0) {
      matches.sort((a, b) => a.distance - b.distance);
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
  if (saved && ALLOWED_CURRENCIES.includes(saved)) return saved;

  if (langBase && LANG_TO_CURRENCY_HINT[langBase]) return LANG_TO_CURRENCY_HINT[langBase];
  const nav = (navigator.language || "").toLowerCase();
  if (LANG_TO_CURRENCY_HINT[nav]) return LANG_TO_CURRENCY_HINT[nav];

  const cc = getRegionFromNavigator();
  const byCC = (cc && CC_TO_CURRENCY[cc]) || null;
  if (byCC && ALLOWED_CURRENCIES.includes(byCC)) return byCC;

  return "USD";
}

function pickInitialRegion(langBase) {
  const saved = localStorage.getItem("site.region");
  if (saved && SUPPORTED_REGIONS.includes(saved)) return saved;
  
  // Try to detect continent from country code
  const cc = getRegionFromNavigator();
  if (cc && CC_TO_CONTINENT[cc]) {
    return CC_TO_CONTINENT[cc];
  }
  
  // Fallback: Try timezone-based detection
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
  return UI[lang] || UI.en;
}

export function useLocale() {
  const [lang, setLangState] = useState(() => {
    const stored = localStorage.getItem("site.lang");
    return stored && SUPPORTED_LANGS.includes(stored) ? stored : pickInitialLang();
  });

  const [currency, setCurrencyState] = useState(() => {
    const stored = localStorage.getItem("site.currency");
    return stored && ALLOWED_CURRENCIES.includes(stored) ? stored : pickInitialCurrency(lang);
  });

  const [region, setRegionState] = useState(() => {
    const stored = localStorage.getItem("site.region");
    return stored && SUPPORTED_REGIONS.includes(stored) ? stored : pickInitialRegion(lang);
  });

  const [ui, setUi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Load translations when language changes
  useEffect(() => {
    let cancelled = false;

    // Only show loading spinner on initial load, not on language switch
    if (!initialLoadDone) {
      setLoading(true);
    }

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
    loading,
    bookingLocale: getBookingLocaleForRegion(lang, region),
    dateLocale: DATE_LANG_BY_LANG[lang] || "en-GB",
  };
}
