import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import RoomCard from '../RoomCard';
import GiftVouchersPage from '../GiftVouchersPage';
import GiftConfirmedPage from '../GiftConfirmedPage';
import BookingConfirmedPage from '../BookingConfirmedPage';
import { getBookingStrings } from '../../i18n/bookingStrings';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('booking navigation uses locale paths, not language queries', () => {
  it.each([['de-DE', '/de'], ['pt-BR', '/pt-br'], ['zh-CN', '/zh-hans'], ['en-US', '']])(
    'keeps %s and the booking context in a room-detail link',
    (lang, prefix) => {
      const room = {
        roomId: 'test-safari', name: 'Safari Tent', currency: 'USD', nights: 2,
        maxAdults: 2, maxPeople: 3, maxChildren: 1, available: true,
        offers: [{ offerId: 'test-offer', total: 100, type: 'semiFlex', unitsAvailable: 2, refundable: true }],
      };
      render(<RoomCard room={room} displayName="Safari Tent" qty={0} canAddRoom
        rateChoiceId="test-offer" freeCancellation cancelDays={30}
        effAdults={2} effChildren={0} effInfants={0}
        t={getBookingStrings(lang)} lang={lang} currency="USD" toView={value => value}
        detailQueryString="checkIn=2027-01-10&checkOut=2027-01-12&adults=2&children=1&infants=1&discount=RETURN&currency=EUR" />);
      const target = new URL(screen.getByTestId('link-room-details-test-safari').getAttribute('href'), window.location.origin);
      expect(target.pathname).toBe(`${prefix}/safari`);
      expect(Object.fromEntries(target.searchParams)).toEqual({
        checkIn: '2027-01-10', checkOut: '2027-01-12', adults: '2',
        children: '1', infants: '1', discount: 'RETURN', currency: 'EUR',
      });
    },
  );

  it('sends the selected full locale when starting voucher checkout', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Isolated test — no checkout created' }) });
    vi.stubGlobal('fetch', fetch);
    render(<GiftVouchersPage lang="pt-BR" />);
    fireEvent.change(screen.getByTestId('input-purchaser-name'), { target: { value: 'Test guest' } });
    fireEvent.change(screen.getByTestId('input-purchaser-email'), { target: { value: 'guest@example.test' } });
    fireEvent.submit(screen.getByTestId('button-pay').closest('form'));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(fetch.mock.calls[0][0]).toBe('/api/gift-voucher/checkout');
    expect(JSON.parse(fetch.mock.calls[0][1].body).locale).toBe('pt-BR');
  });

  it('keeps the Stripe session identifier and locale when displaying an issued voucher', async () => {
    window.history.replaceState({}, '', '/pt-br/gift-confirmed?session_id=cs_test_locale');
    const fetch = vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ status: 'active', code: 'GIFT-TEST-LOCALE', amountUsd: 100 }),
    });
    vi.stubGlobal('fetch', fetch);
    const { container } = render(<GiftConfirmedPage lang="pt-BR" />);
    await screen.findByText('GIFT-TEST-LOCALE');
    expect(fetch.mock.calls[0][0]).toBe('/api/gift-voucher/confirm?session_id=cs_test_locale');
    expect(container.querySelector('a[href="/pt-br/book-direct"]')).not.toBeNull();
    expect(container.querySelector('a[href="/pt-br/gift-vouchers"]')).not.toBeNull();
  });

  it('keeps the website locale on confirmation-page recovery links without inventing a booking', async () => {
    window.history.replaceState({}, '', '/de/booking-confirmed');
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const { container } = render(<BookingConfirmedPage lang="de-DE" />);
    await waitFor(() => expect(container.querySelector('a[href="/de/"]')).not.toBeNull());
    expect(fetch).not.toHaveBeenCalled();
  });
});
