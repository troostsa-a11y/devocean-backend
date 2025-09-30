// Lazy-loadable L10N translations
// These can be loaded on-demand per language

export async function loadL10N(lang) {
  // For now, we'll import from the main translations file
  // In production, these could be split into separate chunks per language
  const { L10N } = await import('./translations.js');
  return L10N[lang] || {};
}

// Preload for specific language
export function preloadL10N(lang) {
  return loadL10N(lang);
}
