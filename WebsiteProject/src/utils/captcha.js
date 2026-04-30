/**
 * Shared CAPTCHA utility with automatic fallback.
 *
 * Strategy:
 *   1. Try Google reCAPTCHA v3 first (silent, no UI).
 *   2. If that fails (script blocked, timeout, network error), fall back to
 *      Cloudflare Turnstile, which renders an invisible widget that survives
 *      privacy browsers, Brave shields, and networks that block Google.
 *   3. If both fail, throw — caller surfaces an error to the user.
 *
 * Returns: { provider: 'recaptcha' | 'turnstile' | 'dev', token: string }
 */

import { getRecaptchaToken } from './recaptcha';

let turnstileWidgetId = null;
let turnstileContainer = null;
// Mutable refs so the widget's persistent callbacks can route results to
// the currently-pending promise. Re-rendering on every call breaks Turnstile;
// we render once and re-execute the same widget on subsequent submissions.
let pendingResolve = null;
let pendingReject = null;
let pendingTimer = null;
let pendingAction = null;

function settleTurnstile(fn, value) {
  if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
  const cb = fn === 'resolve' ? pendingResolve : pendingReject;
  pendingResolve = null;
  pendingReject = null;
  pendingAction = null;
  if (cb) cb(value);
}

/**
 * Render an invisible Turnstile widget (lazy, render-once) and return a token.
 * On first call: creates a hidden container, loads the script, renders the
 * widget, and waits for the callback. On subsequent calls: resets and
 * re-executes the same widget — Turnstile rejects re-rendering an existing
 * container and second submissions silently fail otherwise.
 */
async function getTurnstileToken(action) {
  if (!window.TURNSTILE_SITE_KEY) {
    throw new Error('Turnstile site key not configured');
  }
  if (pendingResolve) {
    throw new Error('Turnstile request already in flight');
  }

  if (!window.turnstile) {
    if (!window.loadTurnstile) throw new Error('Turnstile loader missing');
    await window.loadTurnstile();
  }
  if (!window.turnstile) throw new Error('Turnstile failed to initialise');

  return new Promise((resolve, reject) => {
    pendingResolve = resolve;
    pendingReject = reject;
    pendingAction = action;
    pendingTimer = setTimeout(() => settleTurnstile('reject', new Error('Turnstile timeout')), 15000);

    try {
      if (turnstileWidgetId === null) {
        // First-time render: create container + widget with persistent callbacks.
        turnstileContainer = document.createElement('div');
        turnstileContainer.style.position = 'fixed';
        turnstileContainer.style.bottom = '-9999px';
        turnstileContainer.style.left = '-9999px';
        turnstileContainer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(turnstileContainer);

        turnstileWidgetId = window.turnstile.render(turnstileContainer, {
          sitekey: window.TURNSTILE_SITE_KEY,
          size: 'invisible',
          action: pendingAction,
          callback: (token) => settleTurnstile('resolve', token),
          'error-callback': () => settleTurnstile('reject', new Error('Turnstile error')),
          'timeout-callback': () => settleTurnstile('reject', new Error('Turnstile challenge expired')),
        });
      } else {
        // Subsequent submissions: reset + re-execute the existing widget.
        try { window.turnstile.reset(turnstileWidgetId); } catch (e) { /* ignore */ }
        try {
          window.turnstile.execute(turnstileWidgetId, { action: pendingAction });
        } catch (e) {
          settleTurnstile('reject', e instanceof Error ? e : new Error(String(e)));
        }
      }
    } catch (err) {
      settleTurnstile('reject', err instanceof Error ? err : new Error(String(err)));
    }
  });
}

/**
 * Get a CAPTCHA token for form submission with automatic fallback.
 * @param {string} action - reCAPTCHA action name (ignored by Turnstile)
 * @returns {Promise<{provider: string, token: string}>}
 */
export async function getCaptchaToken(action) {
  // Dev shortcut — recaptcha utility already handles localhost.
  try {
    const token = await getRecaptchaToken(action);
    if (token === 'test-token-dev') {
      return { provider: 'dev', token };
    }
    return { provider: 'recaptcha', token };
  } catch (recaptchaErr) {
    console.warn('[captcha] reCAPTCHA failed, attempting Turnstile fallback:', recaptchaErr.message);

    const friendlyError = new Error(
      'Unable to verify your submission. Please disable any tracker blockers for this site, or contact us directly via email or WhatsApp.'
    );

    // No Turnstile configured — surface the friendly message anyway so users
    // don't see raw technical errors like "reCAPTCHA script load timeout".
    if (!window.TURNSTILE_SITE_KEY) {
      throw friendlyError;
    }

    try {
      const token = await getTurnstileToken(action);
      console.info('[captcha] Turnstile fallback succeeded');
      return { provider: 'turnstile', token };
    } catch (turnstileErr) {
      console.error('[captcha] Both verifiers failed:', turnstileErr.message);
      throw friendlyError;
    }
  }
}
