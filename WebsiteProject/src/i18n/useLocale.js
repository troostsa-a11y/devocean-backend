import { useState, useEffect, useMemo } from 'react';
import { CRITICAL_NAV } from './critical.js';
import { CRITICAL_SECTION_UI } from './criticalSections.generated.js';
import { loadTranslation } from './loadTranslation.js';
import { safeLocalStorage } from '../utils/safeStorage.js';
import { resolveVisitorLanguage } from './visitorLanguage.js';
import { resolveVisitorCurrency } from './visitorCurrency.js';
export { CC_TO_CURRENCY } from './visitorCurrency.js';
import {
  DEFAULT_LOCALE,
  localeFromPath,
  localizedUrl,
  normalizeLocale,
} from './localeCatalog.js';

const SUPPORTED_REGIONS = ["westEu", "eastEu", "asia", "americas", "africa", "oceania"];

// Helper to get URL parameters
// Normalize short language codes to full locale codes
function normalizeLangCode(langCode) {
  return normalizeLocale(langCode);
}

// Map country codes to continents (comprehensive)
const CC_TO_CONTINENT = {
  // West Europe
  GB: "westEu", IE: "westEu", NL: "westEu", BE: "westEu", FR: "westEu",
  DE: "westEu", IT: "westEu", ES: "westEu", PT: "westEu", AT: "westEu",
  FI: "westEu", SE: "westEu", GR: "westEu", NO: "westEu",
  DK: "westEu", CH: "westEu", MT: "westEu",
  CY: "westEu", LU: "westEu", IS: "westEu", LI: "westEu", MC: "westEu",
  AD: "westEu", SM: "westEu", VA: "westEu",

  // East Europe
  PL: "eastEu", CZ: "eastEu", HU: "eastEu", RO: "eastEu",
  RS: "eastEu", HR: "eastEu", SI: "eastEu", BA: "eastEu", BG: "eastEu",
  SK: "eastEu", EE: "eastEu", LV: "eastEu", LT: "eastEu",
  UA: "eastEu", BY: "eastEu", MD: "eastEu", AL: "eastEu", MK: "eastEu",
  ME: "eastEu", XK: "eastEu",
  
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

// Meridian-based continent detection using GMT offsets
const CONTINENT_MERIDIANS = {
  americas: { base: -5, min: -11, max: -3 },
  africa: { base: 2, min: 0, max: 4 },     // Base at +2 for South Africa, East Africa (UTC+0 to +4)
  westEu: { base: 1, min: -1, max: 1 },    // Base at +1 for Western Europe (UTC-1 to +1)
  eastEu: { base: 2, min: 2, max: 3 },     // Base at +2 for Eastern Europe (UTC+2 to +3)
  asia: { base: 7, min: 3, max: 12 },      // Base at +7 for SE Asia, shift to avoid overlap (UTC+3 to +12)
  oceania: { base: 11, min: 10, max: 13 }, // Australia East/NZ/Pacific (UTC+10 to +13)
};

// Booking engine locale mapping (1:1 passthrough now that we use Hotelrunner codes everywhere)
export const LOCALE_BY_LANG = {
  "en-GB": "en-GB", "en-US": "en-US", "pt-PT": "pt-PT", "pt-BR": "pt-BR", "nl-NL": "nl-NL",
  "fr-FR": "fr-FR", "it-IT": "it-IT", "de-DE": "de-DE", "es-ES": "es-ES", "sv": "sv", "pl": "pl", "ro": "ro", "sr": "sr", "hr": "hr", "cs": "cs", "tr": "tr", "ja-JP": "ja-JP", "zh-CN": "zh-CN", "ru": "ru", "af-ZA": "af-ZA", "zu": "zu", "sw": "sw",
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
  "fr-FR": "fr-FR", "it-IT": "it-IT", "de-DE": "de-DE", "es-ES": "es-ES", "sv": "sv-SE", "pl": "pl-PL", "ro": "ro-RO", "sr": "sr-RS", "hr": "hr-HR", "cs": "cs-CZ", "tr": "tr-TR", "ja-JP": "ja-JP", "zh-CN": "zh-CN", "ru": "ru-RU", "af-ZA": "af-ZA", "zu": "en-GB", "sw": "sw-KE",
};

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
    // The current edge signal wins over yesterday's cached country (travel,
    // VPN changes, etc.). Language selection never changes this country.
    const edgeCountry = typeof window !== 'undefined'
      ? String(window.__CF_COUNTRY__ || '').toUpperCase() : '';
    if (/^[A-Z]{2}$/.test(edgeCountry)) {
      safeLocalStorage.setItem(CACHE_KEY, edgeCountry);
      safeLocalStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()));
      return edgeCountry;
    }

    // Reuse the cache only when no current edge signal is available.
    const cached = safeLocalStorage.getItem(CACHE_KEY);
    const cachedTime = safeLocalStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (cached && cachedTime) {
      const age = Date.now() - parseInt(cachedTime, 10);
      if (age < CACHE_TTL) {
        return cached; // Instant return from cache
      }
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
    // Africa wins UTC+2 ties (overlaps with eastEu); westEu prioritized over eastEu
    const priority = { westEu: 0, africa: 1, eastEu: 2, asia: 3, americas: 4, oceania: 5 };
    
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
  const selected = resolveVisitorLanguage({
    pathname: window.location.pathname,
    storedLanguage: safeLocalStorage.getItem('site.lang'),
    storedSource: safeLocalStorage.getItem('site.lang_source'),
    browserLanguages: navigator.languages?.length
      ? navigator.languages : [navigator.language].filter(Boolean),
    countryCode: getCountryCode(),
  });
  safeLocalStorage.setItem('site.lang', selected.lang);
  safeLocalStorage.setItem('site.lang_source', selected.source);
  return selected.lang;
}

