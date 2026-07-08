import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { DateTime, Info } from 'luxon';

// Range date picker for /book-direct. Replaces the two native <input type="date">
// fields with a single trigger that opens a dual-month calendar (one month on
// mobile, two on desktop). Dates stay as 'YYYY-MM-DD' strings so the rest of the
// booking flow (availability/checkout payloads) is unchanged.

const BRAND = '#9e4b13';

function todayISO() {
  return DateTime.utc().toISODate();
}
function addMonths(view, n) {
  const dt = DateTime.utc(view.year, view.month, 1).plus({ months: n });
  return { year: dt.year, month: dt.month };
}
function monthKey(view) {
  return `${view.year}-${String(view.month).padStart(2, '0')}`;
}
// Monday-first grid of DateTime|null cells, padded to whole weeks.
function buildMonthCells(year, month) {
  const first = DateTime.utc(year, month, 1);
  const lead = first.weekday - 1; // weekday: 1=Mon .. 7=Sun
  const days = first.daysInMonth;
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(DateTime.utc(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
function diffNights(aISO, bISO) {
  if (!aISO || !bISO || bISO <= aISO) return 0;
  const a = DateTime.fromISO(aISO, { zone: 'utc' });
  const b = DateTime.fromISO(bISO, { zone: 'utc' });
  return Math.round(b.diff(a, 'days').days);
}
function addDayISO(iso, n) {
  return DateTime.fromISO(iso, { zone: 'utc' }).plus({ days: n }).toISODate();
}

// Rate-tier colouring: 5 subtle tints, blue (lowest) → red (peak). Slate text
// stays readable on all of them. Tiers are derived live from the Beds24 price
// map by RELATIVE comparison — there is no static season calendar.
const TIER_TINTS = ['#dbeafe', '#dcfce7', '#fef9c3', '#ffedd5', '#fee2e2'];
const TIER_KEYS = ['lowest', 'low', 'shoulder', 'high', 'peak'];
const FALLBACK_TIER_LABELS = {
  lowest: 'Lowest',
  low: 'Low',
  shoulder: 'Shoulder',
  high: 'High',
  peak: 'Peak',
};

function percentile(sortedAsc, q) {
  if (!sortedAsc.length) return 0;
  const idx = Math.min(sortedAsc.length - 1, Math.max(0, Math.round(q * (sortedAsc.length - 1))));
  return sortedAsc[idx];
}

// Map an ISO→price object to ISO→tier (0..4). Strategy:
//  • <2 distinct prices → no colouring (nothing to compare).
//  • ≤5 distinct prices → map each sorted distinct value onto the 5 tiers,
//    spread blue→red (matches a lodge's handful of seasonal rate levels).
//  • >5 distinct prices → trim outliers to p5..p95, then 5 equal-width bands,
//    clamping anything below/above into the lowest/highest tier.
// Thresholds span the WHOLE supplied window so a date keeps the same colour
// regardless of which months are currently visible.
function computeTierByDate(priceByDate) {
  const entries = Object.entries(priceByDate || {}).filter(
    ([, p]) => Number.isFinite(p) && p > 0,
  );
  if (!entries.length) return {};

  const prices = entries.map(([, p]) => p);
  const unique = Array.from(new Set(prices)).sort((a, b) => a - b);
  if (unique.length < 2) return {};

  const out = {};
  if (unique.length <= 5) {
    const tierForValue = new Map(
      unique.map((v, i) => [v, Math.round((i / (unique.length - 1)) * 4)]),
    );
    for (const [iso, p] of entries) out[iso] = tierForValue.get(p);
    return out;
  }

  const sorted = [...prices].sort((a, b) => a - b);
  const lo = percentile(sorted, 0.05);
  const hi = percentile(sorted, 0.95);
  const span = hi - lo;
  for (const [iso, p] of entries) {
    let tier = 0;
    if (span > 0) {
      tier = Math.floor(((p - lo) / span) * 5);
      if (tier < 0) tier = 0;
      if (tier > 4) tier = 4;
    }
    out[iso] = tier;
  }
  return out;
}

export default function DateRangePicker({
  lang = 'en-GB',
  checkIn,
  checkOut,
  onChange = () => {},
  t = {},
  className = '',
  priceByDate = {},
}) {
  const locale = lang || 'en';

  // Rate tiers, computed once over the whole window so colours stay stable as
  // the user navigates months. Fails soft: an empty/insufficient map → no tints.
  const tierByDate = useMemo(() => computeTierByDate(priceByDate), [priceByDate]);
  const hasTiers = useMemo(() => Object.keys(tierByDate).length > 0, [tierByDate]);
  const tierLabels = useMemo(() => {
    const src = t.rateTiers && typeof t.rateTiers === 'object' ? t.rateTiers : FALLBACK_TIER_LABELS;
    return TIER_KEYS.map((k) => src[k] || FALLBACK_TIER_LABELS[k]);
  }, [t]);
  const [open, setOpen] = useState(false);
  const [pendIn, setPendIn] = useState(checkIn);
  const [pendOut, setPendOut] = useState(checkOut);
  const [hover, setHover] = useState(null);
  const wrapRef = useRef(null);

  const today = todayISO();
  const initView = () => {
    const d = DateTime.fromISO(checkIn || today, { zone: 'utc' });
    return { year: d.year, month: d.month };
  };
  const [view, setView] = useState(initView);

  // Re-sync the in-progress selection from props whenever the panel opens.
  useEffect(() => {
    if (!open) return;
    setPendIn(checkIn);
    setPendOut(checkOut);
    setHover(null);
    setView(initView());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const weekdays = useMemo(() => {
    try {
      return Info.weekdays('short', { locale });
    } catch {
      return Info.weekdays('short');
    }
  }, [locale]);

  const fmtShort = (iso) =>
    iso ? DateTime.fromISO(iso, { zone: 'utc' }).setLocale(locale).toFormat('d LLL') : '';
  const fmtLong = (iso) =>
    iso ? DateTime.fromISO(iso, { zone: 'utc' }).setLocale(locale).toFormat('ccc d LLL yyyy') : '';

  const nights = diffNights(checkIn, checkOut);
  const pendNights = diffNights(pendIn, pendOut || hover);

  const nightsText = (n) => {
    if (n <= 0) return '';
    const word = n === 1 ? t.night || 'night' : t.nights || 'nights';
    return `${n} ${word}`;
  };

  function pickDay(iso) {
    if (!iso || iso < today) return;
    if (!pendIn || (pendIn && pendOut) || iso <= pendIn) {
      // Start (or restart) a range. Commit immediately with a default 1-night
      // checkout so a check-in-only selection still produces a valid range if
      // the user searches before picking a checkout (mirrors the old inputs,
      // which bumped checkout to checkIn+1). The second click sets the real one.
      setPendIn(iso);
      setPendOut(null);
      setHover(null);
      onChange(iso, addDayISO(iso, 1));
    } else {
      setPendOut(iso);
      onChange(pendIn, iso);
      setOpen(false);
    }
  }

  const rightView = addMonths(view, 1);
  const currentMonthKey = today.slice(0, 7);
  const canPrev = monthKey(view) > currentMonthKey;
  const maxMonthKey = DateTime.utc().plus({ months: 24 }).toFormat('yyyy-MM');
  const canNext = monthKey(view) < maxMonthKey;

  function renderMonth(v) {
    const cells = buildMonthCells(v.year, v.month);
    const title = DateTime.utc(v.year, v.month, 1).setLocale(locale).toFormat('LLLL yyyy');
    const end = pendOut || hover;
    return (
      <div className="w-full lg:w-[17rem]">
        <div className="text-center text-sm font-semibold text-slate-800 mb-2 capitalize">{title}</div>
        <div className="grid grid-cols-7 mb-1">
          {weekdays.map((w, i) => (
            <div key={i} className="text-center text-[11px] font-medium text-slate-400 py-1">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((dt, i) => {
            if (!dt) return <div key={i} className="aspect-square" />;
            const iso = dt.toISODate();
            const disabled = iso < today;
            const isStart = iso === pendIn;
            const isEnd = !!end && iso === end && end > pendIn;
            const inRange = pendIn && end && end > pendIn && iso > pendIn && iso < end;
            const isEndpoint = isStart || isEnd;
            const single = isStart && !end;
            const tier = disabled ? undefined : tierByDate[iso];

            // Precedence: disabled > endpoint > inRange > today(ring)+tint > tint > default.
            // Selection states always win; tier tints only apply to plain/today cells.
            let cls = 'text-slate-700 rounded-lg hover:bg-slate-100';
            let style;
            if (disabled) cls = 'text-slate-300 cursor-not-allowed';
            else if (isEndpoint) {
              cls = 'bg-[#9e4b13] text-white font-semibold';
              if (single) cls += ' rounded-lg';
              else if (isStart) cls += ' rounded-l-lg';
              else cls += ' rounded-r-lg';
            } else if (inRange) {
              cls = 'bg-[#fbeee5] text-slate-900';
            } else if (iso === today) {
              cls = 'text-slate-800 font-semibold rounded-lg ring-1 ring-inset ring-[#9e4b13]/40';
              if (tier != null) {
                style = { backgroundColor: TIER_TINTS[tier] };
                cls += ' hover:brightness-95';
              } else {
                cls += ' hover:bg-slate-100';
              }
            } else if (tier != null) {
              // Inline bg + brightness hover so the tint isn't overridden by a
              // hover:bg utility (which would replace the colour entirely).
              cls = 'text-slate-700 rounded-lg hover:brightness-95';
              style = { backgroundColor: TIER_TINTS[tier] };
            }

            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                style={style}
                onMouseEnter={() => {
                  if (pendIn && !pendOut && !disabled) setHover(iso);
                }}
                onClick={() => pickDay(iso)}
                className={`aspect-square w-full flex items-center justify-center text-sm transition-colors ${cls}`}
                data-testid={`day-${iso}`}
              >
                {dt.day}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-left flex items-center gap-2 focus:border-[#9e4b13] focus:ring-1 focus:ring-[#9e4b13] outline-none hover:border-slate-400 transition-colors"
        data-testid="button-daterange"
      >
        <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
        <span className="min-w-0 flex items-center gap-1.5 text-sm">
          <span className={`truncate ${checkIn ? 'text-slate-900' : 'text-slate-400'}`}>
            {checkIn ? fmtShort(checkIn) : t.checkIn || 'Check-in'}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className={`truncate ${checkOut ? 'text-slate-900' : 'text-slate-400'}`}>
            {checkOut ? fmtShort(checkOut) : t.checkOut || 'Check-out'}
          </span>
        </span>
        {nights > 0 && (
          <span className="ml-auto shrink-0 text-xs font-medium text-slate-500">{nightsText(nights)}</span>
        )}
      </button>

      <div
        className="absolute left-0 top-full mt-2 z-50 w-[calc(100vw-3rem)] max-w-[20rem] lg:w-auto lg:max-w-none bg-white border border-slate-200 rounded-2xl shadow-2xl p-4"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0)' : 'translateY(-4px)',
          pointerEvents: open ? 'auto' : 'none',
          visibility: open ? 'visible' : 'hidden',
          transition: 'opacity 150ms ease, transform 150ms ease',
        }}
        role="dialog"
        aria-label={t.selectDates || 'Dates'}
        data-testid="panel-daterange"
      >
        <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
          <div className="min-w-0 text-sm text-slate-700 flex items-center gap-2">
            <span className="truncate font-medium">{pendIn ? fmtLong(pendIn) : t.checkIn}</span>
            <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="truncate font-medium">{pendOut ? fmtLong(pendOut) : t.checkOut}</span>
          </div>
          {pendNights > 0 && (
            <span className="shrink-0 text-xs font-medium text-slate-500" data-testid="text-daterange-nights">
              {nightsText(pendNights)}
            </span>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => canPrev && setView((v) => addMonths(v, -1))}
            disabled={!canPrev}
            aria-label="Previous month"
            className="absolute left-0 top-0 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
            data-testid="button-daterange-prev"
            tabIndex={open ? 0 : -1}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => canNext && setView((v) => addMonths(v, 1))}
            disabled={!canNext}
            aria-label="Next month"
            className="absolute right-0 top-0 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
            data-testid="button-daterange-next"
            tabIndex={open ? 0 : -1}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {renderMonth(view)}
            <div className="hidden lg:block">{renderMonth(rightView)}</div>
          </div>
        </div>

        {hasTiers && (
          <div
            className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-3 gap-y-1.5"
            data-testid="legend-rate-tiers"
          >
            <span className="text-[11px] font-medium text-slate-500">
              {t.rateLegendTitle || 'Nightly rate'}
            </span>
            {TIER_TINTS.map((tint, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                <span
                  className="inline-block h-3 w-3 rounded-sm border border-black/5"
                  style={{ backgroundColor: tint }}
                />
                {tierLabels[i]}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
