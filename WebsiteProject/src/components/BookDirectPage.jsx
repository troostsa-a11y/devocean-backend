import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { CalendarCheck2, Users, Loader2, ShieldCheck, ChevronLeft, Menu, X, Plus, Minus } from 'lucide-react';
import { getBookingStrings, fmt } from '../i18n/bookingStrings';
import { HERO_IMAGES } from '../data/content';
import LanguageTopBar from './LanguageTopBar';
import CurrencyPicker from './CurrencyPicker';
import DateRangePicker from './DateRangePicker';

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
  const [childAges, setChildAges] = useState([]); // one entry per child; '' until chosen
  const [coupon, setCoupon] = useState(''); // visual only — backend has no discount support yet

  const [menuOpen, setMenuOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState(null); // full availability response
  const [cart, setCart] = useState({}); // roomId → qty (per-type cart)
  const [quote, setQuote] = useState(null); // live combined quote (from /api/booking/quote)
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  const [guest, setGuest] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [canceled, setCanceled] = useState(false);
  const [fxData, setFxData] = useState(null); // { base, rates } — display-only
  const [priceByDate, setPriceByDate] = useState({}); // iso→rate, drives picker tiers (display-only)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('canceled') === '1') setCanceled(true);
  }, []);

  // Fetch the per-date rate calendar once for the picker's nav horizon (today..
  // +24mo, matching the picker's max month). Fail-soft: any error → no colours.
  useEffect(() => {
    let cancelled = false;
    const start = todayStr();
    const end = addDays(start, 730);
    fetch(`/api/booking/calendar?startDate=${start}&endDate=${end}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        setPriceByDate((d && d.prices) || {});
      })
      .catch(() => {
        if (!cancelled) setPriceByDate({});
      });
    return () => {
      cancelled = true;
    };
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

  // Lodge child policy: 0-3 stay free (excluded from the priced party), 4-12 are
  // charged as a child, 13+ are charged as an adult. The effective counts below
  // are what we send to Beds24 (availability/quote/checkout). The raw `adults`/
  // `children` selector values only drive the UI and the per-child age inputs.
  const effAdults = useMemo(
    () => adults + childAges.filter((a) => a !== '' && Number(a) >= 13).length,
    [adults, childAges],
  );
  const effChildren = useMemo(
    () => childAges.filter((a) => a !== '' && Number(a) >= 4 && Number(a) <= 12).length,
    [childAges],
  );

  function handleChildrenChange(n) {
    setChildren(n);
    setChildAges((prev) => {
      const next = prev.slice(0, n);
      while (next.length < n) next.push('');
      return next;
    });
  }
  function setChildAge(i, value) {
    setChildAges((prev) => prev.map((a, idx) => (idx === i ? value : a)));
  }

  async function handleSearch(e) {
    e?.preventDefault();
    setError('');
    setCanceled(false);
    if (nights < 1) {
      setError(t.errorGeneric);
      return;
    }
    if (children > 0 && childAges.some((a) => a === '' || a == null)) {
      setError(t.provideChildAges);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/booking/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkIn, checkOut, adults: effAdults, children: effChildren }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || t.errorGeneric);
      setAvailability(data);
      setCart({});            // fresh search → empty cart
      setQuote(null);
      setQuoteError('');
      setStep('results');
    } catch (err) {
      setError(err.message || t.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout(e) {
    e?.preventDefault();
    setError('');
    if (cartLines.length === 0) return setError(t.selectRoomsToContinue);
    if (!guest.firstName.trim()) return setError(t.firstName + ' *');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email.trim())) return setError(t.email + ' *');
    setLoading(true);
    try {
      const res = await fetch('/api/booking/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rooms: cartLines,
          checkIn,
          checkOut,
          adults: effAdults,
          children: effChildren,
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

  // Each available room type, reduced to its single cheapest still-bookable
  // offer (the cart prices one rate per type; the server re-prices regardless).
  const availableRooms = useMemo(
    () =>
      (availability?.rooms || [])
        .map((r) => {
          const priced = (Array.isArray(r.offers) ? r.offers : []).filter(
            (o) => Number.isFinite(o.total) && o.total > 0,
          );
          const best = priced.reduce((b, o) => (b == null || o.total < b.total ? o : b), null);
          return best ? { ...r, offers: [best] } : null;
        })
        .filter((r) => r && r.available),
    [availability],
  );
  const cancelDays = availability?.cancellationPolicyDays ?? 30;
  const maxRooms = availability?.maxRooms ?? 5;

  // Cart lines for /quote + /checkout: {roomId, offerId, qty}. offerId is the
  // cheapest offer for the type (server re-prices; this only picks the plan).
  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([roomId, qty]) => {
          const room = availableRooms.find((r) => r.roomId === roomId);
          return { roomId, offerId: room?.offers?.[0]?.offerId ?? null, qty };
        }),
    [cart, availableRooms],
  );
  const totalRooms = useMemo(() => cartLines.reduce((s, l) => s + l.qty, 0), [cartLines]);
  const canAddRoom = totalRooms < maxRooms && totalRooms < effAdults;

  function setRoomQty(roomId, qty) {
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[roomId];
      else next[roomId] = qty;
      return next;
    });
  }

  // Debounced live quote whenever the cart (or stay) changes on the results step.
  useEffect(() => {
    if (step !== 'results') return;
    if (cartLines.length === 0) {
      setQuote(null);
      setQuoteError('');
      setQuoteLoading(false);
      return;
    }
    let cancelled = false;
    setQuoteLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch('/api/booking/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkIn, checkOut, adults: effAdults, children: effChildren, rooms: cartLines }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setQuote(null);
          setQuoteError(data?.error || t.errorGeneric);
        } else {
          setQuote(data);
          setQuoteError('');
        }
      } catch {
        if (!cancelled) {
          setQuote(null);
          setQuoteError(t.errorGeneric);
        }
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [cartLines, checkIn, checkOut, effAdults, effChildren, step, t]);

  // ── Informational currency conversion (display only) ──────────────────────
  // The base/charged currency is the Beds24 property currency (availability
  // currency); the rates below NEVER change what Stripe charges. We just show an
  // approximate value in the visitor's local currency (the bar currency).
  const baseCurrency =
    availability?.currency || quote?.currency || availability?.rooms?.[0]?.currency || null;
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
            className="flex items-center gap-2 min-w-0 font-semibold text-slate-800"
            data-testid="link-booking-home"
          >
            <img
              src="/images/devocean_logo_header-small.webp"
              alt="DEVOCEAN Lodge"
              className="h-9 w-9 shrink-0 rounded-full object-cover"
              loading="eager"
            />
            <span className="truncate">DEVOCEAN Lodge</span>
          </a>

          <div className="relative flex items-center gap-2 shrink-0">
            <CurrencyPicker
              lang={lang}
              currency={currency}
              onSelect={onCurrencyChange}
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
    <main className="flex-1 flex flex-col bg-slate-50">
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
          {/* Hero image as a full-height background; title + search card float over it */}
          <div className="relative flex-1 min-h-[520px]">
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
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70" />

            <div className="relative z-10 max-w-6xl mx-auto w-full px-4 pt-10 sm:pt-14 pb-12">
              <h1
                className="text-3xl sm:text-5xl font-bold text-white drop-shadow-md"
                data-testid="text-booking-title"
              >
                {t.title}
              </h1>
              <p className="mt-3 max-w-xl text-white/90 text-base sm:text-lg">{t.subtitle}</p>

              {/* Search card floating over the hero image */}
              <div className="mt-8 relative z-20 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">{t.title}</h2>
              <form
                onSubmit={handleSearch}
                className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end"
              >
                <div className="lg:flex-[2] lg:min-w-[300px]">
                  <label className={FIELD_LABEL_CLASS}>{t.selectDates}</label>
                  <DateRangePicker
                    lang={lang}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onChange={(ci, co) => { setCheckIn(ci); setCheckOut(co); }}
                    t={t}
                    priceByDate={priceByDate}
                  />
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
                        onChange={(e) => handleChildrenChange(parseInt(e.target.value, 10))}
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
                    <span className="grid">
                      <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-nowrap">{t.search}</span>
                      <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-nowrap">{t.searching}</span>
                      <span className="col-start-1 row-start-1 whitespace-nowrap">{loading ? t.searching : t.search}</span>
                    </span>
                  </button>
                </div>

                {children > 0 && (
                  <div className="w-full">
                    <label className={FIELD_LABEL_CLASS}>{t.childAgesLabel}</label>
                    <div className="flex flex-wrap gap-2">
                      {childAges.map((age, i) => (
                        <div key={i} className="w-[150px]">
                          <select
                            value={age}
                            onChange={(e) => setChildAge(i, e.target.value)}
                            className={INPUT_CLASS}
                            aria-label={fmt(t.childAgeN, { n: i + 1 })}
                            data-testid={`select-child-age-${i}`}
                          >
                            <option value="">{fmt(t.childAgeN, { n: i + 1 })}</option>
                            {Array.from({ length: 13 }, (_, a) => (
                              <option key={a} value={a}>{fmt(t.yearsOld, { count: a })}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{t.childAgeHint}</p>
                  </div>
                )}
              </form>
              </div>

              <div className="mt-6">{renderNotices()}</div>
            </div>
          </div>
        </>
      ) : (
        <>
          {renderTopBar()}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
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
                  <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem] gap-6 items-start">
                    <div className="space-y-4">
                    <p className="text-sm text-slate-500">{t.guestsSplitNote}</p>
                    {availableRooms.map((room) => {
                      const offer = room.offers[0];
                      const qty = cart[room.roomId] || 0;
                      const units = room.unitsAvailable || 0;
                      const incDisabled = qty >= units || !canAddRoom;
                      const sleepsAdults = room.maxAdults || room.maxPeople;
                      const sleepsKids = room.maxChildren || 0;
                      const sleepsText = sleepsKids > 0
                        ? fmt(t.sleepsAdultsChildren, {
                            adults: sleepsAdults,
                            children: sleepsKids === 1
                              ? t.childOccupant
                              : fmt(t.childrenOccupant, { count: sleepsKids }),
                          })
                        : fmt(t.sleeps, { count: sleepsAdults });
                      return (
                        <div
                          key={room.roomId}
                          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6"
                          data-testid={`card-room-${room.roomId}`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h3 className="text-lg font-semibold text-slate-900" data-testid={`text-room-name-${room.roomId}`}>
                                {room.name}
                              </h3>
                              <p className="text-sm text-slate-500 mt-0.5">
                                {fmt(t.perNightFrom, { nights: room.nights })}
                              </p>
                              <p className={`text-xs mt-1 ${offer.refundable ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {offer.refundable ? fmt(t.cancellationPolicy, { days: cancelDays }) : t.nonRefundable}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                                  <Users className="h-3.5 w-3.5" /> {sleepsText}
                                </span>
                                <span
                                  className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700"
                                  data-testid={`text-units-${room.roomId}`}
                                >
                                  {fmt(t.unitsLeft, { count: units })}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xl font-bold text-slate-900" data-testid={`text-offer-total-${room.roomId}`}>
                                {money(offer.total, room.currency)}
                              </p>
                              {fxLine(offer.total) && (
                                <p className="text-xs text-slate-400" data-testid={`text-offer-total-fx-${room.roomId}`}>
                                  {fxLine(offer.total)}
                                </p>
                              )}
                              <p className="text-xs text-slate-500">{t.perRoom}</p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                            <span className="text-sm font-medium text-slate-700">{t.rooms}</span>
                            <div className="inline-flex items-center rounded-xl border border-slate-300">
                              <button
                                type="button"
                                onClick={() => setRoomQty(room.roomId, qty - 1)}
                                disabled={qty <= 0}
                                aria-label={t.removeRoom}
                                className="px-3 py-2 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                data-testid={`button-dec-${room.roomId}`}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span
                                className="min-w-[2.5rem] text-center font-semibold text-slate-900"
                                data-testid={`text-qty-${room.roomId}`}
                              >
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => setRoomQty(room.roomId, qty + 1)}
                                disabled={incDisabled}
                                aria-label={t.addRoom}
                                className="px-3 py-2 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                data-testid={`button-inc-${room.roomId}`}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    </div>

                    {/* Live combined cart summary (debounced /api/booking/quote) — sticky right rail on desktop */}
                    <div className="lg:sticky lg:top-6">
                    {totalRooms > 0 ? (
                      <div
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-3"
                        data-testid="card-cart-summary"
                      >
                        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                          {t.yourSelection}
                        </h2>
                        {quoteError ? (
                          <p className="text-sm text-red-600" data-testid="status-quote-error">{quoteError}</p>
                        ) : quote ? (
                          <>
                            {quote.lines.map((line) => (
                              <div
                                key={`${line.roomId}-${line.offerId}`}
                                className="flex flex-wrap items-center justify-between gap-2 text-sm"
                                data-testid={`row-cart-${line.roomId}`}
                              >
                                <span className="text-slate-700">{line.qty} × {line.roomName}</span>
                                <span className="text-right">
                                  <span className="font-semibold text-slate-700">{money(line.lineTotal, quote.currency)}</span>
                                  {fxLine(line.lineTotal) && (
                                    <span className="block text-xs text-slate-400">{fxLine(line.lineTotal)}</span>
                                  )}
                                </span>
                              </div>
                            ))}
                            <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                              <span className="text-slate-500">{t.total}</span>
                              <span className="text-right">
                                <span className="font-semibold text-slate-700" data-testid="text-cart-total">{money(quote.total, quote.currency)}</span>
                                {fxLine(quote.total) && (
                                  <span className="block text-xs text-slate-400">{fxLine(quote.total)}</span>
                                )}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                              <span className="text-slate-500">{fmt(t.depositNow, { pct: quote.depositPercent })}</span>
                              <span className="text-right">
                                <span className="font-bold text-[#9e4b13]" data-testid="text-cart-deposit">{money(quote.deposit, quote.currency)}</span>
                                {fxLine(quote.deposit) && (
                                  <span className="block text-xs text-slate-400">{fxLine(quote.deposit)}</span>
                                )}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                              <span className="text-slate-500">{t.balanceOnArrival}</span>
                              <span className="text-right">
                                <span className="font-semibold text-slate-700" data-testid="text-cart-balance">{money(quote.balance, quote.currency)}</span>
                                {fxLine(quote.balance) && (
                                  <span className="block text-xs text-slate-400">{fxLine(quote.balance)}</span>
                                )}
                              </span>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-slate-500 flex items-center gap-2" data-testid="status-quote-loading">
                            <Loader2 className="h-4 w-4 animate-spin" /> {t.updatingPrice}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => { setStep('details'); setError(''); }}
                          disabled={!quote || quoteLoading || !!quoteError}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#9e4b13] px-5 py-3 text-white font-semibold hover:bg-[#854011] transition-colors disabled:opacity-60"
                          data-testid="button-continue-details"
                        >
                          {quoteLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                          {t.continueToDetails}
                        </button>
                        {showFx && (
                          <p className="text-xs text-slate-400" data-testid="text-fx-note">
                            {fmt(t.approxNote, { currency: baseCurrency })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div
                        className="hidden lg:block rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400"
                        data-testid="card-cart-summary-empty"
                      >
                        {t.selectRoomsToContinue}
                      </div>
                    )}
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-500 text-center pt-2">
                  {fmt(t.cancellationPolicy, { days: cancelDays })}
                </p>
              </div>
            )}

            {/* ── Step 3: Guest details ── */}
            {step === 'details' && quote && (
              <form onSubmit={handleCheckout} className="max-w-3xl mx-auto space-y-5">
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
                    <span className="text-slate-600 text-sm">{checkIn} → {checkOut}</span>
                    <span className="text-slate-600 text-sm">
                      {quote.nights} {t.nights} · {fmt(t.roomsCount, { count: quote.rooms })}
                    </span>
                  </div>
                  {quote.lines.map((line) => (
                    <div
                      key={`${line.roomId}-${line.offerId}`}
                      className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm"
                      data-testid={`row-summary-${line.roomId}`}
                    >
                      <span className="text-slate-700">{line.qty} × {line.roomName}</span>
                      <span className="text-right">
                        <span className="font-semibold text-slate-700">{money(line.lineTotal, quote.currency)}</span>
                        {fxLine(line.lineTotal) && (
                          <span className="block text-xs text-slate-400">{fxLine(line.lineTotal)}</span>
                        )}
                      </span>
                    </div>
                  ))}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm border-t border-slate-100 pt-3">
                    <span className="text-slate-500">{t.total}</span>
                    <span className="text-right">
                      <span className="font-semibold text-slate-700">{money(quote.total, quote.currency)}</span>
                      {fxLine(quote.total) && (
                        <span className="block text-xs text-slate-400">{fxLine(quote.total)}</span>
                      )}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-slate-500">{fmt(t.depositNow, { pct: quote.depositPercent })}</span>
                    <span className="text-right">
                      <span className="font-bold text-[#9e4b13]" data-testid="text-summary-deposit">{money(quote.deposit, quote.currency)}</span>
                      {fxLine(quote.deposit) && (
                        <span className="block text-xs text-slate-400">{fxLine(quote.deposit)}</span>
                      )}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-slate-500">{t.balanceOnArrival}</span>
                    <span className="text-right">
                      <span className="font-semibold text-slate-700">{money(quote.balance, quote.currency)}</span>
                      {fxLine(quote.balance) && (
                        <span className="block text-xs text-slate-400">{fxLine(quote.balance)}</span>
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