function pickInitialCurrency() {
  const selected = resolveVisitorCurrency({
    storedCurrency: safeLocalStorage.getItem('site.currency'),
    storedSource: safeLocalStorage.getItem('site.currency.source'),
    storedCountry: safeLocalStorage.getItem('site.currency.country'),
    browserLanguages: navigator.languages?.length
      ? navigator.languages : [navigator.language].filter(Boolean),
    countryCode: getCountryCode(),
  });
  safeLocalStorage.setItem('site.currency', selected.currency);
  safeLocalStorage.setItem('site.currency.source', selected.source);
  safeLocalStorage.setItem('site.currency.country', selected.country || '');
  return selected.currency;
}

function pickInitialRegion() {
  // Country injection is already available; no network lookup or deferred
  // language/region migration is needed.
  return detectRegionFromIP();
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
  
  // Final fallback to West Europe as default
  return "westEu";
}

// Dynamically load translations for a specific language
// Now loads only the needed language file (~7KB) instead of all languages (152KB)
async function loadTranslations(lang) {
  try {
    return await loadTranslation(lang);
  } catch (error) {
    console.error('Failed to load translations for:', lang, error);
    throw error;
  }
}

// Build minimal UI object with critical nav for instant rendering
export function getCriticalUI(lang) {
  // Use lang directly - critical nav keys now match Hotelrunner codes
  const nav = CRITICAL_NAV[lang] || CRITICAL_NAV["en-GB"];
  const sections = CRITICAL_SECTION_UI[lang] || CRITICAL_SECTION_UI["en-GB"];
  return {
    menu: sections.menu,
    regions: sections.regions,
    nav: sections.nav,
    currencies: sections.currencies,
    // Critical hero text for LCP optimization - renders immediately for fast paint
    hero: sections.hero,
    stay: {
      ourStory: sections.stay.ourStory,
      headline: nav.stayHeadline || "Stay with us",
      blurb: nav.stayBlurb || "Choose your style: nature-immersed tents or cozy chalets and cottage – all with warm, family-run hospitality.",
      moreDetails: nav.stayMoreDetails || "More details"
    },
    experiences: {
      headline: nav.experiencesHeadline || "Explore Ponta",
      blurb: nav.experiencesBlurb || "Ocean and forest adventures right on your doorstep.",
      featured: nav.experiencesFeatured || "Featured",
      learnMore: nav.experiencesLearnMore || "Explore dive sites, operators & pricing →"
    },
    galleryHeading: nav.galleryHeading,
    location: {
      ...sections.location,
      headline: nav.locationHeadline,
    },
    contact: {
      ...sections.contact,
      headline: nav.contactHeadline,
    },
    form: sections.form,
    footer: sections.footer,
    legal: sections.legal,
  };
}

