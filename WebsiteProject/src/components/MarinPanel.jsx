import { useState, useRef, useEffect } from 'react';

// The Marin text-chat iframe is served from the receptionist service.
// Matches vite.config.js MIA_URL and the widget-loader.js WIDGET_ORIGIN.
const MIA_BASE = 'https://mia-voice-receptionist.onrender.com';

/**
 * Restrained "Not sure? Ask Marin →" trigger + fixed chat panel.
 *
 * Props:
 *   context     – pageContext string injected into Marin's system prompt
 *   autoMessage – the message automatically sent on behalf of the visitor
 *   lang        – BCP-47 language tag (e.g. "en-GB")
 *   currency    – ISO 4217 display currency (e.g. "USD")
 */
export default function MarinPanel({ context, autoMessage, lang = 'en', currency }) {
  const [open, setOpen]           = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const frameReady                = useRef(false);
  const pendingAsk                = useRef(null);
  const frameRef                  = useRef(null);

  const baseLang = (lang || 'en').split('-')[0].toLowerCase();
  const embedUrl = `${MIA_BASE}/embed-text?lang=${encodeURIComponent(baseLang)}${currency ? `&currency=${encodeURIComponent(currency)}` : ''}`;

  // Listen for devocean:textEmbedReady from the iframe so we know when to
  // send the context payload.
  useEffect(() => {
    function onMessage(evt) {
      if (!evt.data || typeof evt.data !== 'object') return;
      if (evt.data.type === 'devocean:textEmbedReady') {
        frameReady.current = true;
        if (pendingAsk.current && frameRef.current) {
          try { frameRef.current.contentWindow.postMessage(pendingAsk.current, '*'); } catch (_) {}
          pendingAsk.current = null;
        }
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  function openPanel() {
    setOpen(true);
    // First open: load the iframe and schedule the context-primed message.
    if (!everOpened) {
      setEverOpened(true);
      if (context) {
        const payload = { type: 'devocean:ask', pageContext: context, autoMessage };
        if (frameReady.current && frameRef.current) {
          try { frameRef.current.contentWindow.postMessage(payload, '*'); } catch (_) {}
        } else {
          pendingAsk.current = payload;
        }
      }
    }
    // On subsequent opens the conversation continues — no new message is sent.
  }

  return (
    <>
      {/* Trigger — orange CTA button matching the hero */}
      <button
        type="button"
        onClick={openPanel}
        className="group btn-cta inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-gradient-to-r from-[#b65a1a] to-[#9e4b13] text-white shadow-2xl hover:shadow-[0_10px_40px_rgba(158,75,19,0.6)] hover:scale-105 transition-all duration-300 font-bold text-base border-2 border-white/20"
        style={{ border: 'none', cursor: 'pointer', minWidth: '12rem' }}
      >
        Not sure? Ask Marin
      </button>

      {/* Fixed panel — shown only after first open, visible/hidden via CSS */}
      {everOpened && (
        <div
          className={`fixed z-[9999] flex flex-col rounded-2xl shadow-2xl overflow-hidden
            bottom-[92px] right-5 w-[360px] max-w-[calc(100vw-40px)] h-[480px]
            ${open ? '' : 'hidden'}`}
          role="dialog"
          aria-label="Ask Marin"
          aria-modal="false"
        >
          {/* Header */}
          <div
            style={{ background: '#9e4b13' }}
            className="flex items-center justify-between px-3 py-2 shrink-0"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[11px] font-bold select-none">
                M
              </div>
              <span className="text-sm font-semibold text-white leading-none">Ask Marin</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors text-xl leading-none px-1"
              aria-label="Close Marin panel"
            >
              ×
            </button>
          </div>

          {/* Iframe */}
          <iframe
            ref={frameRef}
            src={embedUrl}
            title="Marin — DEVOCEAN Lodge receptionist"
            className="flex-1 border-none block bg-white"
          />
        </div>
      )}
    </>
  );
}
