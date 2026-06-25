import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { CalendarCheck2, Users, Loader2, ShieldCheck, ChevronLeft, Menu, X } from 'lucide-react';
import { getBookingStrings, fmt } from '../i18n/bookingStrings';
import { HERO_IMAGES } from '../data/content';
import LanguageTopBar from './LanguageTopBar';
import CurrencyPicker from './CurrencyPicker';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function money(amount, currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
}
// Whole-unit formatting for the informational (approximate) converted amount.
function approxMoney(amount, currency) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(Number(amount) || 0)}`;
  }
}

const INPUT_CLASS =
  'w-full rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-slate-900 focus:border-[#9e4b13] focus:ring-1 focus:ring-[#9e4b13] outline-none';
const FIELD_LABEL_CLASS =
  'block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1';

export default function BookDirectPage({ lang = 'en-GB', countryCode, ui, currency, region, onLangChange, onRegionChange, onCurrencyChange }) {
  const t = useMemo(() => getBookingStrings(lang), [lang]);
  const [, navigate] = useLocation();

  const [step, setStep] = useState('search'); // search | results | details
  const [checkIn, setCheckIn] = useState(addDays(todayStr(), 1));
  const [checkOut, setCheckOut] = useState(addDays(todayStr(), 3));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1); // visual only — backend currently books one unit
  const [coupon, setCoupon] = useState(''); // visual only — backend has no discount support yet

  const [menuOpen, setMenuOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState(null); // full availability response
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const rateLabel = (type) => (t.rate && t.rate[type]) || (t.rate && t.rate.standard) || type;

  const [guest, setGuest] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [canceled, setCanceled] = useState(false);
  const [fxData, setFxData] = useState(null); // { base, rates } — display-only

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('canceled') === '1') setCanceled(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const nights = useMemo(() => {
    const a = new Date(`${checkIn}T00:00:00Z`).getTime();
    const b = new Date(`${checkOut}T00:00:00Z`).getTime();
    return Math.max(0, Math.round((b - a) / 86_400_000));
  }, [checkIn, checkOut]);

  async function handleSearch(e) {
    e?.preventDefault();
    setError('');
    setCanceled(false);
    if (nights < 1) {
      setError(t.errorGeneric);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/booking/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkIn, checkOut, adults, children }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || t.errorGeneric);
      setAvailability(data);
      setStep('results');
    } catch (err) {
      setError(err.message || t.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectOffer(room, offer) {
    setSelectedRoom(room);
    setSelectedOffer(offer);
    setGuest((g) => ({ ...g }));
    setStep('details');
    setError('');
  }

  async function handleCheckout(e) {
    e?.preventDefault();
    setError('');
    if (!guest.firstName.trim()) return setError(t.firstName + ' *');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email.trim())) return setError(t.email + ' *');
    setLoading(true);
    try {
      const res = await fetch('/api/booking/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.roomId,
          offerId: selectedOffer.offerId,
          checkIn,
          checkOut,
          adults,
          children,
          guest: {
            firstName: guest.firstName.trim(),
            lastName: guest.lastName.trim(),
            email: guest.email.trim(),
            phone: guest.phone.trim(),
            country: countryCode || '',
            language: lang,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) throw new Error(data?.error || t.errorGeneric);
      window.location.href = data.url; // redirect to Stripe Checkout
    } catch (err) {
      setError(err.message || t.errorGeneric);
      setLoading(false);
    }
  }

  const availableRooms = (availability?.rooms || [])
    .map((r) => {
      const priced = (Array.isArray(r.offers) ? r.offers : []).filter(
        (o) => Number.isFinite(o.total) && o.total > 0,
      );
      const best = priced.reduce((b, o) => (b == null || o.total < b.total ? o : b), null);
      return best ? { ...r, offers: [best] } : null;
    })
    .filter((r) => r && r.available);
  const depositPct = availability?.depositPercent ?? 30;
  const cancelDays = availability?.cancellationPolicyDays ?? 30;

  // ── Informational currency conversion (display only) ──────────────────────
  // The base/charged currency is the Beds24 property currency (availability
  // currency); the rates below NEVER change what Stripe charges. We just show an
  // approximate value in the visitor's local currency (the bar currency).
  const baseCurrency =
    availability?.currency || availability?.rooms?.[0]?.currency || selectedRoom?.currency || null;
  // Bind cached rates to their base so a base-currency change can't render with
  // stale rates before the effect refetches.
  const fxRatesForBase = fxData && fxData.base === baseCurrency ? fxData.rates : null;
  const showFx = !!(
    currency &&
    baseCurrency &&
    currency !== baseCurrency &&
    fxRatesForBase &&
    fxRatesForBase[currency]
  );
  const fxLine = (amount) =>
    showFx ? `≈ ${approxMoney(amount * fxRatesForBase[currency], currency)}` : null;

  useEffect(() => {
    if (!baseCurrency || !currency || currency === baseCurrency) {
      setFxData(null);
      return;
    }
    let cancelledFetch = false;
    const cacheKey = `fx_${baseCurrency}`;
    const TTL = 6 * 60 * 60 * 1000; // 6h
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.ts && Date.now() - parsed.ts < TTL && parsed.rates) {
          setFxData({ base: baseCurrency, rates: parsed.rates });
          return;
        }
      }
    } catch {
      /* ignore storage errors */
    }
    fetch(`/api/fx?base=${encodeURIComponent(baseCurrency)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelledFetch) return;
        const rates = (d && d.rates) || {};
        setFxData({ base: baseCurrency, rates });
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), rates }));
        } catch {
          /* ignore storage errors */
        }
      })
      .catch(() => {
        if (!cancelledFetch) setFxData(null);
      });
    return () => {
      cancelledFetch = true;
    };
  }, [baseCurrency, currency]);

  const hero = HERO_IMAGES[0];
  const navItems = [
    ['home', ui?.nav?.home || 'Home'],
    ['stay', ui?.nav?.stay || 'Stay'],
    ['experiences', ui?.nav?.experiences || 'Experiences'],
    ['gallery', ui?.nav?.gallery || 'Gallery'],
    ['contact', ui?.nav?.contact || 'Contact'],
  ];

  function renderTopBar() {
    return (
      <div className="relative z-30 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <a
            href={`/?lang=${lang}#home`}
            className="flex items-center gap-2 font-semibold text-slate-800"
            data-testid="link-booking-home"
          >
            <img
              src="/images/devocean_logo_header-small.webp"
              alt="DEVOCEAN Lodge"
              className="h-9 w-9 rounded-full object-cover"
              loading="eager"
            />
            <span>DEVOCEAN Lodge</span>
          </a>

          <div className="relative flex items-center gap-2">
            <CurrencyPicker
              lang={lang}
              currency={currency}
              onSelect={onCurrencyChange}
              className="hidden sm:block"
            />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={ui?.menu || 'Menu'}
              className="inline-flex items-center justify-center rounded-xl px-3 py-2 bg-[#9e4b13] text-white hover:bg-[#8a4211] transition-colors"
              data-testid="button-booking-menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div
              className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 transition-all duration-200 origin-top-right"
              style={{
                transform: menuOpen ? 'scale(1)' : 'scale(0.95)',
                opacity: menuOpen ? 1 : 0,
                pointerEvents: menuOpen ? 'auto' : 'none',
                visibility: menuOpen ? 'visible' : 'hidden',
              }}
              data-testid="menu-booking-nav"
            >
              {navItems.map(([key, label]) => (
                <a
                  key={key}
                  href={`/?lang=${lang}#${key}`}
                  className="block px-5 py-3 text-slate-700 hover:bg-[#fffaf6] border-b border-slate-100 transition-colors"
                  onClick={() => setMenuOpen(false)}
                  tabIndex={menuOpen ? 0 : -1}
                  data-testid={`link-booking-${key}`}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {menuOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }

  function renderNotices() {
    return (
      <>
        {canceled && (
          <div
            className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800 text-sm"
            data-testid="status-canceled"
          >
            {t.canceledNotice}
          </div>
        )}
        {error && (
          <div
            className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-700 text-sm"
            data-testid="status-error"
          >
            {error}
          </div>
        )}
      </>
    );
  }

  return (
    <main className="flex-1 bg-slate-50">
      {/* Brand-color top bar (contact + region/language), matching the landing
          page. In-flow here via topbar-static so it sits above the hero. */}
      <LanguageTopBar
        ui={ui}
        lang={lang}
        currency={currency}
        region={region}
        onLangChange={onLangChange}
        onRegionChange={onRegionChange}
        className="topbar topbar-static bg-[#9e4b13] text-white border-b border-[#8a4211]"
        buttonLocationDesktop="booking_desktop"
        buttonLocationMobile="booking_mobile"
      />
      {step === 'search' ? (
        <>
          {/* White compact bar (logo, language/currency, menu) — matches landing */}
          {renderTopBar()}
          <div className="relative h-[58vh] min-h-[440px] flex flex-col">
            <picture>
              <source media="(min-width: 640px)" srcSet={hero.desktopWebP} />
              <img
                src={hero.mobileWebP}
                alt=""
                aria-hidden="true"
                className={`absolute inset-0 h-full w-full object-cover ${hero.mobileObjectClass || ''}`}
                loading="eager"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/55" />

            <div className="relative z-10 flex-1 flex items-center">
              <div className="max-w-6xl mx-auto w-full px-4">
                <h1
                  className="text-3xl sm:text-5xl font-bold text-white drop-shadow-md"
                  data-testid="text-booking-title"
                >
                  {t.title}
                </h1>
                <p className="mt-3 max-w-xl text-white/90 text-base sm:text-lg">{t.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Search bar overlapping the hero */}
          <div className="max-w-6xl mx-auto px-4 pb-12">
            <div className="-mt-16 sm:-mt-20 relative z-20 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">{t.title}</h2>
              <form
                onSubmit={handleSearch}
                className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end"
              >
                <div className="lg:flex-1 lg:min-w-[150px]">
                  <label className={FIELD_LABEL_CLASS}>{t.checkIn}</label>
                  <input
                    type="date"
                    value={checkIn}
                    min={todayStr()}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      if (e.target.value >= checkOut) setCheckOut(addDays(e.target.value, 1));
                    }}
                    className={INPUT_CLASS}
                    data-testid="input-checkin"
                    required
                  />
                </div>

                <div className="lg:flex-1 lg:min-w-[150px]">
                  <label className={FIELD_LABEL_CLASS}>{t.checkOut}</label>
                  <input
                    type="date"
                    value={checkOut}
                    min={addDays(checkIn, 1)}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className={INPUT_CLASS}
                    data-testid="input-checkout"
                    required
                  />
                </div>

                <div className="lg:flex-none lg:w-[84px]">
                  <label className={FIELD_LABEL_CLASS}>{t.rooms}</label>
                  <select
                    value={rooms}
                    onChange={(e) => setRooms(parseInt(e.target.value, 10))}
                    className={INPUT_CLASS}
                    data-testid="select-rooms"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div className="lg:flex-[1.8] lg:min-w-[340px]">
                  <label className={FIELD_LABEL_CLASS}>{t.guests}</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <select
                        value={adults}
                        onChange={(e) => setAdults(parseInt(e.target.value, 10))}
                        className={INPUT_CLASS}
                        aria-label={t.adults}
                        data-testid="select-adults"
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>{n} · {t.adults}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <select
                        value={children}
                        onChange={(e) => setChildren(parseInt(e.target.value, 10))}
                        className={INPUT_CLASS}
                        aria-label={t.children}
                        data-testid="select-children"
                      >
                        {[0, 1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>{n} · {t.children}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="lg:flex-1 lg:min-w-[150px]">
                  <label className={FIELD_LABEL_CLASS}>{t.promoCode}</label>
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className={INPUT_CLASS}
                    placeholder={t.promoCode}
                    data-testid="input-coupon"
                  />
                </div>

                <div className="lg:flex-none">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full lg:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#9e4b13] px-6 py-2.5 text-white font-semibold hover:bg-[#854011] transition-colors disabled:opacity-60"
                    data-testid="button-search"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CalendarCheck2 className="h-5 w-5" />}
                    {loading ? t.searching : t.search}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6">{renderNotices()}</div>
          </div>
        </>
      ) : (
        <>
          {renderTopBar()}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            {renderNotices()}

            {/* ── Step 2: Results ── */}
            {step === 'results' && availability && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => { setStep('search'); setError(''); }}
                  className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
                  data-testid="button-back-search"
                >
                  <ChevronLeft className="h-4 w-4" /> {t.back}
                </button>

                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {checkIn} → {checkOut} · {availability.nights} {t.nights} · {adults + children} {t.guests}
                </p>

                {availableRooms.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-600" data-testid="status-no-rooms">
                    {t.noRooms}
                  </div>
                ) : (
                  availableRooms.map((room) => (
                    <div
                      key={room.roomId}
                      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6"
                      data-testid={`card-room-${room.roomId}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900" data-testid={`text-room-name-${room.roomId}`}>
                            {room.name}
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {fmt(t.perNightFrom, { nights: room.nights })}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {room.offers.map((offer) => (
                          <div
                            key={offer.offerId}
                            className="rounded-xl border border-slate-200 p-4"
                            data-testid={`card-offer-${room.roomId}-${offer.offerId}`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-900" data-testid={`text-offer-name-${offer.offerId}`}>
                                  {rateLabel(offer.type)}
                                </p>
                                <p className={`text-xs mt-0.5 ${offer.refundable ? 'text-emerald-600' : 'text-amber-600'}`}>
                                  {offer.refundable ? fmt(t.cancellationPolicy, { days: cancelDays }) : t.nonRefundable}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-slate-900" data-testid={`text-offer-total-${offer.offerId}`}>
                                  {money(offer.total, room.currency)}
                                </p>
                                {fxLine(offer.total) && (
                                  <p className="text-xs text-slate-400" data-testid={`text-offer-total-fx-${offer.offerId}`}>
                                    {fxLine(offer.total)}
                                  </p>
                                )}
                                <p className="text-xs text-slate-500">{t.total}</p>
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                              <div className="rounded-xl bg-[#9e4b13]/5 px-3 py-2">
                                <p className="text-slate-500">{fmt(t.depositNow, { pct: depositPct })}</p>
                                <p className="font-semibold text-[#9e4b13]" data-testid={`text-offer-deposit-${offer.offerId}`}>
                                  {money(offer.deposit, room.currency)}
                                </p>
                                {fxLine(offer.deposit) && (
                                  <p className="text-xs text-slate-400">{fxLine(offer.deposit)}</p>
                                )}
                              </div>
                              <div className="rounded-xl bg-slate-50 px-3 py-2">
                                <p className="text-slate-500">{t.balanceOnArrival}</p>
                                <p className="font-semibold text-slate-700" data-testid={`text-offer-balance-${offer.offerId}`}>
                                  {money(offer.balance, room.currency)}
                                </p>
                                {fxLine(offer.balance) && (
                                  <p className="text-xs text-slate-400">{fxLine(offer.balance)}</p>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSelectOffer(room, offer)}
                              className="mt-4 w-full rounded-xl bg-[#9e4b13] px-5 py-2.5 text-white font-semibold hover:bg-[#854011] transition-colors"
                              data-testid={`button-select-${room.roomId}-${offer.offerId}`}
                            >
                              {t.select}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}

                <p className="text-xs text-slate-500 text-center pt-2">
                  {fmt(t.cancellationPolicy, { days: cancelDays })}
                </p>
                {showFx && (
                  <p className="text-xs text-slate-400 text-center" data-testid="text-fx-note">
                    {fmt(t.approxNote, { currency: baseCurrency })}
                  </p>
                )}
              </div>
            )}

            {/* ── Step 3: Guest details ── */}
            {step === 'details' && selectedRoom && selectedOffer && (
              <form onSubmit={handleCheckout} className="space-y-5">
                <button
                  type="button"
                  onClick={() => { setStep('results'); setError(''); }}
                  className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
                  data-testid="button-back-results"
                >
                  <ChevronLeft className="h-4 w-4" /> {t.back}
                </button>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                  <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">{t.summary}</h2>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">{selectedRoom.name}</span>
                    <span className="text-slate-600 text-sm">{checkIn} → {checkOut}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-slate-600" data-testid="text-summary-rate">{rateLabel(selectedOffer.type)}</span>
                    <span className={selectedOffer.refundable ? 'text-emerald-600' : 'text-amber-600'}>
                      {selectedOffer.refundable ? fmt(t.cancellationPolicy, { days: cancelDays }) : t.nonRefundable}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm border-t border-slate-100 pt-3">
                    <span className="text-slate-500">{t.total}</span>
                    <span className="text-right">
                      <span className="font-semibold text-slate-700">{money(selectedOffer.total, selectedRoom.currency)}</span>
                      {fxLine(selectedOffer.total) && (
                        <span className="block text-xs text-slate-400">{fxLine(selectedOffer.total)}</span>
                      )}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-slate-500">{fmt(t.depositNow, { pct: depositPct })}</span>
                    <span className="text-right">
                      <span className="font-bold text-[#9e4b13]">{money(selectedOffer.deposit, selectedRoom.currency)}</span>
                      {fxLine(selectedOffer.deposit) && (
                        <span className="block text-xs text-slate-400">{fxLine(selectedOffer.deposit)}</span>
                      )}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-slate-500">{t.balanceOnArrival}</span>
                    <span className="text-right">
                      <span className="font-semibold text-slate-700">{money(selectedOffer.balance, selectedRoom.currency)}</span>
                      {fxLine(selectedOffer.balance) && (
                        <span className="block text-xs text-slate-400">{fxLine(selectedOffer.balance)}</span>
                      )}
                    </span>
                  </div>
                  {showFx && (
                    <p className="mt-3 text-xs text-slate-400" data-testid="text-fx-note-summary">
                      {fmt(t.approxNote, { currency: baseCurrency })}
                    </p>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900">{t.guestDetails}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">{t.firstName} *</span>
                      <input
                        type="text"
                        value={guest.firstName}
                        onChange={(e) => setGuest({ ...guest, firstName: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-[#9e4b13] focus:ring-1 focus:ring-[#9e4b13] outline-none"
                        data-testid="input-first-name"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">{t.lastName}</span>
                      <input
                        type="text"
                        value={guest.lastName}
                        onChange={(e) => setGuest({ ...guest, lastName: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-[#9e4b13] focus:ring-1 focus:ring-[#9e4b13] outline-none"
                        data-testid="input-last-name"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">{t.email} *</span>
                      <input
                        type="email"
                        value={guest.email}
                        onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-[#9e4b13] focus:ring-1 focus:ring-[#9e4b13] outline-none"
                        data-testid="input-email"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">{t.phone}</span>
                      <input
                        type="tel"
                        value={guest.phone}
                        onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-[#9e4b13] focus:ring-1 focus:ring-[#9e4b13] outline-none"
                        data-testid="input-phone"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#9e4b13] px-5 py-3 text-white font-semibold hover:bg-[#854011] transition-colors disabled:opacity-60"
                    data-testid="button-checkout"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                    {loading ? t.processing : t.continue}
                  </button>

                  <p className="text-xs text-slate-500 flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                    {t.securePayment}
                  </p>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </main>
  );
}
