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