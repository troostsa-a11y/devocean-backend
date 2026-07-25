import { useEffect } from 'react';

/**
 * Triggers the shared widget-loader FAB with page-specific context.
 *
 * On /book-direct widget-loader.js is now allowed to run, so
 * window.devocean.ask() is available. This component:
 *   1. Renders a button that calls window.devocean.ask() with the context.
 *   2. Optionally auto-opens on mount (when autoOpen is true).
 *
 * Props:
 *   context     – pageContext string injected into Marin's system prompt
 *   autoMessage – the message automatically sent on behalf of the visitor
 *   label       – button label (default "Not sure? Ask Marin")
 *   autoOpen    – if true, open the panel automatically on mount
 */
export default function MarinPanel({ context, autoMessage, label = 'Not sure? Ask Marin', autoOpen = false }) {
  useEffect(() => {
    if (!autoOpen) return;
    // Give widget-loader a tick to initialise before firing.
    const t = setTimeout(() => {
      window.devocean?.ask({ pageContext: context, autoMessage });
    }, 300);
    return () => clearTimeout(t);
  }, [autoOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleClick() {
    window.devocean?.ask({ pageContext: context, autoMessage });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group btn-cta inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-gradient-to-r from-[#b65a1a] to-[#9e4b13] text-white shadow-2xl hover:shadow-[0_10px_40px_rgba(158,75,19,0.6)] hover:scale-105 transition-all duration-300 font-bold text-base"
      style={{ cursor: 'pointer', minWidth: '12rem' }}
    >
      {label}
    </button>
  );
}
