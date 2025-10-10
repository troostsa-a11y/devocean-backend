import { useState, useEffect } from 'react';

const SUPPORTED_LANGS = ["en", "pt", "nl", "fr", "it", "de", "es", "sv", "pl"];
const ALLOWED_CURRENCIES = ["USD", "MZN", "ZAR", "EUR", "GBP", "SEK", "PLN"];

const CC_TO_CURRENCY = {
  US: "USD", GB: "GBP",
  NL: "EUR", BE: "EUR", FR: "EUR", DE: "EUR", IT: "EUR", ES: "EUR",
  PT: "EUR", IE: "EUR", AT: "EUR", FI: "EUR", GR: "EUR",
  ZA: "ZAR", MZ: "MZN",
  SE: "SEK",
  PL: "PLN",
};

const LANG_TO_CURRENCY_HINT = {
  "nl": "EUR", "de": "EUR", "fr": "EUR", "pt": "EUR", "es": "EUR", "it": "EUR",
  "sv": "SEK",
  "pl": "PLN",
  "en-gb": "GBP", "en-us": "USD",
};

// Booking engine locale mapping
export const LOCALE_BY_LANG = {
  en: "en-GB", pt: "pt-BR", nl: "nl-NL",
  fr: "fr-FR", it: "it-IT", de: "de-DE", es: "es-ES", sv: "sv", pl: "pl-PL",
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
  if (s === "pt-mz") s = "ptmz";
  if (s === "pt-pt" || s === "pt-br") s = "pt";
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

  return {
    lang,
    currency,
    setLang,
    setCurrency,
    ui,
    loading,
    bookingLocale: LOCALE_BY_LANG[lang] || "en-GB",
    dateLocale: DATE_LANG_BY_LANG[lang] || "en-GB",
  };
}
