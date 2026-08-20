/**
 * Browser-level smoke coverage for the standalone accommodation pages and the
 * React accommodation comparison section. The test uses happy-dom because the
 * project does not ship a separate browser-driver dependency; it still loads
 * the real HTML fixtures and production standalone scripts.
 */
// @vitest-environment happy-dom

import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import AccommodationsSection from '../../components/AccommodationsSection';
import BookDirectPage from '../../components/BookDirectPage';
import { buildBookingUrl } from '../localize';

const UNITS = [
  { key: 'safari', locale: 'en-GB', prefix: '' },
  { key: 'comfort', locale: 'pt-PT', prefix: 'pt-pt' },
  { key: 'cottage', locale: 'de-DE', prefix: 'de' },
  { key: 'chalet', locale: 'zh-CN', prefix: 'zh-hans' },
];

const SEARCH = {
  checkIn: '2026-12-20',
  checkOut: '2026-12-24',
  adults: '2',
  children: '1',
  infants: '1',
  discount: 'SUMMER10',
  currency: 'ZAR',
};

const searchQuery = new URLSearchParams(SEARCH).toString();
const standaloneBookingContextSource = fs.readFileSync(
  path.resolve(process.cwd(), 'public/js/booking-context.js'),
  'utf8',
);
const standaloneI18nSource = fs.readFileSync(
  path.resolve(process.cwd(), 'public/translations/accommodation-detail-i18n.js'),
  'utf8',
);

const ui = {
  stay: { headline: 'Stay', blurb: 'Find your stay', moreDetails: 'Details' },
  experiences: { headline: 'Experiences', blurb: 'Explore', cta: 'Explore' },
  nav: { experiences: 'Experiences' },
};

const cardUnits = UNITS.map(({ key }) => ({
  key,
  title: `${key} accommodation`,
  img: `/photos/${key}.jpg`,
  short: `${key} description`,
}));

function installStandalonePage(unit, search = `?${searchQuery}`) {
  const html = fs.readFileSync(
    path.resolve(process.cwd(), `${unit.key}.html`),
    'utf8',
  );
  // Keep the real body fixture, but exclude external resources that are
  // unrelated to this journey. Parsing the complete document would make
  // happy-dom start fetching head resources before the test can remove them.
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = (bodyMatch ? bodyMatch[1] : html)
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '');

  window.history.replaceState(
    {},
    '',
    `${unit.prefix ? `/${unit.prefix}` : ''}/${unit.key}${search}`,
  );
  window.__DEVOCEAN_LOCALE__ = unit.locale;
  window.localStorage.clear();
  document.body.innerHTML = bodyHtml;

  new Function('window', standaloneBookingContextSource)(window);
  return new Function(
    'window',
    'document',
    'fetch',
    standaloneI18nSource,
  )(window, document, async () => ({
    ok: true,
    json: async () => ({}),
  }));
}

