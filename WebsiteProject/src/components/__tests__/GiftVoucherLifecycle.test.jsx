import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import GiftConfirmedPage from '../GiftConfirmedPage';
import { GiftVouchersTab } from '../AdminPage';

beforeEach(() => {
  window.history.replaceState({}, '', '/gift-confirmed?session_id=cs_test');
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const mockResponse = (data) => vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true, json: async () => data,
}));

describe('Gift voucher payment lifecycle screens', () => {
  it.each(['pending', 'checkout_expired', 'failed'])('does not claim success for %s', async (status) => {
    mockResponse({ status, code: null, amountUsd: 100 });
    render(<GiftConfirmedPage lang="en" />);
    await screen.findByTestId('text-error');
    expect(screen.queryByText('Your gift voucher is ready!')).toBeNull();
    expect(screen.getByText('Check again')).toBeTruthy();
  });
  it('shows the code only for an issued voucher', async () => {
    mockResponse({ status: 'active', code: 'GIFT-TEST', amountUsd: 100 });
    render(<GiftConfirmedPage lang="en" />);
    expect(await screen.findByText('GIFT-TEST')).toBeTruthy();
    expect(screen.getByText('Your gift voucher is ready!')).toBeTruthy();
  });
  it('shows unpaid attempts without implying they are purchases', async () => {
    mockResponse({ vouchers: [
      { id: 1, amountUsd: 100, status: 'pending', code: null, expiresAt: '2027-09-12' },
      { id: 2, amountUsd: 100, status: 'checkout_expired', code: null, expiresAt: '2027-09-12' },
    ], warning: 'Stripe verification unavailable.' });
    render(<GiftVouchersTab apiUrl="" apiKey="test" />);
    expect(await screen.findByText('Awaiting payment')).toBeTruthy();
    expect(screen.getByText('Checkout expired — unpaid')).toBeTruthy();
    expect(screen.getAllByText('Not issued')).toHaveLength(2);
    expect(screen.getByText(/0 vouchers issued/)).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Stripe verification unavailable');
    expect(screen.queryByText('12 Sept 2027')).toBeNull();
  });
});