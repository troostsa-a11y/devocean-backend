import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { buildBookingCompleteEvent } from '../BookingConfirmedPage';
import BookingConfirmedPage from '../BookingConfirmedPage';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('confirmed-booking GTM ecommerce event', () => {
  it('creates a GA4 purchase payload from the confirmed booking response', () => {
    expect(buildBookingCompleteEvent({
      status: 'confirmed',
      total: 399,
      deposit: 199.5,
      currency: 'usd',
      roomName: 'Comfort Tent',
      checkIn: '2026-09-23',
      checkOut: '2026-09-28',
      beds24BookingId: '93285120',
    }, 'session-123')).toEqual({
      event: 'booking_complete',
      transaction_id: 'direct_session-123',
      value: 399,
      currency: 'USD',
      deposit: 199.5,
      booking_reference: '93285120',
      check_in: '2026-09-23',
      check_out: '2026-09-28',
      items: [{
        item_id: '93285120',
        item_name: 'Comfort Tent',
        item_category: 'Accommodation',
        price: 399,
        quantity: 1,
      }],
    });
  });

  it('preserves separate room items for a multi-room booking', () => {
    const event = buildBookingCompleteEvent({
      total: 800,
      currency: 'USD',
      legs: [
        { beds24BookingId: '100', roomName: 'Comfort Tent', total: 399 },
        { beds24BookingId: '101', roomName: 'Garden Cottage', total: 401 },
      ],
    }, 'multi-room-session');

    expect(event.items).toHaveLength(2);
    expect(event.items.map((item) => item.item_name)).toEqual([
      'Comfort Tent',
      'Garden Cottage',
    ]);
    expect(event.transaction_id).toBe('direct_multi-room-session');
  });

  it('does not create an event without a confirmed booking total or session reference', () => {
    expect(buildBookingCompleteEvent({ total: 399 }, '')).toBeNull();
    expect(buildBookingCompleteEvent({ total: 'not-a-number' }, 'session')).toBeNull();
  });

  it('shows the actual EUR card deposit while keeping arrival balance and analytics in USD', async () => {
    window.history.pushState({}, '', '/booking-confirmed?ref=eur-session');
    window.dataLayer = [];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'confirmed', total: 100, deposit: 50, balanceDue: 50, currency: 'USD',
        guestFirstName: 'Test', payment: { currency: 'EUR', deposit: 46 },
      }),
    }));
    const { getByTestId } = render(<BookingConfirmedPage lang="en-GB" />);
    await waitFor(() => {
      expect(getByTestId('text-deposit-paid').textContent).toMatch(/46/);
    });
    expect(getByTestId('text-deposit-paid').textContent).toContain('€');
    const [event] = window.dataLayer.filter((entry) => entry.event === 'booking_complete');
    expect(event.currency).toBe('USD');
    expect(event.deposit).toBe(50);
    expect(event.value).toBe(100);
  });

  it('warns against paying again when payment verification needs reception review', async () => {
    window.history.pushState({}, '', '/booking-confirmed?ref=review-session');
    window.dataLayer = [];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'pending', paymentStatus: 'review_required' }),
    }));
    const { findByTestId, queryByTestId } = render(<BookingConfirmedPage lang="en-GB" />);
    expect((await findByTestId('status-payment-review')).textContent).toContain('Please do not pay again');
    expect(queryByTestId('link-book-again')).toBeNull();
    expect(window.dataLayer).toHaveLength(0);
  });

  it('pushes exactly one event when the confirmation endpoint reports confirmed', async () => {
    window.history.pushState({}, '', '/booking-confirmed?ref=session-456');
    window.dataLayer = [];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'confirmed',
        total: 399,
        currency: 'USD',
        roomName: 'Comfort Tent',
      }),
    }));

    render(<BookingConfirmedPage />);
    await waitFor(() => {
      expect(window.dataLayer.filter((entry) => entry.event === 'booking_complete')).toHaveLength(1);
    });

    const [event] = window.dataLayer.filter((entry) => entry.event === 'booking_complete');
    expect(event.transaction_id).toBe('direct_session-456');
    expect(event.value).toBe(399);
    expect(window.fetch).toHaveBeenCalledTimes(1);
  });
});