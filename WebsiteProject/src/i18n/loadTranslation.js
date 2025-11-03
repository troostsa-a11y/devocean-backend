// Dynamic translation loader - loads only the needed language
// This reduces initial bundle size from 152KB to ~7KB per language

const translationCache = new Map();

export async function loadTranslation(lang) {
  // Check cache first
  if (translationCache.has(lang)) {
    return translationCache.get(lang);
  }

  try {
    // Dynamic import based on language code
    const module = await import(`./langs/${lang}.js`);
    const translation = module.default;
    
    // Cache the loaded translation
    translationCache.set(lang, translation);
    
    return translation;
  } catch (error) {
    console.warn(`Failed to load translation for "${lang}", falling back to en-GB:`, error);
    
    // Fallback to English if language file doesn't exist
    if (lang !== 'en-GB') {
      return loadTranslation('en-GB');
    }
    
    throw error;
  }
}

// Preload a translation (for prefetching)
export function preloadTranslation(lang) {
  return loadTranslation(lang).catch(() => {
    // Silent fail for preloading
  });
}
