import { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef, startTransition } from 'react';
import { ROUTE_DESCRIPTIONS } from '../utils/routeDescriptions.js';
import { useSeoPage } from '../utils/seoMeta';
import { useLocation } from 'wouter';
import { CalendarCheck2, Users, Loader2, ShieldCheck, ChevronLeft, ExternalLink, Star, CheckCircle2, Info, CreditCard, MessageCircle } from 'lucide-react';
import { getBookingStrings, fmt } from '../i18n/bookingStrings';
import { HERO_IMAGES, IMG } from '../data/content';
import { localizeUnits } from '../utils/localize';
import CurrencyPicker from './CurrencyPicker';
import DateRangePicker from './DateRangePicker';
import { trackBookingSession, getBookingAttributionId } from '../utils/analytics';
import MarinPanel from './MarinPanel';
import RoomCard, { money, approxMoney, getUnitKey, defaultRoomOccFor, BED_TOGGLE_UNIT_KEYS } from './RoomCard';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
// Lodge is in Mozambique (CAT = UTC+2, no DST). The cancellation window is
// measured from the lodge's calendar date so the boundary doesn't shift by a day
// around UTC midnight (UTC "today" can lag the property's date by ~2h).
function bookingTodayStr() {
  return new Date(Date.now() + 2 * 3600000).toISOString().slice(0, 10);
}
function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
// Display a YYYY-MM-DD stay date as DD-MM-YYYY (the YYYY-MM-DD form stays the
// canonical value sent to /availability and /checkout — this is display-only).
const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];
function displayDate(dateStr) {
  const [y, m, d] = String(dateStr).split('-');
  if (!y || !m || !d) return dateStr;
  const month = MONTH_ABBR[parseInt(m, 10) - 1] ?? m;
  return `${parseInt(d, 10)} ${month} ${y}`;
}
const INPUT_CLASS =
  'w-full rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-slate-900 focus:border-[#9e4b13] focus:ring-1 focus:ring-[#9e4b13] outline-none';
const FIELD_LABEL_CLASS =
  'block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1';

