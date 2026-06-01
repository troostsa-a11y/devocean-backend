/**
 * trackDeferredEvent
 *
 * For non-navigation events (scroll depth, dwell time, behavioral milestones)
 * that do not need to fire synchronously with a user gesture. Schedules the
 * dataLayer push during a browser idle period so it never blocks layout or
 * paint tasks on the main thread.
 *
 * Do NOT use for outbound CTA click handlers — those are fire-and-forget
 * microsecond pushes on target="_blank" links where deferral adds no benefit.
 *
 * @param {Object} payload - The dataLayer event object
 * @param {number} [idleTimeout=1000] - Max ms to wait before forcing execution
 */
export function trackDeferredEvent(payload, idleTimeout = 1000) {
  if (!window.dataLayer) return;
  if (window.requestIdleCallback) {
    requestIdleCallback(() => window.dataLayer.push(payload), { timeout: idleTimeout });
  } else {
    setTimeout(() => window.dataLayer.push(payload), 0);
  }
}

/**
 * getGA4ClientId
 *
 * Reads the GA4 client_id directly from the _ga cookie.
 * Format: GA1.1.XXXXXXXXXX.YYYYYYYYYY — the client_id is the last two
 * dot-separated segments: "XXXXXXXXXX.YYYYYYYYYY".
 *
 * Returns null when the cookie is absent (GTM not yet loaded, cookie blocked,
 * or first interaction before the deferred GTM fires).
 *
 * @returns {string|null}
 */
export function getGA4ClientId() {
  try {
    const match = document.cookie.match(/_ga=GA1\.[0-9]+\.([0-9]+\.[0-9]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * getOrCreateFallbackId
 *
 * Returns a session-scoped fallback ID when the _ga cookie is unavailable
 * (e.g. consent not yet given, strict privacy browser, Incognito first visit).
 * Stored in sessionStorage so it's consistent within the same browser tab.
 * Prefixed with "fb." so the automailer can distinguish it from a real GA4
 * client_id and skip the Measurement Protocol POST for those sessions.
 *
 * @returns {string}
 */
function getOrCreateFallbackId() {
  try {
    const key = '_devocean_sid';
    let sid = sessionStorage.getItem(key);
    if (!sid) {
      sid = Date.now() + '.' + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(key, sid);
    }
    return 'fb.' + sid;
  } catch {
    return 'fb.' + Date.now() + '.' + Math.random().toString(36).slice(2, 10);
  }
}

/**
 * trackBookingSession
 *
 * Fire-and-forget POST to /api/track-session (Cloudflare Pages Function).
 * Stores the visitor's GA4 client_id so the render-automailer can attribute
 * confirmed Beds24 bookings back to the original session via GA4 Measurement
 * Protocol when the booking confirmation email arrives.
 *
 * Resolution order:
 *   1. _ga cookie present immediately → POST with real GA4 client_id
 *   2. _ga not ready (GTM still initialising on first interaction) → retry
 *      up to 3× at 500 ms intervals; POST with real GA4 client_id once found
 *   3. _ga never appears (consent blocked / privacy browser) → POST with
 *      fallback session ID (prefixed "fb.") so the session is still recorded;
 *      the automailer skips the GA4 MP event for fallback IDs but still logs
 *      the booking session for internal attribution reporting
 *
 * @param {string} lang     - Two-letter locale code, e.g. "en"
 * @param {string} currency - Three-letter currency code, e.g. "USD"
 */
export function trackBookingSession(lang, currency) {
  function doPost(cid) {
    const isReal = !cid.startsWith('fb.');
    console.log('[DEVOCEAN] trackBookingSession →', isReal ? 'GA4 cid' : 'fallback cid', cid);
    fetch('/api/track-session', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ cid, lang, currency }),
    }).then(r => {
      console.log('[DEVOCEAN] track-session response:', r.status);
    }).catch(err => {
      console.warn('[DEVOCEAN] track-session failed:', err);
    });
  }

  const cid = getGA4ClientId();
  if (cid) {
    doPost(cid);
    return;
  }

  // _ga not ready — GTM may still be initialising after this first interaction.
  // Retry up to 3× with 500 ms gaps, then fall back to a session-scoped ID.
  let attempts = 0;
  const retry = setInterval(() => {
    attempts++;
    const cid = getGA4ClientId();
    if (cid) {
      clearInterval(retry);
      doPost(cid);
    } else if (attempts >= 3) {
      clearInterval(retry);
      doPost(getOrCreateFallbackId());
    }
  }, 500);
}
