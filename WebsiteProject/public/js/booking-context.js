/**
 * Shared booking-context URL builder for standalone accommodation pages.
 *
 * The booking funnel deliberately passes only search state between pages.
 * Guest details and payment state stay inside the booking flow.
 */
(function (window) {
  'use strict';

  var BOOKING_QUERY_KEYS = [
    'checkIn',
    'checkOut',
    'adults',
    'children',
    'infants',
    'discount',
    'currency',
  ];
  var UNIT_KEYS = ['safari', 'comfort', 'cottage', 'chalet'];
  var PATH_PREFIXES = {
    'en-US': 'en-us',
    'pt-PT': 'pt-pt',
    'pt-BR': 'pt-br',
    'nl-NL': 'nl',
    'fr-FR': 'fr',
    'it-IT': 'it',
    'de-DE': 'de',
    'es-ES': 'es',
    sv: 'sv',
    pl: 'pl',
    ro: 'ro',
    sr: 'sr',
    hr: 'hr',
    cs: 'cs',
    tr: 'tr',
    'ja-JP': 'ja',
    'zh-CN': 'zh-hans',
    ru: 'ru',
    'af-ZA': 'af',
    zu: 'zu',
    sw: 'sw',
  };

  function localePrefix(lang) {
    return PATH_PREFIXES[lang] || '';
  }

  function unitFromPath(pathname) {
    var segments = String(pathname || '')
      .split('/')
      .filter(Boolean)
      .map(function (segment) { return segment.toLowerCase(); });
    var candidate = segments[0];
    var prefixed = Object.keys(PATH_PREFIXES).some(function (code) {
      return PATH_PREFIXES[code] === candidate;
    });
    if (prefixed) candidate = segments[1];
    candidate = (candidate || '').replace(/\.html$/, '');
    return UNIT_KEYS.indexOf(candidate) >= 0 ? candidate : '';
  }

  function storedValue(key) {
    try {
      return window.localStorage.getItem(key) || '';
    } catch (_) {
      return '';
    }
  }

  function copyBookingQuery(search) {
    var incoming = new URLSearchParams(
      search == null ? window.location.search : search
    );
    var outgoing = new URLSearchParams();

    BOOKING_QUERY_KEYS.forEach(function (key) {
      var value = incoming.get(key);
      if (value) outgoing.set(key, value);
    });

    return outgoing;
  }

  function localizedHomepagePath(lang) {
    var prefix = localePrefix(lang);
    return prefix ? '/' + prefix + '/' : '/';
  }

  function buildBookingUrl(options) {
    options = options || {};
    var outgoing = copyBookingQuery(options.search);

    if (!outgoing.get('currency')) {
      var storedCurrency = storedValue('site.currency');
      if (storedCurrency) outgoing.set('currency', storedCurrency);
    }

    var lang = options.lang || window.__DEVOCEAN_LOCALE__ || 'en-GB';
    var prefix = localePrefix(lang);
    var bookingPath = prefix ? '/' + prefix + '/book-direct' : '/book-direct';
    var unit = options.unit || unitFromPath(window.location.pathname);
    if (unit) outgoing.set('unit', unit);

    var query = outgoing.toString();
    return bookingPath + (query ? '?' + query : '');
  }

  function buildAccommodationsUrl(options) {
    options = options || {};

    // Keep direct detail-page visitors on the existing plain homepage link.
    // Only a real booking search should add state to the comparison URL.
    if (!hasBookingContext(options.search)) return '/#stay';

    var outgoing = copyBookingQuery(options.search);
    if (!outgoing.get('currency')) {
      var storedCurrency = storedValue('site.currency');
      if (storedCurrency) outgoing.set('currency', storedCurrency);
    }

    var lang = options.lang || window.__DEVOCEAN_LOCALE__ || 'en-GB';
    var homepagePath = localizedHomepagePath(lang);
    var query = outgoing.toString();
    return homepagePath + (query ? '?' + query : '') + '#stay';
  }

  function hasBookingContext(search) {
    var incoming = new URLSearchParams(
      search == null ? window.location.search : search
    );
    return Boolean(incoming.get('checkIn') && incoming.get('checkOut'));
  }

  window.devoceanBookingContext = {
    buildBookingUrl: buildBookingUrl,
    buildAccommodationsUrl: buildAccommodationsUrl,
    hasBookingContext: hasBookingContext,
    unitFromPath: unitFromPath,
  };
})(window);