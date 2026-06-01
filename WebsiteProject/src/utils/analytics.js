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
 * or first interaction before the 500 ms idle callback fires).
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
 * trackBookingSession
 *
 * Fire-and-forget POST to /api/track-session (Cloudflare Pages Function).
 * Stores the visitor's GA4 client_id so the render-automailer can attribute
 * confirmed Beds24 bookings back to the original session via Measurement
 * Protocol when the booking confirmation email arrives.
 *
 * On a first visit (Incognito or returning after cookie clearance), the "Book
 * Now" click IS the first interaction that triggers GTM to load. The _ga
 * cookie is written ~300-800 ms later. This function retries up to 3× at
 * 500 ms intervals (1.5 s total) before giving up, so the POST still fires
 * even when the cookie isn't ready at click time.
 *
 * Silent no-op when:
 *   • GA cookies are blocked by a privacy browser / strict consent settings
 *   • the network request fails for any reason
 *
 * @param {string} lang     - Two-letter locale code, e.g. "en"
 * @param {string} currency - Three-letter currency code, e.g. "USD"
 */
export function trackBookingSession(lang, currency) {
  function doPost(cid) {
    fetch('/api/track-session', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ cid, lang, currency }),
    }).catch(() => {});
  }

  const cid = getGA4ClientId();
  if (cid) {
    doPost(cid);
    return;
  }

  // Cookie not ready yet — GTM may still be initialising after this first
  // interaction. Retry up to 3× with 500 ms gaps (1.5 s total window).
  let attempts = 0;
  const retry = setInterval(() => {
    attempts++;
    const cid = getGA4ClientId();
    if (cid) {
      clearInterval(retry);
      doPost(cid);
    } else if (attempts >= 3) {
      clearInterval(retry);
    }
  }, 500);
}