export default function BookDirectPage({ lang = 'en-GB', countryCode, ui, currency, region, onLangChange, onRegionChange, onCurrencyChange }) {
  const t = useMemo(() => getBookingStrings(lang), [lang]);
  // Beds24 returns room names in plain English only (they live in the Beds24
  // property config, not this codebase) — reuse the same accommodation-name
  // translations as the marketing unit pages so guests see a localized name
  // instead of the raw Beds24 string.
  const localizedUnits = useMemo(() => localizeUnits(lang), [lang]);

  const translateRoomName = (name) => {
    const unitKey = getUnitKey(name);
    return (unitKey && localizedUnits.find((u) => u.key === unitKey)?.title) || name;
  };
  const [, navigate] = useLocation();

  // Hide floating third-party widgets (Trustindex badge/popup) inside the
  // booking funnel — the floating badge overlaps result-card imagery. Review
  // proof is shown inline in the summary rail instead (see below). CSS rule
  // lives in index.html (body.dv-hide-floating-widgets).
  useEffect(() => {
    document.body.classList.add('dv-hide-floating-widgets');
    return () => document.body.classList.remove('dv-hide-floating-widgets');
  }, []);

  // Load the Trustindex cert badge and move it into the booking summary card.
  // loader-cert.js creates a floating .ti-widget-fixed element in <body>;
  // we intercept it via MutationObserver and relocate it into our container
  // so it appears inline rather than as a floating overlay.
  const tiCertRef = useRef(null);
  useEffect(() => {
    const SRC = 'https://cdn.trustindex.io/loader-cert.js?9f47635799f257217f56dbb5f2e';
    const BADGE_ID = 'ti-cert-booking-badge';

    function adoptBadge() {
      if (!tiCertRef.current) return false;
      // Trustindex creates elements with data-trustindex-widget or ti-widget-fixed
      const el = document.querySelector(
        `.ti-widget-fixed[data-widget-id="9f47635799f257217f56dbb5f2e"], ` +
        `[data-trustindex-widget][data-widget-id="9f47635799f257217f56dbb5f2e"]`
      ) || document.querySelector('.ti-widget-fixed:not(#' + BADGE_ID + ')');
      if (!el || el.id === BADGE_ID) return false;
      el.id = BADGE_ID;
      // Remove fixed-positioning classes so it flows inline
      el.classList.remove('ti-widget-fixed');
      el.style.position = '';
      el.style.cssText = '';
      tiCertRef.current.appendChild(el);
      return true;
    }

    // Watch for Trustindex to inject the badge
    const obs = new MutationObserver(() => { if (adoptBadge()) obs.disconnect(); });
    obs.observe(document.body, { childList: true, subtree: true });

    // Load the script if not already present
    if (!document.querySelector(`script[src="${SRC}"]`)) {
      const s = document.createElement('script');
      s.src = SRC;
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    } else {
      // Script already ran — badge may already exist
      adoptBadge();
    }

    return () => obs.disconnect();
  }, []);

  const [step, setStep] = useState('search'); // search | results | details
  // Dates start unset — the guest picks them explicitly instead of landing on
  // a pre-filled 2-night quote for tomorrow, which (a) reads as "the price"
  // rather than "a 2-night price" at a glance, and (b) can show a discouraging
  // last-minute rate before the guest has chosen when they actually want to stay.
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [childAges, setChildAges] = useState([]); // one entry per child; '' until chosen
  const [infantAges, setInfantAges] = useState([]); // one entry per infant; '' until chosen
  const [discountCode, setDiscountCode] = useState('');
  const [voucherCode, setVoucherCode] = useState('');

  useSeoPage({
    title: 'Book Direct | DEVOCEAN Lodge – Ponta do Ouro, Mozambique',
    description: ROUTE_DESCRIPTIONS['/book-direct'],
    canonical: 'https://devoceanlodge.com/book-direct',
    ogTitle: 'Book Direct | DEVOCEAN Lodge – Ponta do Ouro, Mozambique',
    ogDescription: ROUTE_DESCRIPTIONS['/book-direct'],
    ogImage: 'https://devoceanlodge.com/photos/hero01.jpg',
    ogUrl: 'https://devoceanlodge.com/book-direct',
    ogType: 'website',
    twitterTitle: 'Book Direct | DEVOCEAN Lodge – Ponta do Ouro, Mozambique',
    twitterDescription: ROUTE_DESCRIPTIONS['/book-direct'],
    twitterImage: 'https://devoceanlodge.com/photos/hero01.jpg',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState(null); // full availability response
  const [cart, setCart] = useState({}); // roomId → qty (per-type cart)
  const [rateChoice, setRateChoice] = useState({}); // roomId → offerId (chosen rate plan)
  const [roomOccupancy, setRoomOccupancy] = useState({}); // roomId → [{adults,children,infants}] one entry per unit
  const [quote, setQuote] = useState(null); // live combined quote (from /api/booking/quote)
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  const [bedType, setBedType] = useState({}); // roomId → 'king' | 'twin'

  const [guest, setGuest] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [canceled, setCanceled] = useState(false);
  const [fxData, setFxData] = useState(null); // { base, rates } — display-only
  const [priceByDate, setPriceByDate] = useState({}); // iso→rate, drives picker tiers (display-only)
  const [nearestState, setNearestState] = useState({}); // roomId → {loading, checkIn, checkOut, error}

  // Stable mutable refs so useCallback handlers can read the latest state
  // without stale closures, without adding frequently-changing state to deps.
  // Assigned inline (not in useEffect) so they're always current at call time.
  const roomOccupancyRef = useRef(roomOccupancy);
  roomOccupancyRef.current = roomOccupancy;
  const cartRef = useRef(cart);
  cartRef.current = cart;
  const tRef = useRef(t);
  // Unit key from ?unit= (set by the unit detail pages' CTAs) — after results
  // render, scroll to that unit's room card once so the guest returns to the
  // room they were reading about.
  const focusUnitRef = useRef(null);
  tRef.current = t;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('canceled') === '1') setCanceled(true);

    // Restore search state from URL — supports Marin "Continue" links, browser
    // Back from a room-detail page, and shared results links.
    const pCheckIn  = params.get('checkIn')  || null;
    const pCheckOut = params.get('checkOut') || null;
    const pAdults   = params.get('adults')   ? Number(params.get('adults'))   : null;
    const pChildren = params.get('children') ? Number(params.get('children')) : 0;
    const pInfants  = params.get('infants')  ? Number(params.get('infants'))  : null;
    const pDiscount = params.get('discount') || '';
    const pCurrency = params.get('currency') || null;
    const pUnit     = params.get('unit')     || null;
    if (pUnit) focusUnitRef.current = pUnit;

    if (pCheckIn)           setCheckIn(pCheckIn);
    if (pCheckOut)          setCheckOut(pCheckOut);
    if (pAdults != null)    setAdults(pAdults);
    if (pChildren)          setChildren(pChildren);
    if (pInfants != null)   setInfants(pInfants);
    if (pDiscount)          setDiscountCode(pDiscount);
    // Restore display currency without overwriting a user's explicit earlier choice.
    if (pCurrency && onCurrencyChange) onCurrencyChange(pCurrency);

    // Auto-search when dates are in the URL and no child ages are needed.
    // If children > 0 the visitor must confirm child ages first, so just
    // pre-fill the form and let them press "Check availability" themselves.
    if (pCheckIn && pCheckOut && !pChildren) {
      const n = Math.round(
        (new Date(`${pCheckOut}T00:00:00Z`) - new Date(`${pCheckIn}T00:00:00Z`)) / 86400000,
      );
      if (n >= 1) {
        const a = pAdults ?? 2;
        setLoading(true);
        fetch('/api/booking/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkIn: pCheckIn, checkOut: pCheckOut, adults: a, children: 0 }),
        })
          .then((r) => r.json())
          .then((data) => {
            setAvailability(data);
            setCart({});
            setRateChoice({});
            setRoomOccupancy({});
            setQuote(null);
            setQuoteError('');
            setStep('results');
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Remove the static hero placeholder (index.html #bd-hero-placeholder) once
  // this component has actually mounted and rendered its own hero — it has
  // done its job of painting the LCP image before the lazy chunk was ready.
  // useLayoutEffect (not useEffect) so it runs before the browser paints this
  // mount, avoiding a one-frame flash of both the placeholder and real hero.
  useLayoutEffect(() => {
    document.getElementById('bd-hero-placeholder')?.remove();
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

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const a = new Date(`${checkIn}T00:00:00Z`).getTime();
    const b = new Date(`${checkOut}T00:00:00Z`).getTime();
    return Math.max(0, Math.round((b - a) / 86_400_000));
  }, [checkIn, checkOut]);

  // Query-string fragment appended to room-detail page links so the visitor
  // can return to /book-direct with the same search already loaded.
  const detailQueryString = useMemo(() => {
    const p = new URLSearchParams({ lang });
    if (checkIn)             p.set('checkIn', checkIn);
    if (checkOut)            p.set('checkOut', checkOut);
    if (adults !== 2)        p.set('adults', String(adults));
    if (children > 0)        p.set('children', String(children));
    if (infants > 0)         p.set('infants', String(infants));
    if (discountCode.trim()) p.set('discount', discountCode.trim());
    // Preserve the selected display currency across the detail-page round trip
    // (the static detail pages forward their query string back to /book-direct,
    // whose mount effect restores ?currency via onCurrencyChange).
    if (currency)            p.set('currency', currency);
    return p.toString();
  }, [lang, checkIn, checkOut, adults, children, infants, discountCode, currency]);

  // One-shot scroll to the room card matching ?unit= once results are visible.
  useEffect(() => {
    if (step !== 'results' || !availability || !focusUnitRef.current) return;
    const unit = focusUnitRef.current;
    focusUnitRef.current = null;
    // Wait a frame so the cards are in the DOM.
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-unit="${CSS.escape(unit)}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [step, availability]);

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
  const effInfants = infants;

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
  function handleInfantsChange(n) {
    setInfants(n);
    setInfantAges((prev) => {
      const next = prev.slice(0, n);
      while (next.length < n) next.push('');
      return next;
    });
  }
  function setInfantAge(i, value) {
    setInfantAges((prev) => prev.map((a, idx) => (idx === i ? value : a)));
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
    if (infants > 0 && infantAges.some((a) => a === '' || a == null)) {
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
      setRateChoice({});      // …and no rate-plan overrides
      setRoomOccupancy({});   // …and no per-room occupancy overrides
      setNearestState({});    // clear any previous nearest-available results
      setQuote(null);
      setQuoteError('');
      setStep('results');
      // Encode search state in URL so the visitor can return to these results
      // via browser Back, a shared link, or a room-detail "Book Direct" CTA.
      try {
        const sp = new URLSearchParams();
        if (checkIn)             sp.set('checkIn', checkIn);
        if (checkOut)            sp.set('checkOut', checkOut);
        if (adults !== 2)        sp.set('adults', String(adults));
        if (children > 0)        sp.set('children', String(children));
        if (discountCode.trim()) sp.set('discount', discountCode.trim());
        if (currency)            sp.set('currency', currency);
        window.history.replaceState(null, '', `/book-direct?${sp.toString()}`);
      } catch (_) {}
    } catch (err) {
      setError(err.message || t.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  async function searchWithDates(newCheckIn, newCheckOut) {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
    setNearestState({});
    setError('');
    setCanceled(false);
    setLoading(true);
    try {
      const res = await fetch('/api/booking/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkIn: newCheckIn, checkOut: newCheckOut, adults: effAdults, children: effChildren }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || t.errorGeneric);
      setAvailability(data);
      setCart({});
      setRateChoice({});
      setRoomOccupancy({});
      setQuote(null);
      setQuoteError('');
      setStep('results');
      try {
        const sp = new URLSearchParams();
        sp.set('checkIn', newCheckIn);
        sp.set('checkOut', newCheckOut);
        if (adults !== 2)        sp.set('adults', String(adults));
        if (children > 0)        sp.set('children', String(children));
        if (discountCode.trim()) sp.set('discount', discountCode.trim());
        if (currency)            sp.set('currency', currency);
        window.history.replaceState(null, '', `/book-direct?${sp.toString()}`);
      } catch (_) {}
    } catch (err) {
      setError(err.message || t.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  async function handleFindNearest(room) {
    setNearestState((prev) => ({
      ...prev,
      [room.roomId]: { loading: true, checkIn: null, checkOut: null, error: null },
    }));
    try {
      const res = await fetch('/api/booking/nearest-available', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.roomId,
          fromDate: checkIn,
          nights,
          adults: effAdults,
          children: effChildren,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || t.errorGeneric);
      if (!data.found) {
        setNearestState((prev) => ({
          ...prev,
          [room.roomId]: { loading: false, checkIn: null, checkOut: null, error: 'No availability found in the next 12 weeks.' },
        }));
      } else {
        setNearestState((prev) => ({
          ...prev,
          [room.roomId]: { loading: false, checkIn: data.checkIn, checkOut: data.checkOut, error: null },
        }));
      }
    } catch (err) {
      setNearestState((prev) => ({
        ...prev,
        [room.roomId]: { loading: false, checkIn: null, checkOut: null, error: err.message || t.errorGeneric },
      }));
    }
  }

  async function handleCheckout(e) {
    e?.preventDefault();
    setError('');
    if (cartLines.length === 0) return setError(t.selectRoomsToContinue);
    if (!guest.firstName.trim()) return setError(t.firstName + ' *');
    if (!guest.lastName.trim()) return setError(t.lastName + ' *');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email.trim())) return setError(t.email + ' *');
    if (!guest.phone.trim()) return setError(t.phone + ' *');
    setLoading(true);
    // Record the GA4 session for this booking (fallback heuristic) and capture
    // the exact client_id to thread through checkout → webhook → email-ingest so
    // the confirmed booking is attributed precisely. Never blocks checkout.
    let gaClientId = null;
    try {
      trackBookingSession(lang, currency);
      gaClientId = getBookingAttributionId();
    } catch { /* analytics must never break checkout */ }
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
          discountCode: discountCode.trim() || undefined,
          voucher: voucherCode.trim() || undefined,
          gaClientId,
          // Send the EFFECTIVE preference for every room with a bed selector:
          // the UI shows "King" pre-selected, so an untouched selector must
          // still send 'king' — otherwise the Beds24 note silently omits the
          // bed preference the guest saw as chosen.
          bedPreferences: (() => {
            const prefs = { ...bedType };
            for (const cl of cartLines) {
              if (prefs[cl.roomId]) continue;
              const room = availableRooms.find((r) => r.roomId === cl.roomId);
              const uk = room ? getUnitKey(room.name) : null;
              if (BED_TOGGLE_UNIT_KEYS.includes(uk)) prefs[cl.roomId] = 'king';
            }
            return Object.keys(prefs).length > 0 ? prefs : undefined;
          })(),
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

  // Each available room type, reduced to the rate(s) we surface to the guest.
  // Default: only the single cheapest still-bookable offer. Exception: when that
  // cheapest offer is Non-refundable, also surface the cheapest Semi-flexible
  // offer so the guest can opt for a refundable plan (server re-prices the chosen
  // offerId regardless).
  const availableRooms = useMemo(
    () =>
      (availability?.rooms || [])
        .map((r) => {
          const priced = (Array.isArray(r.offers) ? r.offers : [])
            .filter((o) => Number.isFinite(o.total) && o.total > 0)
            .sort((a, b) => a.total - b.total);
          if (priced.length === 0) return null;
          const cheapest = priced[0];
          const offers = [cheapest];
          if (cheapest.type === 'nonRef') {
            const semiFlex = priced.find(
              (o) => o.type === 'semiFlex' && o.offerId !== cheapest.offerId,
            );
            if (semiFlex) offers.push(semiFlex);
          }
          return { ...r, offers };
        })
        .filter((r) => r && r.available)
        .sort((a, b) => a.offers[0].total - b.offers[0].total),
    [availability],
  );
  const unavailableRooms = useMemo(
    () => (availability?.rooms || []).filter((r) => !r.available),
    [availability],
  );
  const cancelDays = availability?.cancellationPolicyDays ?? 30;
  // "Free cancellation up to N days before arrival" only holds when arrival is at
  // least `cancelDays` away from today (the booking date). Once inside that
  // window the free-cancellation policy no longer applies, so the line is hidden.
  const arrivalISO = availability?.checkIn || checkIn;
  const daysToArrival = Math.round(
    (new Date(`${arrivalISO}T00:00:00Z`).getTime() -
      new Date(`${bookingTodayStr()}T00:00:00Z`).getTime()) /
      86400000,
  );
  const freeCancellation = daysToArrival >= cancelDays;
  const maxRooms = availability?.maxRooms ?? 5;

  // Cart lines for /quote + /checkout: {roomId, offerId, qty}. offerId is the
  // guest-chosen rate plan, defaulting to the refundable (semi-flexible) plan
  // so the non-refundable rate is never preselected (server re-prices; this
  // only picks the plan).
  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .flatMap(([roomId, qty]) => {
          const room = availableRooms.find((r) => r.roomId === roomId);
          const offer = room
            ? room.offers.find((o) => o.offerId === rateChoice[roomId]) ||
              room.offers.find((o) => o.refundable) ||
              room.offers[0]
            : null;
          // When the party includes children/infants, expand into individual unit
          // entries (qty=1 each) so the backend prices each unit at its actual occupancy.
          if ((effChildren > 0 || effInfants > 0) && room) {
            const occArr = roomOccupancy[roomId] ?? Array.from({ length: qty }, () => defaultRoomOccFor(room, effAdults, effChildren));
            return occArr.slice(0, qty).map((occ) => ({
              roomId, offerId: offer?.offerId ?? null, qty: 1,
              adults: occ.adults, children: occ.children, infants: occ.infants ?? 0,
            }));
          }
          return [{ roomId, offerId: offer?.offerId ?? null, qty }];
        }),
    [cart, availableRooms, rateChoice, roomOccupancy, effAdults, effChildren, effInfants],
  );
  const totalRooms = useMemo(() => cartLines.reduce((s, l) => s + l.qty, 0), [cartLines]);
  const canAddRoom = totalRooms < maxRooms;

  // ── Informational currency conversion (display only) ──────────────────────
  // The base/charged currency is the Beds24 property currency (availability
  // currency); the rates below NEVER change what Stripe charges. We just show an
  // approximate value in the visitor's local currency (the bar currency).
  // Declared before the Marin context memos so Marin can quote the same
  // approximate FX amounts the guest sees on the cards.
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
  // Primary display value in the visitor's chosen/geolocated currency (no ≈ prefix).
  const fxPrimary = (amount) =>
    showFx ? approxMoney(amount * fxRatesForBase[currency], currency) : null;

  // Context strings passed to MarinPanel so Marin knows what the visitor is
  // currently looking at — dates, available rooms + prices, guest count, and
  // booking currency. Sent once with the auto-message on panel open.
  const marinResultsContext = useMemo(() => {
    if (!checkIn || !checkOut || !availability) return '';
    const nights = availability.nights || 0;
    const guestParts = [
      adults > 0 ? `${adults} adult${adults !== 1 ? 's' : ''}` : '',
      children > 0 ? `${children} child${children !== 1 ? 'ren' : ''}` : '',
      infants > 0 ? `${infants} infant${infants !== 1 ? 's' : ''}` : '',
    ].filter(Boolean);
    const guestStr = guestParts.length ? guestParts.join(', ') : '2 adults';
    const baseQs = `checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}${children > 0 ? `&children=${children}` : ''}${infants > 0 ? `&infants=${infants}` : ''}${currency ? `&currency=${currency}` : ''}`;
    const bookUrl = `https://devoceanlodge.com/book-direct?${baseQs}`;
    // English policy summaries for Marin (Marin replies in the guest's language).
    const semiFlexPolicy = `50% deposit \u00b7 full refund ${cancelDays}+ days before arrival \u00b7 50% cancellation fee less than ${cancelDays} days`;
    const nonRefPolicy = 'full payment due now \u00b7 no refund after the 24-hour grace period';
    const lines = [
      'Visitor is viewing availability results on the DEVOCEAN Lodge booking page.',
      `Check-in: ${checkIn}. Check-out: ${checkOut}. Nights: ${nights}. Guests: ${guestStr}.`,
      `Book-direct URL: ${bookUrl}`,
      '',
    ];
    if (availableRooms.length > 0) {
      lines.push('Available options:');
      availableRooms.forEach((r) => {
        const units = (r.offers.find((o) => o.refundable) || r.offers[0])?.unitsAvailable ?? 0;
        const unitKey = getUnitKey(r.name);
        const deepLink = `https://devoceanlodge.com/book-direct?${baseQs}${unitKey ? `&unit=${unitKey}` : ''}`;
        // One line per rate plan, named, with its policy summary. Lead with the
        // guest's display currency when an FX display currency is active; the
        // charged (base-currency) amount follows in parentheses.
        const planLines = r.offers.map((o) => {
          const planName = o.refundable ? 'Semi-flexible (refundable)' : 'Non-refundable';
          const policy = o.refundable ? semiFlexPolicy : nonRefPolicy;
          const price = showFx
            ? `${fxLine(o.total)} total (${money(o.total, r.currency)} charged)`
            : `${money(o.total, r.currency)} total`;
          return `  - ${planName}: ${price}. Policy: ${policy}.`;
        });
        lines.push(`- ${r.name}: ${units} unit${units !== 1 ? 's' : ''} available.`);
        lines.push(...planLines);
        lines.push(`  - Continue with this option: ${deepLink}`);
      });
      lines.push('');
      lines.push('When comparing options, use one compact row per option: room + plan name, price, one-line policy, and its "Continue with this option" link.');
      if (showFx) {
        lines.push(`Lead with ${currency} amounts (what the guest sees on the page); mention that all charges are made in ${baseCurrency} and ${currency} amounts are approximate conversions.`);
      }
    }
    if (unavailableRooms.length > 0) {
      lines.push('');
      lines.push('Sold out for these dates:');
      unavailableRooms.forEach((r) => lines.push(`- ${r.name}`));
    }
    return lines.join('\n');
  }, [checkIn, checkOut, availability, adults, children, infants, availableRooms, unavailableRooms, showFx, fxRatesForBase, currency, baseCurrency, cancelDays]);

  const marinDetailsContext = useMemo(() => {
    if (!checkIn || !checkOut || !quote) return '';
    const guestParts = [
      adults > 0 ? `${adults} adult${adults !== 1 ? 's' : ''}` : '',
      children > 0 ? `${children} child${children !== 1 ? 'ren' : ''}` : '',
      infants > 0 ? `${infants} infant${infants !== 1 ? 's' : ''}` : '',
    ].filter(Boolean);
    const guestStr = guestParts.length ? guestParts.join(', ') : '2 adults';
    const lines = [
      'Visitor is at the pre-payment stage on the DEVOCEAN Lodge booking page.',
      `Check-in: ${checkIn}. Check-out: ${checkOut}. Nights: ${quote.nights}. Guests: ${guestStr}.`,
      '',
      'Selected booking:',
    ];
    // Mirror the on-page display: when an FX display currency is active the
    // guest sees approximate converted amounts, so quote both.
    const withFx = (amount) =>
      showFx
        ? `${money(amount, quote.currency)} (${fxLine(amount)})`
        : money(amount, quote.currency);
    quote.lines.forEach((l) => {
      lines.push(`- ${l.qty} × ${l.roomName}: ${withFx(l.lineTotal)}`);
    });
    const bookUrl = `https://devoceanlodge.com/book-direct?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}${children > 0 ? `&children=${children}` : ''}${infants > 0 ? `&infants=${infants}` : ''}`;
    lines.push(`Total: ${withFx(quote.total)}. Deposit required now: ${withFx(quote.deposit)}. Balance on arrival: ${withFx(quote.balance)}.`);
    if (showFx) {
      lines.push(`Note: all charges are made in ${quote.currency}. ${currency} amounts are approximate display conversions only.`);
    }
    lines.push(`Book-direct URL: ${bookUrl}`);
    return lines.join('\n');
  }, [checkIn, checkOut, quote, adults, children, infants, showFx, fxRatesForBase, currency]);

  // Minimum units needed to fit the whole party in the most spacious available room type.
  // Falls back to capacity=2 per unit (the lodge default) when availableRooms is empty,
  // so the note shows the correct count even when all units are unavailable for the dates.
  const minUnitsNeeded = useMemo(() => {
    const maxCap = (availableRooms ?? []).reduce((best, r) => {
      const uk = getUnitKey(r.name);
      const cap = BED_TOGGLE_UNIT_KEYS.includes(uk)
        ? (r.maxAdults || 2) + 1 : (r.maxAdults || r.maxPeople || 2);
      return Math.max(best, cap);
    }, 2);
    return Math.ceil((effAdults + effChildren + effInfants) / maxCap);
  }, [availableRooms, effAdults, effChildren, effInfants]);

  // Card interaction handlers — all wrapped in useCallback with minimal deps
  // so the memoized RoomCard components' prop comparison holds and a tap on
  // one card only re-renders that card.
  const setRoomQty = useCallback((roomId, qty) => {
    setQuoteLoading(true); // urgent — gates the Continue button immediately
    startTransition(() => {
      setCart((c) => {
        const next = { ...c };
        if (qty <= 0) delete next[roomId];
        else next[roomId] = qty;
        return next;
      });
      // Sync per-unit occupancy array length to the new qty
      if (qty <= 0) {
        setRoomOccupancy((prev) => { const next = { ...prev }; delete next[roomId]; return next; });
      } else {
        const room = availableRooms.find((r) => r.roomId === roomId);
        const def = room ? defaultRoomOccFor(room, effAdults, effChildren) : { adults: 0, children: 0, infants: 0 };
        setRoomOccupancy((prev) => {
          const current = prev[roomId] ?? [];
          return { ...prev, [roomId]: Array.from({ length: qty }, (_, i) => current[i] ?? { ...def }) };
        });
      }
    });
  }, [availableRooms, effAdults, effChildren]);

  // Switch a room's selected rate plan; clamp any cart qty to the new offer's
  // availability (rate plans can have different unit counts).
  //
  // When the switch reduces qty (N → M), we must not silently drop children or
  // infants that were assigned to the removed units.  Strategy:
  //   1. Keep the surviving units (0..M-1) intact — their adult counts are the
  //      guest's explicit choice and must not be touched.
  //   2. Try to absorb any children/infants from each dropped unit (M..N-1)
  //      into the surviving units' remaining capacity.
  //   3. If they all fit → apply the switch with the merged occupancy.
  //   4. If any child or infant cannot fit → block the switch entirely and show
  //      an actionable error; the rate choice and cart are left unchanged.
  const setRoomRate = useCallback((roomId, offerId) => {
    const room = availableRooms.find((r) => r.roomId === roomId);
    const offer = room?.offers.find((o) => o.offerId === offerId);
    const units = offer?.unitsAvailable ?? 0;
    const oldQty = cartRef.current[roomId] ?? 0;

    if (room && oldQty > units) {
      // Qty will be clamped: check whether children/infants from the dropped
      // units can be absorbed by the surviving ones without exceeding each
      // unit's per-occupancy capacity.
      const current = (roomOccupancyRef.current[roomId] ?? []).slice(0, oldQty);

      const uk = getUnitKey(room.name);
      const childUnit = BED_TOGGLE_UNIT_KEYS.includes(uk);
      const maxA = room.maxAdults ?? 2;
      const maxP = childUnit ? maxA + 1 : (room.maxPeople ?? maxA);

      // Deep-copy surviving entries so redistribution mutations don't touch state.
      const surviving = current.slice(0, units).map((u) => ({ ...u }));
      const dropped   = current.slice(units);

      let overflow = false;
      for (const du of dropped) {
        let exC = du.children ?? 0;
        let exI = du.infants  ?? 0;
        for (let i = 0; i < surviving.length && (exC > 0 || exI > 0); i++) {
          const freeC = Math.max(0, maxP - surviving[i].adults - surviving[i].children - surviving[i].infants);
          const fitC  = Math.min(exC, freeC);
          surviving[i].children += fitC; exC -= fitC;
          const freeI = Math.max(0, maxP - surviving[i].adults - surviving[i].children - surviving[i].infants);
          const fitI  = Math.min(exI, freeI);
          surviving[i].infants  += fitI; exI -= fitI;
        }
        if (exC > 0 || exI > 0) { overflow = true; break; }
      }

      if (overflow) {
        // Block the rate switch: party doesn't fit in fewer units.
        setError(tRef.current.partyTooLargeForRate ?? tRef.current.errorGeneric);
        setQuoteLoading(false);
        return;
      }

      // All children/infants fit → apply the switch with the merged occupancy.
      setQuoteLoading(true);
      startTransition(() => {
        setRateChoice((c) => ({ ...c, [roomId]: offerId }));
        setCart((c) => ({ ...c, [roomId]: units }));
        setRoomOccupancy((prev) => ({ ...prev, [roomId]: surviving }));
      });
      return;
    }

    // No qty clamping needed: straightforward rate switch.
    setQuoteLoading(true);
    startTransition(() => {
      setRateChoice((c) => ({ ...c, [roomId]: offerId }));
      setCart((c) => (c[roomId] && c[roomId] > units ? { ...c, [roomId]: units } : c));
    });
  }, [availableRooms]);

  const setRoomOcc = useCallback((roomId, unitIdx, field, val) => {
    setQuoteLoading(true); // urgent — gates the Continue button immediately
    startTransition(() => {
      setRoomOccupancy((prev) => {
        // setRoomQty always seeds prev[roomId] before the occupancy steppers
        // become visible (they only render at qty > 0), so the empty-array
        // fallback here is just belt-and-braces.
        const current = prev[roomId] ?? [];
        const newArr = current.map((u, i) =>
          i === unitIdx ? { ...u, [field]: Math.max(0, val) } : u
        );
        return { ...prev, [roomId]: newArr };
      });
    });
  }, []);

  const setRoomBedType = useCallback((roomId, bt) => {
    setBedType((prev) => ({ ...prev, [roomId]: bt }));
  }, []);

  // Localised rate-plan label for a room/offer (used in the cart summaries).
  // Last-minute rates require a 100% deposit at booking (not the usual partial
  // deposit); append a clarifying note so guests don't miss the full prepayment.
  function withRateNote(label, type) {
    if (!label) return label;
    return (type === 'lastMinute' || type === 'nonRef') && t.depositFullNow ? `${label} (${t.depositFullNow})` : label;
  }
  function rateLabelFor(roomId, offerId) {
    const room = availableRooms.find((r) => r.roomId === roomId);
    const o = room?.offers.find((x) => x.offerId === offerId);
    return o ? withRateNote(t.rate?.[o.type] || '', o.type) : '';
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
          body: JSON.stringify({
            checkIn,
            checkOut,
            adults: effAdults,
            children: effChildren,
            rooms: cartLines,
            discountCode: discountCode.trim() || undefined,
            voucher: voucherCode.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          startTransition(() => { setQuote(null); setQuoteError(data?.error || t.errorGeneric); });
        } else {
          startTransition(() => { setQuote(data); setQuoteError(''); });
        }
      } catch {
        if (!cancelled) {
          startTransition(() => { setQuote(null); setQuoteError(t.errorGeneric); });
        }
      } finally {
        if (!cancelled) setQuoteLoading(false); // urgent — re-enables the Continue button
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [cartLines, checkIn, checkOut, effAdults, effChildren, step, t, discountCode, voucherCode]);

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
    <main className="flex-1 flex flex-col bg-slate-50 pt-[var(--stack-h)]">
      {step === 'search' ? (
        <>
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
                fetchpriority="high"
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
              <ul className="mt-3 flex flex-col gap-1.5 text-white/90 text-base sm:text-lg">
                {[
                  [ShieldCheck,    t.subtitle?.split('\n')[0]],
                  [CalendarCheck2, t.subtitle?.split('\n')[1]],
                  [Star,           t.subtitle?.split('\n')[2]],
                ].map(([Icon, line], i) => line && (
                  <li key={i} className="flex items-center gap-2">
                    <Icon size={18} className="shrink-0 opacity-90" />
                    {line}
                  </li>
                ))}
              </ul>

              {/* Search card floating over the hero image */}
              <div className="mt-8 relative z-20 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">{t.cardTitle}</h2>
                  <div className="flex items-center gap-2">
                    <span className={FIELD_LABEL_CLASS} style={{marginBottom:0}}>{t.currencyFieldLabel || 'Currency'}</span>
                    <CurrencyPicker lang={lang} currency={currency} onSelect={onCurrencyChange} />
                  </div>
                </div>
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
                    onChange={(ci, co) => { startTransition(() => { setCheckIn(ci); setCheckOut(co); }); }}
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
                        onChange={(e) => startTransition(() => setAdults(parseInt(e.target.value, 10)))}
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
                        onChange={(e) => startTransition(() => handleChildrenChange(parseInt(e.target.value, 10)))}
                        className={INPUT_CLASS}
                        aria-label={t.children}
                        data-testid="select-children"
                      >
                        {[0, 1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>{n} · {t.children}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <select
                        value={infants}
                        onChange={(e) => startTransition(() => handleInfantsChange(parseInt(e.target.value, 10)))}
                        className={INPUT_CLASS}
                        aria-label={t.infants}
                        data-testid="select-infants"
                      >
                        {[0, 1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>{n} · {t.infants}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {(children > 0 || infants > 0) && (
                  <div className="w-full flex flex-col gap-4">
                    {children > 0 && (
                      <div>
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
                                {Array.from({ length: 9 }, (_, i) => i + 4).map((a) => (
                                  <option key={a} value={a}>{fmt(t.yearsOld, { count: a })}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{t.childAgeHint}</p>
                      </div>
                    )}
                    {infants > 0 && (
                      <div>
                        <label className={FIELD_LABEL_CLASS}>{t.infantAgesLabel}</label>
                        <div className="flex flex-wrap gap-2">
                          {infantAges.map((age, i) => (
                            <div key={i} className="w-[150px]">
                              <select
                                value={age}
                                onChange={(e) => setInfantAge(i, e.target.value)}
                                className={INPUT_CLASS}
                                aria-label={fmt(t.infantAgeN, { n: i + 1 })}
                                data-testid={`select-infant-age-${i}`}
                              >
                                <option value="">{fmt(t.infantAgeN, { n: i + 1 })}</option>
                                {Array.from({ length: 4 }, (_, a) => (
                                  <option key={a} value={a}>{fmt(t.yearsOld, { count: a })}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{t.infantAgeHint}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="w-full grid grid-cols-2 gap-2 lg:flex lg:flex-row lg:items-end lg:gap-4">
                  <div className="lg:flex-1 lg:min-w-[150px]">
                    <label className={FIELD_LABEL_CLASS}>{t.discountCodeLabel}</label>
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className={INPUT_CLASS}
                      placeholder={t.optional}
                      data-testid="input-discount-code"
                      autoComplete="off"
                    />
                  </div>

                  <div className="lg:flex-1 lg:min-w-[150px]">
                    <label className={FIELD_LABEL_CLASS}>Gift voucher code</label>
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      className={INPUT_CLASS}
                      placeholder={t.optional}
                      data-testid="input-voucher-code"
                      autoComplete="off"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1 lg:flex-none lg:ml-auto">
                    <button
                      type="submit"
                      disabled={loading || nights < 1}
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
                </div>
              </form>
              </div>

              <a
                href="/gift-vouchers"
                className="mt-8 flex items-center gap-3 rounded-xl bg-white/95 backdrop-blur border border-white/60 px-4 py-3 shadow-sm hover:bg-white transition-colors"
                data-testid="link-gift-vouchers-promo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a4 4 0 00-4-4H6.5a2.5 2.5 0 000 5H12zm0 0V6a4 4 0 014-4h1.5a2.5 2.5 0 010 5H12zM4 12h16v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8z" /></svg>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{t.giftPromoTitle}</p>
                  <p className="text-xs text-slate-500">{t.giftPromoSubtitle}</p>
                </div>
              </a>

              <div className="mt-6">{renderNotices()}</div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
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

                <div className="flex items-center justify-between gap-4">
                  <span
                    className="inline-flex items-start gap-2 rounded-full bg-slate-100 px-3.5 py-1.5 text-sm sm:text-base font-semibold text-slate-800"
                    data-testid="badge-selection-summary"
                  >
                    <Users className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="flex flex-col leading-snug">
                      <span>{displayDate(checkIn)} → {displayDate(checkOut)}</span>
                      <span className="font-medium">{availability.nights} {t.nights} · {adults + children + infants} {adults + children + infants === 1 ? t.guest : t.guests}</span>
                    </span>
                  </span>

                  {marinResultsContext && (
                    <MarinPanel
                      context={marinResultsContext}
                      autoMessage="I need help choosing a room."
                      lang={lang}
                      currency={currency}
                    />
                  )}
                </div>

                {availableRooms.length === 0 && unavailableRooms.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-600" data-testid="status-no-rooms">
                    {t.noRooms}
                  </div>
                ) : (
                  <>
                  <div className="space-y-1 text-center">
                    {(() => {
                      const partyParts = [
                        effAdults > 0 ? `${effAdults} ${t.adults.toLowerCase()}` : null,
                        effChildren > 0 ? `${effChildren} ${t.children.toLowerCase()}` : null,
                        effInfants > 0 ? `${effInfants} ${t.infants.toLowerCase()}` : null,
                      ].filter(Boolean);
                      return (
                        <p className="inline-flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm font-medium text-amber-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-px flex-shrink-0 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {fmt(t.minUnitsNote, { party: partyParts.join(', '), n: minUnitsNeeded })}
                        </p>
                      );
                    })()}
                    <p className="text-sm font-medium text-slate-600 text-center" data-testid="text-amenities-note">{t.amenitiesNote}</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-[minmax(28rem,1fr)_22rem] gap-6 items-start">
                    <div className="space-y-4">
                    {availableRooms.map((room) => {
                      // Quote-derived total for this card: sum matching quote lines by
                      // roomId. Falls back to null (→ offer.total inside RoomCard) while
                      // no quote exists yet (qty=0 or loading). Primitive prop, so the
                      // memoized card only re-renders when its own total changes.
                      const qty = cart[room.roomId] || 0;
                      const quotedRoomTotal = qty > 0 && quote?.lines?.length
                        ? (quote.lines.filter((l) => l.roomId === room.roomId).reduce((s, l) => s + (l.lineTotal ?? 0), 0) || null)
                        : null;
                      return (
                        <RoomCard
                          key={room.roomId}
                          room={room}
                          displayName={translateRoomName(room.name)}
                          rateChoiceId={rateChoice[room.roomId]}
                          qty={qty}
                          canAddRoom={canAddRoom}
                          bedChoice={bedType[room.roomId]}
                          occupancy={roomOccupancy[room.roomId]}
                          quotedTotal={quotedRoomTotal}
                          effAdults={effAdults}
                          effChildren={effChildren}
                          effInfants={effInfants}
                          partyAdults={adults}
                          partyChildren={children}
                          partyInfants={infants}
                          showFx={showFx}
                          fxRate={showFx ? fxRatesForBase[currency] : null}
                          currency={currency}
                          freeCancellation={freeCancellation}
                          cancelDays={cancelDays}
                          t={t}
                          lang={lang}
                          detailQueryString={detailQueryString}
                          onQty={setRoomQty}
                          onRate={setRoomRate}
                          onOcc={setRoomOcc}
                          onBedType={setRoomBedType}
                        />
                      );
                    })}

                    {/* Sold-out rooms — shown with a "Find nearest available" CTA */}
                    {unavailableRooms.map((room) => {
                      const unitKey = getUnitKey(room.name);
                      const unitImg = unitKey ? IMG.units[unitKey] : null;
                      const unitDetailUrl = unitKey ? `/${unitKey}?${detailQueryString}` : null;
                      const displayName = translateRoomName(room.name);
                      const ns = nearestState[room.roomId] || {};
                      return (
                        <div
                          key={room.roomId}
                          className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 opacity-70"
                          data-testid={`card-room-unavailable-${room.roomId}`}
                        >
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-slate-500" data-testid={`text-room-unavailable-name-${room.roomId}`}>
                                {displayName}
                              </h3>
                              <span className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                                {t.soldOut}
                              </span>
                              <p className="text-sm text-slate-400 mt-1">
                                {`Not available for ${nights} ${nights === 1 ? t.night : t.nights}`}
                              </p>

                              {/* State: idle — show Find button */}
                              {!ns.loading && !ns.checkIn && !ns.error && (
                                <button
                                  type="button"
                                  onClick={() => handleFindNearest(room)}
                                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#9e4b13] hover:underline"
                                  data-testid={`button-find-nearest-${room.roomId}`}
                                >
                                  <CalendarCheck2 className="h-4 w-4" />
                                  Find nearest available dates
                                </button>
                              )}

                              {/* State: searching */}
                              {ns.loading && (
                                <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
                                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                                  <span>Searching for nearest available dates…</span>
                                </div>
                              )}

                              {/* State: not found */}
                              {!ns.loading && ns.error && (
                                <p className="mt-3 text-sm text-amber-700">{ns.error}</p>
                              )}

                              {/* State: found — show result + Search button */}
                              {!ns.loading && ns.checkIn && (
                                <div className="mt-3 flex flex-col gap-2">
                                  <p className="text-sm text-emerald-700 font-medium">
                                    Next available:<br />{displayDate(ns.checkIn)} → {displayDate(ns.checkOut)}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => searchWithDates(ns.checkIn, ns.checkOut)}
                                    className="self-start inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#9e4b13] hover:bg-[#8a4211] rounded-lg px-3 py-1.5 transition-colors"
                                    data-testid={`button-search-nearest-${room.roomId}`}
                                  >
                                    Search these dates →
                                  </button>
                                </div>
                              )}
                            </div>

                            {unitImg && (
                              <a
                                href={unitDetailUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 flex flex-col items-center gap-1 group"
                                data-testid={`link-unavail-details-${room.roomId}`}
                              >
                                <img
                                  src={unitImg}
                                  alt={displayName}
                                  loading="lazy"
                                  className="h-20 w-20 rounded-lg object-cover border border-slate-200 grayscale"
                                />
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#9e4b13] group-hover:underline">
                                  {t.details}
                                  <ExternalLink className="h-3 w-3" />
                                </span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    </div>

                    {/* Live combined cart summary (debounced /api/booking/quote) — sticky right rail on desktop */}
                    <div id="your-selection" className="lg:sticky" style={{ top: 'calc(var(--stack-h) + 1rem)' }}>
                    {totalRooms > 0 ? (
                      <div
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-3"
                        data-testid="card-cart-summary"
                      >
                        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                          {t.yourSelection}
                        </h2>
                        {totalRooms > 0 && totalRooms < minUnitsNeeded && (
                          <p className="text-sm text-amber-600" data-testid="text-more-units-needed">
                            {fmt(t.moreUnitsNeeded, { n: minUnitsNeeded - totalRooms })}
                          </p>
                        )}
                        {quoteError ? (
                          <>
                            {cartLines.map((cl, i) => {
                              const room = availableRooms?.find((r) => r.roomId === cl.roomId);
                              if (!room) return null;
                              const offer =
                                room.offers.find((o) => o.offerId === cl.offerId) ??
                                room.offers.find((o) => o.refundable) ??
                                room.offers[0];
                              if (!offer) return null;
                              return (
                                <div
                                  key={`${cl.roomId}-${i}`}
                                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                                  data-testid={`row-cart-${cl.roomId}-${i}`}
                                >
                                  <span className="text-slate-700">
                                    {cl.qty} × {translateRoomName(room.name)}
                                  </span>
                                  <span className="font-semibold text-slate-700">
                                    {showFx ? fxPrimary(offer.total * cl.qty) : money(offer.total * cl.qty, room.currency)}
                                  </span>
                                </div>
                              );
                            })}
                            <p className="text-sm text-red-600" data-testid="status-quote-error">{quoteError}</p>
                          </>
                        ) : quote ? (
                          <>
                            {quote.lines.map((line) => (
                              <div
                                key={`${line.roomId}-${line.offerId}-${line.adults}-${line.children}-${line.infants}`}
                                className="flex flex-wrap items-center justify-between gap-2 text-sm"
                                data-testid={`row-cart-${line.roomId}`}
                              >
                                <span className="text-slate-700">
                                  {line.qty} × {translateRoomName(line.roomName)}
                                  {rateLabelFor(line.roomId, line.offerId) && (
                                    <span className="block text-xs text-slate-400">{rateLabelFor(line.roomId, line.offerId)}</span>
                                  )}
                                  {line.adults !== undefined && (
                                    <span className="block text-xs text-slate-400">
                                      {[
                                        (line.adults ?? 0) > 0 ? `${line.adults} ${t.adults.toLowerCase()}` : null,
                                        (line.children ?? 0) > 0 ? `${line.children} ${t.children.toLowerCase()}` : null,
                                        (line.infants ?? 0) > 0 ? `${line.infants} ${t.infants.toLowerCase()}` : null,
                                      ].filter(Boolean).join(' · ')}
                                    </span>
                                  )}
                                </span>
                                <span className="font-semibold text-slate-700">
                                  {showFx ? fxPrimary(line.lineTotal) : money(line.lineTotal, quote.currency)}
                                </span>
                              </div>
                            ))}
                            {quote.discount > 0 && (
                              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                <span className="text-slate-500">
                                  {fmt(t.discountLabel, { code: quote.discountCodeApplied || discountCode.trim().toUpperCase() || voucherCode.trim().toUpperCase() })}
                                </span>
                                <span className="font-semibold text-emerald-600" data-testid="text-cart-discount">
                                  −{money(quote.discount, quote.currency)}
                                </span>
                              </div>
                            )}
                            {discountCode.trim() && (
                              quote.discountCodeApplied ? (
                                <p className="text-xs text-emerald-600" data-testid="text-discount-code-applied">
                                  {fmt(t.discountCodeApplied, { code: quote.discountCodeApplied })}
                                </p>
                              ) : quote.discountCodeError ? (
                                <p className="text-xs text-red-600" data-testid="text-discount-code-invalid">{quote.discountCodeError}</p>
                              ) : null
                            )}
                            {voucherCode.trim() && (
                              quote.voucherApplied ? (
                                <p className="text-xs text-emerald-600" data-testid="text-voucher-applied">
                                  Gift voucher {quote.voucherApplied} applied (−${quote.voucherAmountApplied?.toFixed(2)})
                                </p>
                              ) : quote.voucherError ? (
                                <p className="text-xs text-red-600" data-testid="text-voucher-invalid">{quote.voucherError}</p>
                              ) : null
                            )}
                            <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                              <span className="text-slate-500">{t.total}</span>
                              <span className="font-semibold text-slate-700" data-testid="text-cart-total">
                                {showFx ? fxPrimary(quote.total) : money(quote.total, quote.currency)}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                              <span className="text-slate-500">{fmt(t.depositNow, { pct: quote.depositPercent })}</span>
                              <span className="text-right">
                                <span className="font-bold text-[#9e4b13]" data-testid="text-cart-deposit">
                                  {showFx ? fxPrimary(quote.deposit) : money(quote.deposit, quote.currency)}
                                </span>
                                {showFx && (
                                  <span className="block text-xs text-slate-400">{money(quote.deposit, quote.currency)}</span>
                                )}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                              <span className="text-slate-500">{t.balanceOnArrival}</span>
                              <span className="text-right">
                                <span className="font-semibold text-slate-700" data-testid="text-cart-balance">
                                  {showFx ? fxPrimary(quote.balance) : money(quote.balance, quote.currency)}
                                </span>
                                {showFx && (
                                  <span className="block text-xs text-slate-400">{money(quote.balance, quote.currency)}</span>
                                )}
                              </span>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-slate-500 flex items-center gap-2" data-testid="status-quote-loading">
                            <Loader2 className="h-4 w-4 animate-spin" /> {t.updatingPrice}
                          </p>
                        )}
                        {showFx && (
                          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-xs text-slate-500" data-testid="text-fx-note">
                            <p className="font-semibold text-slate-600">{t.priceInfoHeader}</p>
                            <p className="flex items-start gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 mt-px shrink-0 text-green-500" /><span>{t.fxAllIn}</span></p>
                            <p className="flex items-start gap-1.5"><Info className="h-3.5 w-3.5 mt-px shrink-0 text-blue-400" /><span>{fmt(t.fxApproxDisplay, { currency })}</span></p>
                            <p className="flex items-start gap-1.5"><CreditCard className="h-3.5 w-3.5 mt-px shrink-0 text-slate-400" /><span>{t.fxBankFee}</span></p>
                            <p className="flex items-start gap-1.5"><MessageCircle className="h-3.5 w-3.5 mt-px shrink-0 text-slate-400" /><span>{t.fxAltPayment}</span></p>
                          </div>
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
                      </div>
                    ) : (
                      <div
                        className="hidden lg:block rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400"
                        data-testid="card-cart-summary-empty"
                      >
                        {t.selectRoomsToContinue}
                      </div>
                    )}
                    {/* Inline review proof — replaces the floating Trustindex
                        badge, which is hidden in the booking funnel. Reuses the
                        localized hero badge string (exists in all languages). */}
                    <div
                      className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center justify-center gap-3"
                      data-testid="card-review-proof"
                    >
                      <div className="flex items-center gap-0.5 text-yellow-500 shrink-0">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                        <span style={{ position: 'relative', display: 'inline-block', width: 14, height: 14 }}>
                          <Star size={14} fill="none" stroke="currentColor" strokeWidth={2} />
                          <span style={{ position: 'absolute', inset: 0, overflow: 'hidden', width: '50%' }}>
                            <Star size={14} fill="currentColor" stroke="none" />
                          </span>
                        </span>
                      </div>
                      <div className="min-w-0 text-xs text-slate-600 leading-snug">
                        {/* Fallback covers a missing/partial translation object and
                            the critical-UI loading placeholder ("..."). */}
                        <span className="font-medium text-slate-700">
                          {(ui?.hero?.badge && ui.hero.badge !== '...')
                            ? ui.hero.badge
                            : 'Guests loved comfort & value'}
                        </span>
                      </div>
                    </div>
                    </div>
                  </div>
                  </>
                )}

                {freeCancellation && (
                  <p className="text-xs text-slate-500 text-center pt-2">
                    {fmt(t.cancellationPolicy, { days: cancelDays })}
                  </p>
                )}
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
                    <span className="text-slate-600 text-sm">{displayDate(checkIn)} → {displayDate(checkOut)}</span>
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
                      <span className="text-slate-700">
                        {line.qty} × {translateRoomName(line.roomName)}
                        {rateLabelFor(line.roomId, line.offerId) && (
                          <span className="block text-xs text-slate-400">{rateLabelFor(line.roomId, line.offerId)}</span>
                        )}
                      </span>
                      <span className="font-semibold text-slate-700">
                        {showFx ? fxPrimary(line.lineTotal) : money(line.lineTotal, quote.currency)}
                      </span>
                    </div>
                  ))}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm border-t border-slate-100 pt-3">
                    <span className="text-slate-500">{t.total}</span>
                    <span className="font-semibold text-slate-700">
                      {showFx ? fxPrimary(quote.total) : money(quote.total, quote.currency)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-slate-500">{fmt(t.depositNow, { pct: quote.depositPercent })}</span>
                    <span className="text-right">
                      <span className="font-bold text-[#9e4b13]" data-testid="text-summary-deposit">
                        {showFx ? fxPrimary(quote.deposit) : money(quote.deposit, quote.currency)}
                      </span>
                      {showFx && (
                        <span className="block text-xs text-slate-400">{money(quote.deposit, quote.currency)}</span>
                      )}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-slate-500">{t.balanceOnArrival}</span>
                    <span className="text-right">
                      <span className="font-semibold text-slate-700">
                        {showFx ? fxPrimary(quote.balance) : money(quote.balance, quote.currency)}
                      </span>
                      {showFx && (
                        <span className="block text-xs text-slate-400">{money(quote.balance, quote.currency)}</span>
                      )}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    {/* Trustindex cert badge mounts here — adopted from the
                        floating widget Trustindex creates in <body> */}
                    <div ref={tiCertRef} className="shrink-0" />
                    {marinDetailsContext && (
                      <MarinPanel
                        context={marinDetailsContext}
                        autoMessage="I have a question before I pay."
                        lang={lang}
                        currency={currency}
                      />
                    )}
                  </div>
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
                        autoComplete="given-name"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">{t.lastName} *</span>
                      <input
                        type="text"
                        value={guest.lastName}
                        onChange={(e) => setGuest({ ...guest, lastName: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-[#9e4b13] focus:ring-1 focus:ring-[#9e4b13] outline-none"
                        data-testid="input-last-name"
                        autoComplete="family-name"
                        required
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
                        autoComplete="email"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">{t.phone} *</span>
                      <input
                        type="tel"
                        value={guest.phone}
                        onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-[#9e4b13] focus:ring-1 focus:ring-[#9e4b13] outline-none"
                        data-testid="input-phone"
                        autoComplete="tel"
                        required
                      />
                    </label>
                  </div>

                  <p className="text-xs text-slate-500" data-testid="text-terms-notice">
                    {(() => {
                      const [before, after] = String(t.termsAgree).split('{terms}');
                      return (
                        <>
                          {before}
                          <a
                            href={'https://devoceanlodge.com/legal/terms?newtab=1'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[#9e4b13] underline hover:text-[#854011]"
                            data-testid="link-terms"
                          >
                            {t.termsLink}
                          </a>
                          {after ?? ''}
                        </>
                      );
                    })()}
                  </p>

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

      {/* Minimal footer — legal links + copyright */}
      <footer className="bg-slate-900 text-slate-400 text-xs">
        <div className="max-w-5xl mx-auto px-4 pt-5 pb-16 flex flex-col items-center gap-2 text-center">
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1">
            {[
              { href: '/legal/privacy',  label: ui?.legal?.privacy  ?? 'Privacy Policy' },
              { href: '/legal/cookies',  label: ui?.legal?.cookies  ?? 'Cookie Policy' },
              { href: '/legal/terms',    label: ui?.legal?.terms    ?? 'Terms & Conditions' },
              { href: '/legal/GDPR',     label: ui?.legal?.gdpr     ?? 'GDPR Info' },
              { href: '/legal/CRIC',     label: ui?.legal?.cric     ?? 'Consumer Rights & Contact' },
            ].reduce((acc, { href, label }, i) => {
              if (i > 0) acc.push(<span key={`dot-${i}`} className="text-slate-400 select-none" aria-hidden="true">·</span>);
              acc.push(
                <a
                  key={href}
                  href={href + '?newtab=1'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-200 transition-colors whitespace-nowrap"
                >
                  {label}
                </a>
              );
              return acc;
            }, [])}
          </div>
          <p>© {new Date().getFullYear()} DEVOCEAN Lodge. {ui?.footer?.rights ?? 'All rights reserved.'}</p>
        </div>
      </footer>
    </main>
  );
}
