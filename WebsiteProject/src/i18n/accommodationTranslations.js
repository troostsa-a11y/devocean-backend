// Import accommodation translations from JSON
import translationsData from '../../translations/accommodation-translations.json';

// Transform the JSON structure to match the localize function expectations
// From: { "en": { "safari": { "title": "...", "shortDescription": "...", "detailedFeatures": [...] } } }
// To: { "en": { "safari": { "title": "...", "short": "...", "details": [...] } } }
export const ACCOMMODATION_TRANSLATIONS = {};

Object.keys(translationsData).forEach(lang => {
  ACCOMMODATION_TRANSLATIONS[lang] = {};
  
  Object.keys(translationsData[lang]).forEach(unitKey => {
    ACCOMMODATION_TRANSLATIONS[lang][unitKey] = {
      title: translationsData[lang][unitKey].title,
      short: translationsData[lang][unitKey].shortDescription,
      details: translationsData[lang][unitKey].detailedFeatures
    };
  });
});
