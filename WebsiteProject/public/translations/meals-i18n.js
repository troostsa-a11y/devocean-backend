/**
 * Meals Page i18n System
 * Standalone vanilla JavaScript translation system for devocean-lodge-meals.html
 * Mirrors story-i18n.js (language detection) without the booking-URL logic.
 */

(function () {
  const SUPPORTED_LANGS = [
    "en-GB", "en-US", "pt-PT", "pt-BR", "nl-NL", "fr-FR", "it-IT", "de-DE", "es-ES",
    "sv", "pl", "af-ZA", "zu", "sw", "ja-JP", "zh-CN", "ru"
  ];

  // Map country codes to primary language (IP-based fallback)
  const CC_TO_LANGUAGE = {
    US: "en-US", GB: "en-GB", IE: "en-GB", AU: "en-GB", NZ: "en-GB", CA: "en-GB",
    ZA: "en-GB", NA: "en-GB", ZW: "en-GB", BW: "en-GB", NG: "en-GB", GH: "en-GB", ZM: "en-GB", MW: "en-GB",
    SZ: "en-GB", LS: "en-GB", MU: "en-GB", SC: "en-GB", JM: "en-GB", TT: "en-GB",
    BB: "en-GB", FJ: "en-GB", PG: "en-GB", SB: "en-GB", VU: "en-GB",
    PT: "pt-PT", BR: "pt-BR", MZ: "pt-BR", AO: "pt-BR",
    NL: "nl-NL", BE: "nl-NL", SR: "nl-NL",
    FR: "fr-FR", MC: "fr-FR", LU: "fr-FR", CH: "fr-FR", RE: "fr-FR",
    SN: "fr-FR", CI: "fr-FR", CM: "fr-FR", DJ: "fr-FR", NC: "fr-FR", PF: "fr-FR",
    IT: "it-IT", SM: "it-IT", VA: "it-IT",
    DE: "de-DE", AT: "de-DE", LI: "de-DE",
    ES: "es-ES", MX: "es-ES", AR: "es-ES", CO: "es-ES", PE: "es-ES", VE: "es-ES",
    CL: "es-ES", EC: "es-ES", GT: "es-ES", CU: "es-ES", BO: "es-ES", DO: "es-ES",
    HN: "es-ES", PY: "es-ES", SV: "es-ES", NI: "es-ES", CR: "es-ES", PA: "es-ES",
    UY: "es-ES", GQ: "es-ES",
    SE: "sv", FI: "sv",
    PL: "pl",
    JP: "ja-JP",
    CN: "zh-CN", HK: "zh-CN", TW: "zh-CN", SG: "zh-CN",
    RU: "ru", BY: "ru", KZ: "ru", UA: "ru", UZ: "ru", KG: "ru",
    KE: "sw", TZ: "sw", UG: "sw",
  };

  const AMERICAS = new Set([
    "US","CA","MX","BR","AR","CL","CO","PE","VE","EC","UY","PY","BO","CR","PA",
    "GT","HN","SV","NI","CU","DO","HT","JM","TT","BB"
  ]);

  function getCountryCode() {
    return window.__CF_COUNTRY__ || null;
  }

  function normLang(raw) {
    if (!raw) return "en-GB";
    const s = String(raw).toLowerCase();
    if (s === "en-gb" || s === "en") return "en-GB";
    if (s === "en-us") return "en-US";
    if (s === "pt-pt") return "pt-PT";
    if (s === "pt-br") return "pt-BR";
    if (s === "pt-mz") return "pt-BR";
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

  function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function pickInitialLang() {
    // Priority 1: URL parameter
    const urlLang = getUrlParam('lang');
    if (urlLang) {
      const normalized = normLang(urlLang);
      if (SUPPORTED_LANGS.includes(normalized)) {
        localStorage.setItem("site.lang", normalized);
        return normalized;
      }
    }

    // Priority 2: localStorage
    const stored = localStorage.getItem("site.lang");
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;

    const cc = getCountryCode();

    // Priority 3: browser language preferences
    const list = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language].filter(Boolean);
    for (const l of list) {
      const normalized = normLang(String(l || "").toLowerCase());
      if (SUPPORTED_LANGS.includes(normalized)) return normalized;
    }

    // Priority 4: IP-based country → language
    if (cc && CC_TO_LANGUAGE[cc]) return CC_TO_LANGUAGE[cc];

    // Final fallback: region-aware English
    return (cc && AMERICAS.has(cc)) ? "en-US" : "en-GB";
  }

  async function loadTranslations(lang) {
    try {
      const response = await fetch('/translations/meals-translations.json');
      if (!response.ok) throw new Error('Failed to load translations');
      const data = await response.json();
      const translations = data[lang];
      if (!translations) {
        console.warn('No meals translations found for', lang, 'falling back to English');
      }
      return translations || data['en-GB'];
    } catch (error) {
      console.error('Error loading meals translations:', error);
      return null;
    }
  }

  function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  function applyTranslations(translations) {
    if (!translations) return;
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const value = getNestedValue(translations, key);
      if (value) {
        if (element.hasAttribute('data-i18n-html')) {
          element.innerHTML = value;
        } else {
          element.textContent = value;
        }
      }
    });
  }

  async function initI18n() {
    const lang = pickInitialLang();
    if (lang === "en-GB") {
      // Page is authored in UK English — nothing to swap.
      document.documentElement.lang = lang;
      return;
    }
    const translations = await loadTranslations(lang);
    if (translations) applyTranslations(translations);
    document.documentElement.lang = lang;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
  } else {
    initI18n();
  }
})();
