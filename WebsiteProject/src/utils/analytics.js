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
 * Safe to call on every "Book Now" click — silently no-ops when:
 *   • the _ga cookie hasn't been written yet (GTM still loading)
 *   • the user is on a privacy browser that blocks GA cookies
 *   • the network request fails for any reason
 *
 * @param {string} lang     - Two-letter locale code, e.g. "en"
 * @param {string} currency - Three-letter currency code, e.g. "USD"
 */
export function trackBookingSession(lang, currency) {
  const cid = getGA4ClientId();
  if (!cid) return;
  fetch('/api/track-session', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ cid, lang, currency }),
  }).catch(() => {});
}