export function useLocale() {
  const [lang, setLangState] = useState(() => {
    // A stable locale path is the public source of truth. This is intentionally
    // checked before storage or automatic browser/country preferences.
    const pathLocale = localeFromPath(window.location.pathname);
    if (pathLocale) {
      const manualChoice = safeLocalStorage.getItem('site.lang_source') === 'user' &&
        normalizeLangCode(safeLocalStorage.getItem('site.lang')) === pathLocale.code;
      safeLocalStorage.setItem("site.lang", pathLocale.code);
      safeLocalStorage.setItem("site.lang_source", manualChoice ? "user" : "url");
      return pathLocale.code;
    }

    // Match the resolver that ran before first paint. Cached automatic guesses
    // must not outrank the browser, and idle IP detection must not replace it.
    if (window.__DEVOCEAN_LOCALE_BOOTSTRAPPED__) {
      const initial = normalizeLangCode(window.__DEVOCEAN_LOCALE__);
      if (initial) return initial;
    }
    
    // Priority 3: Auto-detect
    return pickInitialLang() || DEFAULT_LOCALE;
  });

  // Manual choice → explicit browser currency/region → IP → USD.
  // Re-evaluate automatic choices on each visit; cached IP guesses cannot win.
  const [currency, setCurrencyState] = useState(pickInitialCurrency);

  const [region, setRegionState] = useState(() => {
    const stored = safeLocalStorage.getItem("site.region");
    if (stored && SUPPORTED_REGIONS.includes(stored) &&
        safeLocalStorage.getItem('site.region.source') === 'user') {
      return stored;
    }
    // Geography must not be inferred from the chosen language. Re-evaluate
    // automatic region against the current country, not a cached language group.
    const detected = pickInitialRegion();
    safeLocalStorage.setItem('site.region', detected);
    safeLocalStorage.setItem('site.region.version', '3');
    safeLocalStorage.setItem('site.region.source', 'auto');
    return detected;
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

  // Region remains IP-aware; language/currency have already been resolved before
  // first paint and is never re-selected by a deferred country lookup.
  useEffect(() => {
    // Use requestIdleCallback to defer heavy detection logic to idle time
    // This prevents blocking the main thread during initial render/hydration
    const scheduleDetection = () => {
      const callback = () => {
        const hasStoredRegion = safeLocalStorage.getItem("site.region");
        if (safeLocalStorage.getItem('site.region.source') === 'user') return;
        
        // Detect region from IP if not stored
        if (!hasStoredRegion) {
          const detectedRegion = detectRegionFromIP();
          if (detectedRegion && detectedRegion !== region) {
            setRegionState(detectedRegion);
            safeLocalStorage.setItem("site.region", detectedRegion);
            safeLocalStorage.setItem("site.region.version", "3");
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
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    // NOTE: do NOT touch the canonical tag here. The server (Cloudflare Pages
    // middleware) sets the correct canonical per route — including
    // self-referencing ?lang= canonicals for hreflang language variants.
    // Rewriting it client-side would collapse every variant back to the bare
    // homepage URL and invalidate the hreflang cluster for Google (which
    // indexes the rendered DOM). Page components own their own canonicals.
  }, [lang]);

  const setLang = (newLang) => {
    const normalized = normalizeLangCode(newLang);
    if (!normalized) return;
    safeLocalStorage.setItem("site.lang", normalized);
    safeLocalStorage.setItem("site.lang_source", "user");
    window.__DEVOCEAN_LOCALE_API__?.rememberLanguage(normalized);

    // A full navigation is deliberate: it makes the URL, edge-generated
    // metadata, initial HTML, and hydrated interface change as one unit.
    // Currency is intentionally absent from this operation and remains in its
    // own persisted preference.
    const target = localizedUrl(
      window.location.pathname,
      normalized,
      window.location.search,
      window.location.hash,
    );
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== target) {
      const destination = new URL(target, window.location.origin);
      if (destination.origin === window.location.origin) {
        window.location.assign(destination.href);
      }
    } else {
      setLangState(normalized);
      document.documentElement.setAttribute("lang", normalized);
    }
  };

  const setRegion = (newRegion) => {
    if (!SUPPORTED_REGIONS.includes(newRegion)) return;
    setRegionState(newRegion);
    safeLocalStorage.setItem("site.region", newRegion);
    safeLocalStorage.setItem("site.region.version", "3");
    safeLocalStorage.setItem("site.region.source", "user");

    // Region/language controls do not constitute a currency preference.
  };

  // Manual display-currency override (set via the /book-direct country picker).
  // Persisted with source="user" so browser/IP detection never clobbers it.
  // Only this preference (not any client FX amount) may be sent to checkout.
  const setCurrency = (newCurrency, country) => {
    const c = clampCur(newCurrency);
    if (!c) return;
    setCurrencyState(c);
    safeLocalStorage.setItem("site.currency", c);
    safeLocalStorage.setItem("site.currency.source", "user");
    if (country) {
      safeLocalStorage.setItem("site.currency.country", country);
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
    currency, // manual preference → browser region → IP → USD
    region,
    setLang,
    setRegion,
    setCurrency,
    ui,
    criticalUI, // Provide critical nav separately for header
    loading,
    bookingLocale,
    dateLocale,
    countryCode, // Expose country code for booking URL
  };
}
