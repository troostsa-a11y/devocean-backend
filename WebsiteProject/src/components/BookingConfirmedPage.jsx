import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'wouter';
import { CheckCircle2, Loader2, XCircle, RotateCcw } from 'lucide-react';
import { getConfirmStrings, fmt } from '../i18n/bookingStrings';

function money(amount, currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
}

export default function BookingConfirmedPage({ lang = 'en-GB' }) {
  const t = useMemo(() => getConfirmStrings(lang), [lang]);
  const [result, setResult] = useState(null);
  const [phase, setPhase] = useState('loading'); // loading | confirmed | refunded | failed | pending
  const pollRef = useRef(null);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (!ref) {
      setPhase('failed');
      return;
    }

    let attempts = 0;
    const maxAttempts = 15; // ~30s at 2s interval

    async function poll() {
      attempts += 1;
      try {
        const res = await fetch(`/api/booking/result/${encodeURIComponent(ref)}`);
        const data = await res.json();
        if (res.ok) {
          setResult(data);
          if (data.status === 'confirmed') return finish('confirmed');
          if (data.status === 'sold_out_refunded') return finish('refunded');
          if (data.status === 'failed') return finish('failed');
        }
      } catch {
        /* keep polling */
      }
      if (attempts >= maxAttempts) {
        setPhase((p) => (p === 'loading' ? 'pending' : p));
        return;
      }
      pollRef.current = setTimeout(poll, 2000);
    }

    function finish(p) {
      setPhase(p);
      if (pollRef.current) clearTimeout(pollRef.current);
    }

    poll();
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, []);

  return (
    <main className="flex-1 bg-slate-50">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          {(phase === 'loading' || phase === 'pending') && (
            <div data-testid="status-confirming">
              <Loader2 className="h-12 w-12 text-[#9e4b13] mx-auto animate-spin" />
              <h1 className="mt-5 text-2xl font-bold text-slate-900">{t.confirming}</h1>
              <p className="mt-2 text-slate-600">
                {phase === 'pending' ? t.pendingMsg : t.confirmingNote}
              </p>
            </div>
          )}

          {phase === 'confirmed' && result && (
            <div data-testid="status-confirmed">
              <CheckCircle2 className="h-14 w-14 text-emerald-600 mx-auto" />
              <h1 className="mt-5 text-2xl font-bold text-slate-900">{t.confirmedTitle}</h1>
              <p className="mt-2 text-slate-600">
                {fmt(t.confirmedMsg, { name: result.guestFirstName || '' })}
              </p>

              <div className="mt-6 text-left rounded-xl border border-slate-200 divide-y divide-slate-100">
                {result.beds24BookingId && (
                  <Row label={t.bookingRef} value={result.beds24BookingId} testId="text-booking-ref" />
                )}
                <Row label={t.room} value={result.roomName} />
                <Row label={t.dates} value={`${result.checkIn} → ${result.checkOut}`} />
                {result.discount > 0 && (
                  <Row
                    label={fmt(t.discountApplied, { code: result.couponCode || '' })}
                    value={`−${money(result.discount, result.currency)}`}
                    testId="text-confirmed-discount"
                  />
                )}
                <Row label={t.depositPaid} value={money(result.deposit, result.currency)} />
                <Row label={t.balanceDue} value={money(result.balanceDue, result.currency)} />
              </div>

              <Link
                href="/"
                className="mt-7 inline-flex items-center justify-center rounded-xl bg-[#9e4b13] px-6 py-3 text-white font-semibold hover:bg-[#854011] transition-colors"
                data-testid="link-home"
              >
                {t.backHome}
              </Link>
            </div>
          )}

          {phase === 'refunded' && (
            <div data-testid="status-refunded">
              <RotateCcw className="h-14 w-14 text-amber-500 mx-auto" />
              <h1 className="mt-5 text-2xl font-bold text-slate-900">{t.refundedTitle}</h1>
              <p className="mt-2 text-slate-600">{t.refundedMsg}</p>
              <Link
                href="/book-direct"
                className="mt-7 inline-flex items-center justify-center rounded-xl bg-[#9e4b13] px-6 py-3 text-white font-semibold hover:bg-[#854011] transition-colors"
                data-testid="link-book-again"
              >
                {t.bookAgain}
              </Link>
            </div>
          )}

          {phase === 'failed' && (
            <div data-testid="status-failed">
              <XCircle className="h-14 w-14 text-red-500 mx-auto" />
              <h1 className="mt-5 text-2xl font-bold text-slate-900">{t.failedTitle}</h1>
              <p className="mt-2 text-slate-600">{t.failedMsg}</p>
              <Link
                href="/"
                className="mt-7 inline-flex items-center justify-center rounded-xl bg-slate-200 px-6 py-3 text-slate-800 font-semibold hover:bg-slate-300 transition-colors"
                data-testid="link-home"
              >
                {t.backHome}
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Row({ label, value, testId }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900 text-right" data-testid={testId}>{value}</span>
    </div>
  );
}
