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
