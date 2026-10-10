// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { resolveVisitorCurrency } from '../visitorCurrency.js';
import { LOCALES } from '../localeCatalog.js';
import { getPaymentStrings } from '../paymentStrings.js';

describe('website currency priority', () => {
  it('honors a saved manual currency before browser and IP', () => {
    expect(resolveVisitorCurrency({
      storedCurrency: 'ZAR', storedSource: 'user', storedCountry: 'ZA',
      browserLanguages: ['de-DE'], countryCode: 'MZ',
    })).toEqual({ currency: 'ZAR', source: 'user', country: 'ZA' });
  });

  it.each([
    ['de-DE', 'EUR', 'DE'], ['de-CH', 'CHF', 'CH'], ['de-AT', 'EUR', 'AT'],
    ['en-GB', 'GBP', 'GB'], ['en-US', 'USD', 'US'], ['en-ZA', 'ZAR', 'ZA'],
    ['pt-MZ', 'MZN', 'MZ'], ['zh-Hant-TW', 'TWD', 'TW'],
  ])('uses the explicit region in %s', (locale, currency, country) => {
    expect(resolveVisitorCurrency({ browserLanguages: [locale], countryCode: 'MZ' }))
      .toEqual({ currency, source: 'browser', country });
  });

  it('honors a browser-supplied currency extension before its region', () => {
    expect(resolveVisitorCurrency({ browserLanguages: ['en-GB-u-cu-eur'], countryCode: 'MZ' }))
      .toEqual({ currency: 'EUR', source: 'browser', country: 'GB' });
  });

  it('does not treat private-use subtags as a currency preference', () => {
    expect(resolveVisitorCurrency({ browserLanguages: ['en-GB-x-u-cu-eur'], countryCode: 'MZ' }).currency)
      .toBe('GBP');
  });

  it('ignores old automatic choices and unsupported manual values', () => {
    for (const stored of [
      { storedCurrency: 'MZN', storedSource: 'ip' },
      { storedCurrency: 'USD', storedSource: 'region' },
      { storedCurrency: 'XYZ', storedSource: 'user' },
    ]) {
      expect(resolveVisitorCurrency({ ...stored, browserLanguages: ['de-DE'], countryCode: 'MZ' }).currency)
        .toBe('EUR');
    }
  });

  it.each([[], ['de'], ['invalid_%%%'], ['es-419']])('falls back to IP when no usable browser currency exists (%j)', (browserLanguages) => {
    expect(resolveVisitorCurrency({ browserLanguages, countryCode: 'MZ' }))
      .toEqual({ currency: 'MZN', source: 'ip', country: 'MZ' });
  });

  it('tries later browser preferences before IP', () => {
    expect(resolveVisitorCurrency({ browserLanguages: ['de', 'de-CH'], countryCode: 'MZ' }).currency)
      .toBe('CHF');
  });

  it('uses USD only as the final fallback', () => {
    expect(resolveVisitorCurrency({ browserLanguages: ['de'], countryCode: 'XX' }))
      .toEqual({ currency: 'USD', source: 'default', country: null });
  });

  it('does not infer currency from the site language or region', () => {
    expect(resolveVisitorCurrency({
      selectedLanguage: 'de-DE', selectedRegion: 'westEu',
      browserLanguages: ['en-GB'], countryCode: 'MZ',
    }).currency).toBe('GBP');
  });
});

describe('payment notices cover every website language', () => {
  it.each(LOCALES.map(({ code }) => code))('has all messages for %s', (lang) => {
    const strings = getPaymentStrings(lang);
    expect(Object.keys(strings).sort()).toEqual([
      'balanceCurrency', 'checkoutCurrency', 'displayEstimate', 'fxUnavailable',
      'paymentEstimate', 'reviewMsg', 'reviewTitle',
    ]);
    expect(strings.checkoutCurrency).toContain('{currency}');
    expect(strings.balanceCurrency).toContain('{currency}');
    expect(strings.paymentEstimate).toContain('{amount}');
    if (!lang.startsWith('en')) expect(strings).not.toEqual(getPaymentStrings('en-GB'));
  });
});
