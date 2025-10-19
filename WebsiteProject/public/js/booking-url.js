/**
 * Shared Booking URL Generator
 * Dynamically updates booking button URLs based on localStorage preferences
 * Used by accommodation detail pages: safari.html, chalet.html, cottage.html, comfort.html
 */

// Booking engine locale mapping (matches React app)
const LOCALE_BY_LANG = {
  en: "en-GB", "en-us": "en-US", pt: "pt-PT", nl: "nl-NL",
  fr: "fr-FR", it: "it-IT", de: "de-DE", es: "es-ES", sv: "sv", pl: "pl", 
  ja: "ja-JP", zh: "zh-CN", ru: "ru", "af-za": "af-ZA", zu: "en-GB", sw: "sw",
};

/**
 * Get booking locale with smart currency-based mapping
 * Mirrors the React app's getBookingLocale() function
 * Note: Hotelrunner only supports pt-PT and pt-BR (not pt-MZ)
 */
function getBookingLocale(lang, currency) {
  // Handle Portuguese - use region-aware locale (Hotelrunner only supports pt-PT and pt-BR)
  if (lang === 'pt') {
    if (currency === 'EUR') return 'pt-PT'; // Portugal
    return 'pt-BR'; // Brazil, Mozambique, Angola (use Brazilian variant)
  }
  
  // Handle English - distinguish US from UK
  if (lang === 'en-us') return 'en-US';
  if (lang === 'en') return 'en-GB';
  
  // Standard language mappings (Afrikaans always af-ZA, currency is separate parameter)
  return LOCALE_BY_LANG[lang] || "en-GB";
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
