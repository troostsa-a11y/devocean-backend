import { useState } from 'react';
import { Loader2, Gift, CheckCircle2, ArrowLeft } from 'lucide-react';

const DENOMINATIONS = [20, 50, 100, 200, 500];

export default function GiftVouchersPage({ lang }) {
  const [amount, setAmount] = useState(100);
  const [purchaserName, setPurchaserName] = useState('');
  const [purchaserEmail, setPurchaserEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!purchaserName.trim()) { setError('Enter your name.'); return; }
    if (!purchaserEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(purchaserEmail.trim())) {
      setError('Enter a valid email address for delivery of the voucher.'); return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/gift-voucher/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          purchaserName: purchaserName.trim(),
          purchaserEmail: purchaserEmail.trim(),
          recipientName: recipientName.trim() || undefined,
          message: message.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not start checkout. Please try again.');
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Unexpected response. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const INPUT_CLASS =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#9e4b13] focus:ring-2 focus:ring-[#9e4b13]/20 outline-none transition';
  const LABEL_CLASS = 'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <a
            href="/book-direct"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            data-testid="link-back-to-booking"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </a>
          <span className="text-slate-300">|</span>
          <span className="text-sm font-semibold text-slate-900">DEVOCEAN Lodge Gift Vouchers</span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 mb-4">
            <Gift className="h-7 w-7 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Give the gift of DEVOCEAN</h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
            Treat someone special to a stay at DEVOCEAN Lodge in Ponta do Ouro, Mozambique.
            A gift voucher they can redeem when booking direct.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Amount */}
            <div>
              <label className={LABEL_CLASS}>Voucher value (USD)</label>
              <div className="flex flex-wrap gap-2" data-testid="group-denominations">
                {DENOMINATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setAmount(d)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                      amount === d
                        ? 'bg-[#9e4b13] text-white border-[#9e4b13]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-[#9e4b13] hover:text-[#9e4b13]'
                    }`}
                    data-testid={`button-amount-${d}`}
                  >
                    ${d}
                  </button>
                ))}
              </div>
            </div>

            {/* Purchaser */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS} htmlFor="gv-purchaser-name">Your name</label>
                <input
                  id="gv-purchaser-name"
                  type="text"
                  value={purchaserName}
                  onChange={(e) => setPurchaserName(e.target.value)}
                  placeholder="Your name"
                  className={INPUT_CLASS}
                  data-testid="input-purchaser-name"
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="gv-purchaser-email">Your email <span className="font-normal text-slate-400">(voucher sent here)</span></label>
                <input
                  id="gv-purchaser-email"
                  type="email"
                  value={purchaserEmail}
                  onChange={(e) => setPurchaserEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={INPUT_CLASS}
                  data-testid="input-purchaser-email"
                />
              </div>
            </div>

            {/* Recipient name (optional, for personalisation) */}
            <div>
              <label className={LABEL_CLASS} htmlFor="gv-recipient-name">Recipient's name <span className="font-normal text-slate-400">(optional)</span></label>
              <input
                id="gv-recipient-name"
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Jane Smith"
                className={INPUT_CLASS}
                data-testid="input-recipient-name"
              />
            </div>

            {/* Personal message */}
            <div>
              <label className={LABEL_CLASS} htmlFor="gv-message">Personal message <span className="font-normal text-slate-400">(optional)</span></label>
              <textarea
                id="gv-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Enjoy a well-deserved escape to the coast…"
                className={INPUT_CLASS + ' resize-none'}
                data-testid="input-message"
              />
            </div>

            {/* Summary */}
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">Gift voucher total</p>
                <p className="text-lg font-bold text-slate-900">${amount}.00 USD</p>
              </div>
              <div className="text-xs text-slate-400 text-right max-w-[160px]">
                Delivered by email after payment. One-time use.
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600" data-testid="text-error">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#9e4b13] px-6 py-3 text-white font-semibold hover:bg-[#854011] transition-colors disabled:opacity-60"
              data-testid="button-pay"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Gift className="h-5 w-5" />}
              Pay ${amount}.00 — Send voucher
            </button>

            <p className="text-center text-xs text-slate-400">
              Secure payment via Stripe. The voucher code is emailed to the recipient immediately after payment.
            </p>
          </form>
        </div>

        {/* How it works */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '1', title: 'You pay', body: 'Choose a value and pay securely via Stripe.' },
            { icon: '2', title: 'We email the code', body: 'The recipient gets a unique voucher code by email.' },
            { icon: '3', title: 'They redeem it', body: 'Enter the code at checkout on the Book Direct page.' },
          ].map((step) => (
            <div key={step.icon} className="bg-white rounded-xl border border-slate-100 p-4 text-center">
              <div className="text-2xl font-bold text-amber-600 mb-1">{step.icon}</div>
              <p className="text-sm font-semibold text-slate-800">{step.title}</p>
              <p className="text-xs text-slate-500 mt-1">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
