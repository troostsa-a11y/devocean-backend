/**
 * Shared Booking URL Generator
 * Dynamically updates booking button URLs based on localStorage preferences
 * Used by accommodation detail pages: safari.html, chalet.html, cottage.html, comfort.html
 */

// Booking engine locale mapping (matches React app)
const LOCALE_BY_LANG = {
  en: "en-GB", "en-US": "en-US", "pt-PT": "pt-PT", "pt-BR": "pt-BR", nl: "nl-NL",
  fr: "fr-FR", it: "it-IT", de: "de-DE", es: "es-ES", sv: "sv", pl: "pl", 
  ja: "ja-JP", zh: "zh-CN", ru: "ru", "af-ZA": "af-ZA", zu: "en-GB", sw: "sw",
};

/**
 * Get booking locale - direct mapping from language code
 * Note: Hotelrunner supports pt-PT and pt-BR
 */
function getBookingLocale(lang, currency) {
  // Direct mapping for all languages (including pt-PT and pt-BR)
  if (LOCALE_BY_LANG[lang]) {
    return LOCALE_BY_LANG[lang];
  }
  
  // Fallback to UK English
  return "en-GB";
}

/**
 * Update all booking button URLs on the page
 */
function updateBookingUrls() {
  // Get stored preferences (set by main React app)
  const lang = localStorage.getItem('site.lang') || 'en';
  const currency = localStorage.getItem('site.currency') || 'USD';
  
  // Get booking locale
  const locale = getBookingLocale(lang, currency);
  const bookingUrl = `https://book.devoceanlodge.com/bv3/search?locale=${locale}&currency=${currency}`;
  
  console.log('Accommodation page booking URL:', { lang, currency, locale, bookingUrl });
  
  // Update all booking buttons (using data-testid for reliability)
  const bookButtons = document.querySelectorAll('a[data-testid="button-book-now"]');
  bookButtons.forEach(button => {
    button.href = bookingUrl;
  });
  
  // Also update any links with class "btn-primary" that point to book.devoceanlodge.com
  document.querySelectorAll('a.btn-primary[href*="book.devoceanlodge.com"]').forEach(button => {
    button.href = bookingUrl;
  });
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateBookingUrls);
} else {
  updateBookingUrls();
}
