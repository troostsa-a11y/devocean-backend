import { useEffect, useMemo, useRef, useState } from 'react';
import { Globe2, Search, Check, ChevronDown } from 'lucide-react';
import { CC_TO_CURRENCY } from '../i18n/useLocale';
import { getBookingStrings } from '../i18n/bookingStrings';

// Searchable country → currency override.
// The pair shown on /book-direct ("NL · USD") is normally auto-derived from the
// visitor's IP country. This lets a guest pick a different country to force its
// national currency as the DISPLAY currency. It is display-only: Stripe always
// charges the Beds24 base currency regardless of this selection.
export default function CurrencyPicker({ lang = 'en-GB', currency, onSelect = () => {}, className = '' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const t = getBookingStrings(lang);
  const labelText = t.currencyLabel || 'Change display currency';
  const searchText = t.currencySearch || 'Search country or currency';
  const noMatchesText = t.currencyNoMatches || 'No matches';

  const langLabel = String(lang || 'en').split('-')[0].toUpperCase();

  // Localized country names via Intl.DisplayNames, paired with national currency.
  const options = useMemo(() => {
    let dn = null;
    try {
      dn = new Intl.DisplayNames([lang || 'en'], { type: 'region' });
    } catch {
      dn = null;
    }
    return Object.entries(CC_TO_CURRENCY)
      .map(([code, cur]) => {
        let name = code;
        try {
          name = (dn && dn.of(code)) || code;
        } catch {
          name = code;
        }
        return { code, currency: cur, name };
      })
      .sort((a, b) => a.name.localeCompare(b.name, lang || 'en'));
  }, [lang]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.code.toLowerCase().includes(q) ||
        o.currency.toLowerCase().includes(q)
    );
  }, [options, query]);

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

  // Focus the search field when the panel opens.
  useEffect(() => {
    if (!open) return undefined;
    const id = setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 0);
    return () => clearTimeout(id);
  }, [open]);

  const choose = (o) => {
    onSelect(o.currency, o.code);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={labelText}
        title={labelText}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
        data-testid="button-currency-picker"
      >
        <Globe2 className="h-4 w-4" />
        <span>{langLabel}{currency ? ` · ${currency}` : ''}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <div
        className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-[18rem] bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? 'scale(1)' : 'scale(0.97)',
          pointerEvents: open ? 'auto' : 'none',
          visibility: open ? 'visible' : 'hidden',
          transformOrigin: 'top right',
          transition: 'opacity 150ms ease, transform 150ms ease',
        }}
        role="listbox"
        aria-label={labelText}
        data-testid="menu-currency-picker"
      >
        <div className="p-2 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchText}
              className="w-full rounded-lg border border-slate-200 pl-8 pr-2 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#9e4b13]/30"
              data-testid="input-currency-search"
              tabIndex={open ? 0 : -1}
            />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-sm text-slate-400 text-center" data-testid="text-currency-empty">
              {noMatchesText}
            </p>
          ) : (
            filtered.map((o) => {
              const active = o.currency === currency;
              return (
                <button
                  key={o.code}
                  type="button"
                  onClick={() => choose(o)}
                  role="option"
                  aria-selected={active}
                  tabIndex={open ? 0 : -1}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-[#fffaf6] transition-colors ${active ? 'bg-[#fffaf6]' : ''}`}
                  data-testid={`option-currency-${o.code}`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {active ? (
                      <Check className="h-4 w-4 text-[#9e4b13] shrink-0" />
                    ) : (
                      <span className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate text-slate-700">{o.name}</span>
                  </span>
                  <span className="shrink-0 text-xs font-medium text-slate-500">{o.currency}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
