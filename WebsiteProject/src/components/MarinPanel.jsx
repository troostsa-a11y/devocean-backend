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
    <span className="inline-flex items-center gap-3">
      <span className="text-sm text-gray-500">{label}</span>
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        className="inline-flex items-center justify-center rounded-full shadow-lg hover:brightness-110 hover:scale-105 transition-all duration-200"
        style={{ width: 48, height: 48, background: '#f97316', border: 'none', cursor: 'pointer', flexShrink: 0 }}
      >
        {/* Chat icon — matches the floating FAB */}
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
          fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    </span>
  );
}
