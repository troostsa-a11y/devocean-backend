import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Gift, ArrowLeft } from 'lucide-react';

export default function GiftConfirmedPage({ lang }) {
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [voucher, setVoucher] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // SEO: set a distinct title (page is disallowed in robots.txt but set anyway for direct visits)
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Gift Voucher Confirmed | DEVOCEAN Lodge';
    return () => { document.title = prevTitle; };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (!sessionId) {
      setErrorMsg('Missing session ID. Please check your email for the voucher code.');
      setStatus('error');
      return;
    }

    let cancelled = false;
    fetch(`/api/gift-voucher/confirm?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) {
          setErrorMsg(data.error || 'Could not load confirmation.');
          setStatus('error');
        } else if (['active', 'redeemed'].includes(data.status) && data.code) {
          setVoucher(data);
          setStatus('success');
        } else {
          setErrorMsg(data.status === 'checkout_expired'
            ? 'This checkout expired without a confirmed payment. No voucher was issued.'
            : data.status === 'failed'
              ? 'Payment was unsuccessful. No voucher was issued.'
              : 'Payment has not been confirmed yet. No voucher has been issued. Please check again shortly; do not pay again if your bank shows a charge.');
          setStatus('error');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMsg('Network error. Please check your email for the voucher code.');
          setStatus('error');
        }
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-[var(--stack-h)]">
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#9e4b13]" />
            <p className="text-slate-500 text-sm">Confirming your gift voucher…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <p className="text-red-600 text-sm mb-4" data-testid="text-error">{errorMsg}</p>
            <button type="button" onClick={() => window.location.reload()} className="block mx-auto mb-4 text-sm text-[#9e4b13] underline">
              Check again
            </button>
            <a
              href="/gift-vouchers"
              className="text-sm text-[#9e4b13] hover:underline"
            >
              Return to gift vouchers
            </a>
          </div>
        )}

        {status === 'success' && voucher && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Your gift voucher is ready!</h1>
            <p className="text-slate-500 text-sm mb-6">
              {voucher.recipientName
                ? `Your $${Number(voucher.amountUsd ?? 0).toFixed(2)} USD gift voucher is below. Recipient: ${voucher.recipientName}. Keep a copy of the code.`
                : `Your $${Number(voucher.amountUsd ?? 0).toFixed(2)} USD gift voucher is below. Keep a copy of the code.`}
            </p>

            {voucher.code && (
              <div className="rounded-xl bg-amber-50 border border-amber-100 px-6 py-4 mb-6 inline-block">
                <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide mb-1">Voucher code</p>
                <p
                  className="font-mono text-xl font-bold text-amber-900 tracking-widest"
                  data-testid="text-voucher-code"
                >
                  {voucher.code}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Value: ${Number(voucher.amountUsd ?? voucher.amount ?? 0).toFixed(2)} USD
                </p>
              </div>
            )}

            <div className="text-sm text-slate-500 leading-relaxed mb-6">
              <p>The recipient can enter this code in the <strong>Gift voucher code</strong> field on the <a href="/book-direct" className="text-[#9e4b13] hover:underline">Book Direct</a> page.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/book-direct"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#9e4b13] px-5 py-2.5 text-white font-semibold hover:bg-[#854011] transition-colors text-sm"
                data-testid="link-book-direct"
              >
                Book a stay
              </a>
              <a
                href="/gift-vouchers"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm"
                data-testid="link-buy-another"
              >
                <Gift className="h-4 w-4" />
                Buy another
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
