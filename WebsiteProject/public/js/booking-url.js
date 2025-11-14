/**
 * Shared Booking URL Generator
 * Dynamically updates booking button URLs based on localStorage preferences
 * Used by accommodation detail pages: safari.html, chalet.html, cottage.html, comfort.html
 */

// Convert Hotelrunner locale codes to ISO 639-1 two-letter codes (lowercase)
const localeToISO6391 = (locale) => {
  const mapping = {
    "en-GB": "en",
    "en-US": "en",
    "pt-PT": "pt",
    "pt-BR": "pt",
    "nl-NL": "nl",
    "fr-FR": "fr",
    "it-IT": "it",
    "de-DE": "de",
    "es-ES": "es",
    "ja-JP": "ja",
    "zh-CN": "zh",
    "af-ZA": "af",
    "sv": "sv",
    "pl": "pl",
    "ru": "ru",
    "zu": "zu",
    "sw": "sw"
  };
  return mapping[locale] || "en";
};

/**
 * Update all booking button URLs on the page
 */
function updateBookingUrls() {
  // Get stored preferences (set by main React app)
  const lang = localStorage.getItem('site.lang') || 'en';
  const currency = localStorage.getItem('site.currency') || 'USD';
  
  // Convert to ISO 639-1 format
  const isoLang = localeToISO6391(lang);
  
  // Map language codes to their respective static booking pages
  const langFiles = {
    'en': 'EN-GB',
    'de': 'DE',
    'es': 'ES',
    'fr': 'FR',
    'it': 'IT',
    'nl': 'NL',
    'pt': 'PT',
    'ru': 'RU',
    'zh': 'ZH',
    'sv': 'SV',
    'ja': 'JA',
    'pl': 'PL',
    'af': 'AF',
    'zu': 'ZU',
    'sw': 'SW'
  };
  
  // Route to language-specific static booking pages in /book/ folder
  const langFile = langFiles[isoLang] || 'EN-GB';
  const bookingUrl = `/book/${langFile}.html?currency=${currency}`;
  
  console.log('Accommodation page booking URL:', { lang, currency, isoLang, langFile, bookingUrl });
  
  // Update all booking buttons (using data-testid for reliability)
  const bookButtons = document.querySelectorAll('a[data-testid="button-book-now"]');
  bookButtons.forEach(button => {
    button.href = bookingUrl;
  });
  
  // Also update any links with class "btn-primary" that contain booking references
  document.querySelectorAll('a.btn-primary[href*="book"]').forEach(button => {
    button.href = bookingUrl;
  });
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateBookingUrls);
} else {
  updateBookingUrls();
}