async function waitForStandaloneScripts() {
  // The i18n script awaits its translation JSON before it rewrites links.
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function expectedHomepageBookingUrl() {
  return `/book-direct?${searchQuery}`;
}

function expectedDetailBookingUrl(unit) {
  const bookingPath = unit.prefix ? `/${unit.prefix}/book-direct` : '/book-direct';
  return `${bookingPath}?${searchQuery}`;
}

describe('booking search comparison journey', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it.each(UNITS)(
    'preserves the complete search when $key leads to its localized comparison page',
    async (unit) => {
      installStandalonePage(unit);
      await waitForStandaloneScripts();

      const comparisonHref = `/${unit.prefix ? `${unit.prefix}/` : ''}?${searchQuery}#stay`;
      expect(
        document.querySelector('[data-accommodation-context-link]').getAttribute('href'),
      ).toBe(comparisonHref);

      // These are the actual booking CTAs in the standalone page, not a
      // re-created anchor. They should return to the native booking route with
      // the same search state and the originating unit selected.
      expect(document.querySelector('[data-testid="button-book-now"]').getAttribute('href')).toBe(
        `${expectedDetailBookingUrl(unit)}&unit=${unit.key}`,
      );

      // Follow the comparison link into the real React homepage and verify
      // every accommodation card points back to the same booking search.
      window.history.replaceState({}, '', comparisonHref);
      render(
        createElement(AccommodationsSection, {
          units: cardUnits,
          ui,
          bookUrl: buildBookingUrl(unit.locale, SEARCH.currency),
          lang: unit.locale,
          currency: SEARCH.currency,
        }),
      );

      for (const cardUnit of cardUnits) {
        expect(screen.getByTestId(`button-book-${cardUnit.key}`).getAttribute('href')).toBe(
          expectedHomepageBookingUrl(),
        );
      }
    },
  );

  it('keeps the plain /#stay link for a direct detail-page visit without search state', async () => {
    installStandalonePage({ key: 'chalet', locale: 'de-DE', prefix: 'de' }, '');
    await waitForStandaloneScripts();

    expect(
      document.querySelector('[data-accommodation-context-link]').getAttribute('href'),
    ).toBe('/#stay');
  });

  it('loads live availability with the handed-off search and focuses the selected unit', async () => {
    const unit = 'chalet';
    const availabilityRequests = [];
    const onCurrencyChange = vi.fn();
    const scrollIntoView = vi.fn();
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = scrollIntoView;

    window.history.replaceState(
      {},
      '',
      `/de/book-direct?${searchQuery}&unit=${unit}`,
    );

    vi.spyOn(globalThis, 'fetch').mockImplementation((url, init) => {
      if (String(url).includes('/api/booking/availability')) {
        availabilityRequests.push(JSON.parse(init.body));
        return Promise.resolve({
          ok: true,
          json: async () => ({
            checkIn: SEARCH.checkIn,
            checkOut: SEARCH.checkOut,
            nights: 4,
            currency: 'USD',
            cancellationPolicyDays: 30,
            maxRooms: 5,
            rooms: [{
              roomId: 'chalet-live',
              name: 'Thatched Chalet',
              currency: 'USD',
              nights: 4,
              maxAdults: 4,
              maxPeople: 4,
              maxChildren: 2,
              available: true,
              offers: [{
                offerId: 'chalet-flex',
                total: 800,
                type: 'semiFlex',
                unitsAvailable: 2,
                refundable: true,
              }],
            }],
          }),
        });
      }
      if (String(url).includes('/api/booking/calendar')) {
        return Promise.resolve({ ok: true, json: async () => ({ prices: {} }) });
      }
      if (String(url).includes('/api/fx')) {
        return Promise.resolve({ ok: true, json: async () => ({ base: 'USD', rates: { ZAR: 18 } }) });
      }
      return Promise.resolve({ ok: false, json: async () => ({}) });
    });

    try {
      render(createElement(BookDirectPage, {
        lang: 'de-DE',
        currency: SEARCH.currency,
        onCurrencyChange,
      }));

      expect(screen.getByTestId('select-adults').value).toBe(SEARCH.adults);
      expect(screen.getByTestId('select-children').value).toBe(SEARCH.children);
      expect(screen.getByTestId('select-infants').value).toBe(SEARCH.infants);
      expect(screen.getByTestId('input-discount-code').value).toBe(SEARCH.discount);
      expect(onCurrencyChange).toHaveBeenCalledWith(SEARCH.currency);

      await act(async () => {
        fireEvent.change(screen.getByTestId('select-child-age-0'), { target: { value: '8' } });
        fireEvent.change(screen.getByTestId('select-infant-age-0'), { target: { value: '1' } });
        fireEvent.click(screen.getByTestId('button-search'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('card-room-chalet-live')).toBeTruthy();
      });
      expect(availabilityRequests).toEqual([{
        checkIn: SEARCH.checkIn,
        checkOut: SEARCH.checkOut,
        adults: 2,
        children: 1,
        infants: 1,
      }]);
      expect(scrollIntoView).toHaveBeenCalled();
      expect(window.location.search).toContain('infants=1');
      expect(window.location.search).toContain('unit=chalet');
    } finally {
      Element.prototype.scrollIntoView = originalScrollIntoView;
      vi.restoreAllMocks();
    }
  });
});
