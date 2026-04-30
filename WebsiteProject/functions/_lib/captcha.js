/**
 * Shared CAPTCHA verification module for Cloudflare Pages Functions.
 *
 * Supports two providers:
 *   1. Google reCAPTCHA v3 (primary) — score-based, requires VITE_RECAPTCHA_SITE_KEY
 *      on the frontend and RECAPTCHA_SECRET_KEY on the backend.
 *   2. Cloudflare Turnstile (fallback) — works for users whose browsers/networks
 *      block Google domains (Brave shields, Firefox strict mode, certain VPNs,
 *      corporate firewalls). Requires VITE_TURNSTILE_SITE_KEY on the frontend
 *      and TURNSTILE_SECRET_KEY on the backend.
 *
 * Hostname validation is enforced for both providers so a stolen token cannot
 * be replayed from a different origin. *.pages.dev is allowed for Cloudflare
 * Pages preview deployments.
 */

const VALID_HOSTNAMES = new Set([
  'devoceanlodge.com',
  'www.devoceanlodge.com',
  'localhost',
  '127.0.0.1',
]);

// Only accept *.devoceanlodge.pages.dev (our own preview deploys), NOT
// any *.pages.dev subdomain — otherwise an attacker could mint a token on
// their own Pages project and replay it against ours.
const VALID_HOSTNAME_SUFFIXES = ['.devoceanlodge.pages.dev'];

export function isValidHostname(hostname) {
  if (!hostname) return false; // Fail closed when provider omits hostname.
  if (VALID_HOSTNAMES.has(hostname)) return true;
  if (hostname === 'devoceanlodge.pages.dev') return true;
  return VALID_HOSTNAME_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
}

/**
 * Verify a Google reCAPTCHA v3 token.
 * @param {string} token - Token from grecaptcha.execute()
 * @param {string} expectedAction - Action name set on the frontend
 * @param {string} secretKey - RECAPTCHA_SECRET_KEY from env
 * @param {number} minScore - Minimum acceptable score (0.0-1.0). Default 0.3.
 */
export async function verifyRecaptcha(token, expectedAction, secretKey, minScore = 0.3) {
  if (!secretKey) {
    return { success: false, error: 'reCAPTCHA not configured', code: 'config' };
  }
  if (!token) {
    return { success: false, error: 'Missing reCAPTCHA token', code: 'missing' };
  }

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
  });

  const data = await response.json();
  console.log(`[recaptcha] success=${data.success} action=${data.action} score=${data.score} hostname=${data.hostname}`);

  if (!data.success) {
    return { success: false, error: 'reCAPTCHA verification failed', code: 'failed', codes: data['error-codes'] };
  }
  if (data.action !== expectedAction) {
    return { success: false, error: 'reCAPTCHA action mismatch', code: 'action' };
  }
  if (!isValidHostname(data.hostname)) {
    return { success: false, error: 'reCAPTCHA hostname mismatch', code: 'hostname' };
  }
  if (typeof data.score === 'number' && data.score < minScore) {
    return { success: false, error: 'reCAPTCHA score too low', code: 'score', score: data.score };
  }

  return { success: true, provider: 'recaptcha', score: data.score };
}

/**
 * Verify a Cloudflare Turnstile token.
 * @param {string} token - Token from turnstile.execute() or widget callback
 * @param {string} expectedAction - Action label set on the frontend widget
 * @param {string} secretKey - TURNSTILE_SECRET_KEY from env
 * @param {string} [remoteip] - Optional client IP from CF-Connecting-IP header
 */
export async function verifyTurnstile(token, expectedAction, secretKey, remoteip) {
  if (!secretKey) {
    return { success: false, error: 'Turnstile not configured', code: 'config' };
  }
  if (!token) {
    return { success: false, error: 'Missing Turnstile token', code: 'missing' };
  }

  const body = new URLSearchParams({ secret: secretKey, response: token });
  if (remoteip) body.append('remoteip', remoteip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await response.json();
  console.log(`[turnstile] success=${data.success} hostname=${data.hostname} action=${data.action}`);

  if (!data.success) {
    return { success: false, error: 'Turnstile verification failed', code: 'failed', codes: data['error-codes'] };
  }
  if (!isValidHostname(data.hostname)) {
    return { success: false, error: 'Turnstile hostname mismatch', code: 'hostname' };
  }
  // Bind token to endpoint via action label (prevents cross-endpoint replay).
  // We always set an action on the frontend widget, so a missing or different
  // action in the response is suspicious — fail closed.
  if (expectedAction) {
    if (!data.action || data.action !== expectedAction) {
      return { success: false, error: 'Turnstile action mismatch', code: 'action' };
    }
  }

  return { success: true, provider: 'turnstile' };
}

/**
 * Verify whichever token the client provided. Prefers Turnstile (more reliable
 * across privacy browsers) when both are present.
 */
export async function verifyCaptcha({ recaptchaToken, turnstileToken, expectedAction, env, remoteip }) {
  if (turnstileToken) {
    const result = await verifyTurnstile(turnstileToken, expectedAction, env.TURNSTILE_SECRET_KEY, remoteip);
    if (result.success) return result;
    // If Turnstile is configured but verification failed (not a config issue),
    // don't silently fall back — that defeats the purpose of verification.
    if (result.code !== 'config') return result;
    // Turnstile not configured on backend — fall through to reCAPTCHA.
  }

  if (recaptchaToken) {
    return verifyRecaptcha(recaptchaToken, expectedAction, env.RECAPTCHA_SECRET_KEY);
  }

  return { success: false, error: 'No verification token provided', code: 'missing' };
}
