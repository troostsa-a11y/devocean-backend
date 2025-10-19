/**
 * Story Page i18n System
 * Standalone vanilla JavaScript translation system for story.html
 * Mirrors the React-based i18n logic from the main site
 */

// Supported languages (must match main site)
const SUPPORTED_LANGS = [
  "en", "en-us", "pt", "nl", "fr", "it", "de", "es", 
  "sv", "pl", "af", "zu", "sw", "ja", "zh", "ru"
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

/**
 * Get Cloudflare country code from global variable
 */
function getCountryCode() {
  return window.__CF_COUNTRY__ || null;
}

/**
 * Normalize language code
 */
function normLang(raw) {
  if (!raw) return "en";
  let s = String(raw).toLowerCase();
  
  // Special case: keep en-us as is
  if (s === "en-us") return "en-us";
  
  // Handle other locale codes
  if (/^[a-z]{2}-[a-z]{2}$/i.test(s)) s = s.split("-")[0];
  if (s === "pt-mz" || s === "pt-pt" || s === "pt-br") s = "pt";
  return SUPPORTED_LANGS.includes(s) ? s : "en";
}

/**
 * Pick initial language using multi-tier detection
 * Priority: localStorage → browser language → IP-based country mapping → English fallback
 */
function pickInitialLang() {
  // Check localStorage first
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
      return "en-us";
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

  // Final fallback to English
  return "en";
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
 * Initialize i18n system
 */
async function initI18n() {
  const lang = pickInitialLang();
  console.log('Story page detected language:', lang);
  
  const translations = await loadTranslations(lang);
  if (translations) {
    applyTranslations(translations);
  }
  
  // Add lang attribute to html element
  document.documentElement.lang = lang;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}
