// Dynamic translation loader - loads only the needed language
// This reduces initial bundle size from 152KB to ~15KB max per language

const translationCache = new Map();
const l10nCache = new Map();

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
    
    // Cache both UI and L10N
    translationCache.set(lang, ui);
    l10nCache.set(lang, l10n);
    
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
