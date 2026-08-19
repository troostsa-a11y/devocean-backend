/**
 * LanguagePicker — a compact button that opens a searchable locale panel.
 *
 * Default state: shows ~7 "pinned" common languages and a search hint.
 * While typing: filters all 22 supported locales live.
 *
 * Designed to sit inside the terra-cotta topbar, so the trigger button
 * inherits white text and uses a transparent background.
 */
import { useState, useRef, useEffect } from 'react';
import { Globe2, Search, Check } from 'lucide-react';
import { LOCALES } from '../i18n/localeCatalog.js';

// Languages shown before the user searches — covers the most common visitor
// profiles for a Mozambique ocean-lodge destination without scrolling.
const PINNED = new Set(['en-GB', 'pt-PT', 'de-DE', 'nl-NL', 'fr-FR', 'af-ZA', 'es-ES']);
const PINNED_LOCALES = LOCALES.filter((l) => PINNED.has(l.code));

function match(locale, q) {
  const lower = q.toLowerCase();
  return (
    locale.label.toLowerCase().includes(lower) ||
    locale.code.toLowerCase().includes(lower)
  );
}

function LocaleOption({ locale, current, onSelect }) {
  const active = locale.code === current;
  return (
    <button
      role="option"
      aria-selected={active}
      onClick={() => onSelect(locale.code)}
      className={`w-full text-left flex items-center justify-between px-3 py-1.5 transition-colors rounded
        ${active ? 'text-[#9e4b13] font-semibold bg-orange-50' : 'text-slate-700 hover:bg-slate-50'}`}
    >
      <span>{locale.label}</span>
      {active && <Check size={13} className="shrink-0 text-[#9e4b13]" />}
    </button>
  );
}

export default function LanguagePicker({ lang, onLangChange, className = '' }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const containerRef      = useRef(null);
  const searchRef         = useRef(null);

  const current = LOCALES.find((l) => l.code === lang) ?? LOCALES[0];

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onOut = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onOut);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onOut);
    };
  }, [open]);

  // Focus search when panel opens; reset query when closed
  useEffect(() => {
    if (open) {
      setQuery('');
      // rAF ensures the panel is in the DOM before we try to focus
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  const handleSelect = (code) => {
    setOpen(false);
    onLangChange(code);
  };

  const filtered = query ? LOCALES.filter((l) => match(l, query)) : null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* ── Trigger ──────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        className="flex items-center gap-1.5 border border-white/40 rounded px-2 py-1
                   text-white bg-transparent text-sm hover:bg-white/10 transition-colors
                   max-w-[48vw]"
      >
        <Globe2 size={14} className="shrink-0 opacity-80" />
        <span className="max-w-[130px] truncate">{current.label}</span>
        {/* chevron */}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
             className={`shrink-0 opacity-60 transition-transform ml-0.5 ${open ? 'rotate-180' : ''}`}
             aria-hidden="true">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* ── Panel ────────────────────────────────────────────────────── */}
      {open && (
        <div
          role="listbox"
          aria-label="Language"
          className="absolute left-0 top-[calc(100%+6px)] z-[300] w-56
                     bg-white rounded-xl shadow-xl border border-slate-200
                     py-1 text-slate-800 text-sm"
        >
          {/* Search box */}
          <div className="px-2 pt-1.5 pb-1">
            <label className="flex items-center gap-1.5 border border-slate-200 rounded-lg
                              px-2 py-1 bg-slate-50 focus-within:border-[#9e4b13]/60
                              focus-within:ring-2 focus-within:ring-[#9e4b13]/15">
              <Search size={12} className="text-slate-400 shrink-0" aria-hidden="true" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search languages…"
                aria-label="Search languages"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400 min-w-0"
              />
            </label>
          </div>

          {/* Results */}
          <div className="max-h-60 overflow-y-auto px-1">
            {filtered ? (
              /* Search active */
              filtered.length === 0
                ? <p className="px-3 py-2 text-slate-400 text-xs">No match</p>
                : filtered.map((locale) => (
                    <LocaleOption key={locale.code} locale={locale}
                                  current={lang} onSelect={handleSelect} />
                  ))
            ) : (
              /* Default: pinned languages + hint */
              <>
                <p className="px-3 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Common
                </p>
                {PINNED_LOCALES.map((locale) => (
                  <LocaleOption key={locale.code} locale={locale}
                                current={lang} onSelect={handleSelect} />
                ))}
                <p className="px-3 py-2 text-[11px] text-slate-400 border-t border-slate-100 mt-1">
                  Search to see all {LOCALES.length} languages
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
