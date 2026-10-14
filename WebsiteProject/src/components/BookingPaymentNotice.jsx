import { getPaymentStrings } from '../i18n/paymentStrings';
import { fmt } from '../i18n/bookingStrings';

export default function BookingPaymentNotice({ payment, baseCurrency, balance, lang }) {
  const t = getPaymentStrings(lang);
  // Older API responses have no payment quote: do not promise a currency the
  // backend has not explicitly quoted during a staged frontend/backend rollout.
  const paymentCurrency = payment?.currency || baseCurrency || 'USD';
  let estimate = null;
  if (payment && Number.isFinite(payment.deposit)) {
    estimate = new Intl.NumberFormat(lang, {
      style: 'currency', currency: paymentCurrency,
    }).format(payment.deposit);
  }
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 space-y-1" data-testid="text-payment-notice">
      <p className="font-semibold" data-testid="text-payment-currency">
        {fmt(t.checkoutCurrency, { currency: paymentCurrency })}
      </p>
      {estimate && <p>{fmt(t.paymentEstimate, { amount: `≈ ${estimate}` })}</p>}
      {balance > 0 && <p>{t.balanceCurrency}</p>}
    </div>
  );
}
