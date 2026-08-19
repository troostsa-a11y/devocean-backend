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
 *   label       – button label (default "Need help? Ask Marin")
 *   autoOpen    – if true, open the panel automatically on mount
 */
export default function MarinPanel({ context, autoMessage, label = 'Need help? Ask Marin', autoOpen = false, labelClassName = 'text-gray-500' }) {
  useEffect(() => {
    if (!autoOpen) return;
    // Give widget-loader a tick to initialise before firing.
    const t = setTimeout(() => {
      window.devocean?.ask({ pageContext: context, autoMessage });
    }, 300);
    return () => clearTimeout(t);
  }, [autoOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // When this panel unmounts (visitor navigates away from the booking/detail
  // page), tell widget-loader to discard the rich room/booking context it was
  // given.  Without this, a subsequent voice fallback on a different page
  // would receive stale room context via _lastPageContext.
  useEffect(() => {
    return () => {
      window.postMessage({ type: 'devocean:clearContext' }, window.location.origin);
    };
  }, []);

  function handleClick() {
    // Go directly to text chat with any available page context.
    // The fan-out (text vs voice choice) is reserved for the FAB itself;
    // inline "Ask Marin" controls should never launch voice unexpectedly.
    window.devocean?.ask({ pageContext: context, autoMessage });
  }

  // Compact inline pill — intentionally NOT styled like the global floating
  // orange FAB, so the site keeps a single primary chat launcher.
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className={`inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm hover:border-orange-400 hover:text-orange-600 transition-colors ${labelClassName}`}
      style={{ cursor: 'pointer' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <span>{label}</span>
    </button>
  );
}
