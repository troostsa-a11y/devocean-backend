// Shared by React and the first-paint bootstrap on standalone HTML pages.
export const CC_TO_CURRENCY = {
  GB: 'GBP', IE: 'EUR', NL: 'EUR', BE: 'EUR', FR: 'EUR',
  DE: 'EUR', IT: 'EUR', ES: 'EUR', PT: 'EUR', AT: 'EUR',
  FI: 'EUR', SE: 'SEK', PL: 'PLN', GR: 'EUR', NO: 'NOK',
  DK: 'DKK', CH: 'CHF', CZ: 'CZK', HU: 'HUF', RO: 'RON',
  RS: 'RSD', HR: 'EUR', SI: 'EUR', BA: 'BAM', BG: 'BGN',
  SK: 'EUR', EE: 'EUR', LV: 'EUR', LT: 'EUR', MT: 'EUR',
  CY: 'EUR', LU: 'EUR', IS: 'ISK', LI: 'CHF', MC: 'EUR',
  UA: 'UAH', BY: 'BYN', MD: 'MDL', AL: 'ALL', MK: 'MKD',
  ME: 'EUR', XK: 'EUR', AD: 'EUR', SM: 'EUR', VA: 'EUR',
  ZA: 'ZAR', MZ: 'MZN', KE: 'KES', TZ: 'TZS', UG: 'UGX',
  ZW: 'USD', BW: 'BWP', NA: 'NAD', EG: 'EGP', MA: 'MAD',
  SZ: 'SZL', RE: 'EUR', MU: 'MUR', SC: 'SCR', LS: 'LSL',
  ZM: 'ZMW', MW: 'MWK', AO: 'AOA', GH: 'GHS', NG: 'NGN',
  ET: 'ETB', SD: 'SDG', DZ: 'DZD', TN: 'TND', LY: 'LYD',
  SN: 'XOF', CI: 'XOF', CM: 'XAF', RW: 'RWF', BI: 'BIF',
  SO: 'SOS', DJ: 'DJF',
  US: 'USD', CA: 'CAD', MX: 'MXN', BR: 'BRL', AR: 'ARS',
  CL: 'CLP', CO: 'COP', PE: 'PEN', VE: 'VES', EC: 'USD',
  UY: 'UYU', PY: 'PYG', BO: 'BOB', CR: 'CRC', PA: 'PAB',
  GT: 'GTQ', HN: 'HNL', SV: 'USD', NI: 'NIO', CU: 'CUP',
  DO: 'DOP', HT: 'HTG', JM: 'JMD', TT: 'TTD', BB: 'BBD',
  CN: 'CNY', HK: 'HKD', TW: 'TWD', MO: 'MOP',
  JP: 'JPY', KR: 'KRW', IN: 'INR', TH: 'THB',
  SG: 'SGD', MY: 'MYR', ID: 'IDR', PH: 'PHP', VN: 'VND',
  AE: 'AED', SA: 'SAR', QA: 'QAR', KW: 'KWD', BH: 'BHD',
  OM: 'OMR', IL: 'ILS', JO: 'JOD', LB: 'LBP', TR: 'TRY',
  PK: 'PKR', BD: 'BDT', LK: 'LKR', NP: 'NPR', MM: 'MMK',
  KH: 'KHR', LA: 'LAK', MN: 'MNT', KZ: 'KZT', UZ: 'UZS',
  RU: 'RUB',
  AU: 'AUD', NZ: 'NZD', FJ: 'FJD', PG: 'PGK', NC: 'XPF',
  PF: 'XPF', WS: 'WST', TO: 'TOP', VU: 'VUV', SB: 'SBD',
};

/**
 * No outer references in the function body: it is serialized into edge HTML.
 * A bare language must NOT be maximized to an invented country (de ≠ de-DE).
 * Currency and IP geography remain independent of the site's selected language.
 */
export function resolveVisitorCurrency(preferences = {}, countryCurrencies = CC_TO_CURRENCY) {
  const helpers = {
    normalize(value) {
      const currency = typeof value === 'string' ? value.trim().toUpperCase() : '';
      return /^[A-Z]{3}$/.test(currency) &&
        Object.values(countryCurrencies).includes(currency) ? currency : null;
    },
    browserPreference(value) {
      if (typeof value !== 'string') return null;
      try {
        const raw = value.trim().replace(/_/g, '-');
        // Intl.Locale reads only an explicit region; never call maximize().
        const locale = new Intl.Locale(raw);
        const country = locale.region || null;
        // Honor an explicit BCP-47 currency preference when a browser supplies it.
        const extension = raw.toLowerCase().split('-x-')[0].split('-u-')[1];
        const explicit = extension?.match(/(?:^|-)cu-([a-z]{3})(?:-|$)/)?.[1];
        const currency = helpers.normalize(explicit) || countryCurrencies[country];
        return currency ? { currency, country, source: 'browser' } : null;
      } catch {
        return null;
      }
    },
  };
  const manual = preferences.storedSource === 'user' &&
    helpers.normalize(preferences.storedCurrency);
  if (manual) {
    return { currency: manual, country: preferences.storedCountry || null, source: 'user' };
  }
  for (const language of preferences.browserLanguages || []) {
    const selected = helpers.browserPreference(language);
    if (selected) return selected;
  }
  const country = String(preferences.countryCode || '').toUpperCase();
  if (countryCurrencies[country]) {
    return { currency: countryCurrencies[country], country, source: 'ip' };
  }
  return { currency: 'USD', country: null, source: 'default' };
}
