/**
 * Regression coverage for the standalone accommodation-page booking links.
 * The production helper is a browser script in public/ because the four
 * standalone HTML pages do not go through the React bundle.
 */
// @vitest-environment happy-dom

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';

const helperSource = fs.readFileSync(
  path.resolve(process.cwd(), 'public/js/booking-context.js'),
  'utf8',
);
const navSource = fs.readFileSync(
  path.resolve(process.cwd(), 'public/js/shared-nav.js'),
  'utf8',
);

function installHelper(url, edgeLocale) {
  window.history.replaceState({}, '', url);
  window.__DEVOCEAN_LOCALE__ = edgeLocale;
  window.localStorage.clear();
  delete window.devoceanBookingContext;
  new Function('window', helperSource)(window);
  return window.devoceanBookingContext;
}

describe('standalone booking context', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  it('preserves the complete search and focuses the root-locale unit', () => {
    const context = installHelper(
      '/safari?checkIn=2026-12-20&checkOut=2026-12-24&adults=2&children=1&infants=1&discount=SUMMER10&currency=ZAR&ignored=drop-me',
      'en-GB',
    );

    expect(context.hasBookingContext()).toBe(true);
    expect(context.buildBookingUrl({ lang: 'en-GB' })).toBe(
      '/book-direct?checkIn=2026-12-20&checkOut=2026-12-24&adults=2&children=1&infants=1&discount=SUMMER10&currency=ZAR&unit=safari',
    );
  });

  it('keeps the locale prefix for localized unit pages', () => {
    const context = installHelper(
      '/pt-pt/chalet?checkIn=2027-01-02&checkOut=2027-01-05&adults=2&currency=EUR',
      'pt-PT',
    );

    expect(context.buildBookingUrl({ lang: 'pt-PT' })).toBe(
      '/pt-pt/book-direct?checkIn=2027-01-02&checkOut=2027-01-05&adults=2&currency=EUR&unit=chalet',
    );
  });

  it('uses stored currency for direct detail-page visitors without showing Back to Booking', () => {
    const context = installHelper('/comfort', 'en-GB');
    window.localStorage.setItem('site.currency', 'MZN');

    expect(context.hasBookingContext()).toBe(false);
    expect(context.buildBookingUrl({ lang: 'en-GB' })).toBe(
      '/book-direct?currency=MZN&unit=comfort',
    );
  });

  it('updates both desktop and mobile localized navigation links', () => {
    const context = installHelper(
      '/fr/safari?checkIn=2026-11-10&checkOut=2026-11-12&adults=2&children=0&currency=EUR',
      'fr-FR',
    );
    expect(context.buildBookingUrl({ lang: 'fr-FR' })).toContain('/fr/book-direct?');

    new Function('window', 'document', navSource)(window, document);

    expect(document.querySelector('.sn-book-top').getAttribute('href')).toBe(
      '/fr/book-direct?checkIn=2026-11-10&checkOut=2026-11-12&adults=2&children=0&currency=EUR&unit=safari',
    );
    expect(document.querySelector('.sn-drawer-book').getAttribute('href')).toBe(
      '/fr/book-direct?checkIn=2026-11-10&checkOut=2026-11-12&adults=2&children=0&currency=EUR&unit=safari',
    );
  });
});