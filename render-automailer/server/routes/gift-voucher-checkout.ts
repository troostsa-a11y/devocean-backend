import type { Request, Response } from 'express';

const WINDOW_MS = 10 * 60 * 1000;
const PER_CUSTOMER_LIMIT = 5;
const GLOBAL_LIMIT = 100;
const MAX_KEYS = 2000;

// Centralized here, not in a Pages isolate: all public edge requests share the
// automailer process's limits. Counters are bounded and expire; rejected attempts
// do not create Stripe sessions or pending rows. Limits reset on service restart.
export function createVoucherCheckoutLimiter(now = Date.now) {
  const counters = new Map<string, { count: number; until: number }>();
  return (ip: string, email: string): number => {
    const time = now();
    for (const [key, counter] of counters) {
      if (counter.until <= time) counters.delete(key);
    }
    const keys = [`ip:${ip}`, `email:${email.toLowerCase()}`, 'global'];
    let retryMs = 0;
    for (const key of keys) {
      const counter = counters.get(key);
      const limit = key === 'global' ? GLOBAL_LIMIT : PER_CUSTOMER_LIMIT;
      if (counter && counter.count >= limit) {
        retryMs = Math.max(retryMs, counter.until - time);
      }
    }
    if (retryMs) return Math.ceil(retryMs / 1000);
    if (counters.size + keys.filter(key => !counters.has(key)).length > MAX_KEYS) {
      return Math.ceil(WINDOW_MS / 1000);
    }
    for (const key of keys) {
      const counter = counters.get(key) || { count: 0, until: time + WINDOW_MS };
      counter.count++;
      counters.set(key, counter);
    }
    return 0;
  };
}

interface CheckoutInput {
  amount: number;
  purchaserEmail: string;
  purchaserName: string;
  recipientName?: string;
  message?: string;
  locale?: string;
}

interface CheckoutDependencies {
  database: () => {
    createGiftVoucher: (input: any) => Promise<unknown>;
  } | undefined;
  createSession: (input: CheckoutInput) => Promise<{ url: string; stripeSessionId: string }>;
  limit?: ReturnType<typeof createVoucherCheckoutLimiter>;
}

export function createVoucherCheckoutHandler(deps: CheckoutDependencies) {
  const limit = deps.limit || createVoucherCheckoutLimiter();
  return async (req: Request, res: Response) => {
    res.set('Cache-Control', 'no-store');
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ error: 'Invalid voucher details.' });
    }
    const { amount, purchaserEmail, purchaserName, recipientName, message, locale } = body;
    if (typeof amount !== 'number' || ![20, 50, 100, 200, 500].includes(amount)) {
      return res.status(400).json({ error: 'Invalid amount. Choose $20, $50, $100, $200, or $500.' });
    }
    if (typeof purchaserEmail !== 'string' || purchaserEmail.length > 254 ||
        !/^[^\s@,;<>\r\n]+@[^\s@,;<>\r\n]+\.[^\s@,;<>\r\n]+$/.test(purchaserEmail.trim()) ||
        /[\r\n]/.test(purchaserEmail)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (typeof purchaserName !== 'string' || !purchaserName.trim() || purchaserName.length > 200 ||
        (recipientName != null && (typeof recipientName !== 'string' || recipientName.length > 200)) ||
        (message != null && (typeof message !== 'string' || message.length > 500))) {
      return res.status(400).json({ error: 'Provide a name (up to 200 characters) and an optional message (up to 500 characters).' });
    }
    if (locale != null && (typeof locale !== 'string' || locale.length > 35)) {
      return res.status(400).json({ error: 'Invalid checkout language.' });
    }
    const db = deps.database();
    if (!db) return res.status(503).json({ error: 'Voucher checkout temporarily unavailable.' });

    // This route MUST be mounted after requireAdminKey. Only the authenticated
    // Pages proxy supplies this dedicated header; missing identities share a
    // conservative bucket rather than bypassing limits.
    const ip = req.get('x-voucher-client-ip') || 'unknown';
    const retryAfter = limit(ip.slice(0, 64), purchaserEmail.trim());
    if (retryAfter) {
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Too many checkout attempts. Please try again later.' });
    }

    try {
      const input = {
        amount, purchaserEmail: purchaserEmail.trim(), purchaserName: purchaserName.trim(),
        recipientName: recipientName?.trim() || undefined,
        message: message?.trim() || undefined,
        ...(typeof locale === 'string' && locale.trim() ? { locale: locale.trim() } : {}),
      };
      const { url, stripeSessionId } = await deps.createSession(input);
      await db.createGiftVoucher({
        amountUsd: amount, purchaserEmail: input.purchaserEmail, purchaserName: input.purchaserName,
        recipientName: input.recipientName, message: input.message, stripeSessionId,
      });
      return res.json({ url });
    } catch (err: any) {
      console.error('[GIFT_VOUCHER] checkout error:', err.message);
      return res.status(500).json({ error: 'Could not create checkout. Please try again.' });
    }
  };
}
