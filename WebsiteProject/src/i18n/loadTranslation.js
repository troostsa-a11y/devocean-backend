// Dynamic translation loader - loads only the needed language
// This reduces initial bundle size from 152KB to ~15KB max per language

const translationCache = new Map();
const l10nCache = new Map();

// Locale alias map - languages that share the same translation file
// This ensures cache consistency for regional variants
const LOCALE_ALIASES = {
  'pt-BR': 'pt-PT',  // Brazilian Portuguese uses Portugal Portuguese file
  'pt': 'pt-PT'
};

export async function loadTranslation(lang) {
  // Check cache first
  if (translationCache.has(lang)) {
    return translationCache.get(lang);
  }

  try {
    // Dynamic import based on language code
    const module = await import(`./langs/${lang}.js`);
    const ui = module.UI || module.default;
    const l10n = module.L10N || {};
    
    // Cache both UI and L10N for the requested language
    translationCache.set(lang, ui);
    l10nCache.set(lang, l10n);
    
    // Also cache for any aliases pointing TO this language
    // Example: if loading pt-PT, also cache as pt-BR (since pt-BR maps to pt-PT)
    for (const [alias, target] of Object.entries(LOCALE_ALIASES)) {
      if (target === lang && !l10nCache.has(alias)) {
        l10nCache.set(alias, l10n);
        translationCache.set(alias, ui);
      }
    }
    
    // If this language IS an alias, also cache under the target
    // Example: if loading pt-BR, also cache as pt-PT (the canonical form)
    if (LOCALE_ALIASES[lang]) {
      const target = LOCALE_ALIASES[lang];
      if (!l10nCache.has(target)) {
        l10nCache.set(target, l10n);
        translationCache.set(target, ui);
      }
    }
    
    return ui;
  } catch (error) {
    console.warn(`Failed to load translation for "${lang}", falling back to en-GB:`, error);
    
    // Fallback to English if language file doesn't exist
    if (lang !== 'en-GB') {
      return loadTranslation('en-GB');
    }
    
    throw error;
  }
}

// Get L10N synchronously (must be loaded first via loadTranslation)
export function getL10N(lang) {
  return l10nCache.get(lang) || {};
}

// Preload a translation (for prefetching)
export function preloadTranslation(lang) {
  return loadTranslation(lang).catch(() => {
    // Silent fail for preloading
  });
}
