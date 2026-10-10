import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import BookingPaymentNotice from '../BookingPaymentNotice';

afterEach(cleanup);

describe('card payment is distinguished from display and property currencies', () => {
  it.each(['USD', 'EUR', 'ZAR'])('shows the server-quoted %s currency and USD arrival balance', (currency) => {
    render(<BookingPaymentNotice
      payment={{ currency, deposit: 50 }} baseCurrency="USD" balance={100} lang="en-GB"
    />);
    expect(screen.getByTestId('text-payment-currency').textContent).toContain(`Stripe charges ${currency}`);
    expect(screen.getByTestId('text-payment-notice').textContent).toContain('arrival in USD');
    expect(screen.getByTestId('text-payment-notice').textContent).toContain('≈');
  });

  it('does not promise EUR from a legacy API that has not supplied a payment quote', () => {
    render(<BookingPaymentNotice baseCurrency="USD" balance={50} lang="en-GB" />);
    expect(screen.getByTestId('text-payment-currency').textContent).toContain('USD');
    expect(screen.getByTestId('text-payment-notice').textContent).not.toContain('Estimated');
  });

  it('localizes the notice and omits the arrival-balance line for full prepayment', () => {
    render(<BookingPaymentNotice payment={{ currency: 'EUR', deposit: 100 }} baseCurrency="USD" balance={0} lang="de-DE" />);
    expect(screen.getByTestId('text-payment-currency').textContent).toContain('Stripe belastet in EUR');
    expect(screen.getByTestId('text-payment-notice').textContent).not.toContain('Restbetrag');
  });
});
