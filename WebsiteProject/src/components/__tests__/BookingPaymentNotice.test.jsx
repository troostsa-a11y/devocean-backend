import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import BookingPaymentNotice from '../BookingPaymentNotice';
import { getPaymentStrings } from '../../i18n/paymentStrings';
import { LOCALES } from '../../i18n/localeCatalog';

afterEach(cleanup);

describe('card payment is distinguished from display and property currencies', () => {
  it.each(['USD', 'EUR', 'ZAR'])('shows the server-quoted %s currency and arrival payment options', (currency) => {
    render(<BookingPaymentNotice
      payment={{ currency, deposit: 50 }} baseCurrency="USD" balance={100} lang="en-GB"
    />);
    expect(screen.getByTestId('text-payment-currency').textContent).toContain(`Stripe charges ${currency}`);
    expect(screen.getByTestId('text-payment-notice').textContent).toContain('Any remaining balance is due on arrival and can be paid by card or cash (MZN, ZAR or USD).');
    expect(screen.getByTestId('text-payment-notice').textContent).not.toContain('arrival in USD');
    expect(screen.getByTestId('text-payment-notice').textContent).toContain('≈');
  });

  it.each(LOCALES.map(({ code }) => code))('localizes arrival payment options in %s', (lang) => {
    render(<BookingPaymentNotice payment={{ currency: 'USD', deposit: 50 }} baseCurrency="USD" balance={100} lang={lang} />);
    const text = screen.getByTestId('text-payment-notice').textContent;
    expect(text).toContain(getPaymentStrings(lang).balanceCurrency);
    for (const currency of ['MZN', 'ZAR', 'USD']) expect(text).toContain(currency);
    expect(text).not.toContain('{currency}');
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
    expect(screen.getByTestId('text-payment-notice').textContent).not.toContain('MZN');
    expect(screen.getByTestId('text-payment-notice').textContent).not.toContain('ZAR');
  });
});
