/**
 * GA4 Attribution Service
 *
 * Fires a server-side `purchase` event to GA4 Measurement Protocol after the
 * automailer confirms a new Beds24 booking. Bookings now complete natively on
 * the lodge's own /book-direct flow, so the visitor's GA4 client_id is captured
 * at checkout and stored on the direct_bookings row — letting us attribute the
 * confirmed booking to the exact session with real revenue + currency, fired
 * exactly once from the email-ingest path. The legacy lang+country session
 * heuristic remains a fallback for any booking with no matching direct-booking
 * row.
 *
 * Required env vars (set in the Render dashboard):
 *   GA4_MEASUREMENT_ID — e.g. "G-XXXXXXXXXX"
 *   GA4_API_SECRET     — GA4 > Admin > Data Streams > Measurement Protocol API secrets
 */

export interface AttributionEvent {
  /** Stable GA4 transaction_id (dedupes retries / multi-room bookings). */
  transactionId: string;
  /** ISO currency for the purchase value (defaults to USD). */
  currency?: string;
  /** Full reservation value (booking total). Omitted when unknown. */
  value?: number;
  /** Deposit actually charged now — sent as a custom param when known. */
  deposit?: number;
  /** Two-letter guest language, for reporting. */
  guestLanguage?: string;
  /** Beds24 group reference, for cross-referencing in GA4. */
  beds24GroupRef?: string;
  /** How this conversion was attributed (exact vs heuristic). */
  trackingMethod?: string;
}

/**
 * Returns true when a purchase event was actually sent to GA4, false when it
 * was skipped (missing config, fallback-only client id, or transport error).
 */
export async function fireGA4Conversion(
  clientId: string | null | undefined,
  evt: AttributionEvent,
): Promise<boolean> {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret     = process.env.GA4_API_SECRET;

  if (!measurementId || !apiSecret) {
    console.warn('[ga4-attribution] GA4_MEASUREMENT_ID or GA4_API_SECRET not set — skipping');
    return false;
  }

  // Fallback ids (prefix "fb.") are generated when GA4 cookies are blocked
  // (consent not given, strict-privacy browser). No real GA4 session exists for
  // them — skip the MP POST to avoid polluting GA4 with phantom events.
  if (!clientId || clientId.startsWith('fb.')) {
    console.log(`[ga4-attribution] Skipping MP for fallback/missing client id (txn ${evt.transactionId})`);
    return false;
  }

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

  const params: Record<string, unknown> = {
    transaction_id:  evt.transactionId,
    currency:        (evt.currency || 'USD').toUpperCase(),
    tracking_method: evt.trackingMethod || 'automailer_session_match',
  };
  if (typeof evt.value === 'number' && evt.value > 0) {
    params.value = Number(evt.value.toFixed(2));
  }
  if (typeof evt.deposit === 'number' && evt.deposit > 0) {
    params.deposit = Number(evt.deposit.toFixed(2));
  }
  if (evt.beds24GroupRef) params.beds24_group_ref = evt.beds24GroupRef;
  if (evt.guestLanguage)  params.guest_language   = evt.guestLanguage;

  const payload = {
    client_id: clientId,
    events: [{ name: 'purchase', params }],
  };

  try {
    const res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`[ga4-attribution] MP returned ${res.status} for txn ${evt.transactionId}`);
      return false;
    }
    console.log(
      `[ga4-attribution] Fired purchase ${evt.transactionId} ` +
      `(client ${clientId.slice(0, 8)}..., ${params.currency}${params.value ? ' ' + params.value : ''})`,
    );
    return true;
  } catch (err) {
    console.error(`[ga4-attribution] fetch failed for txn ${evt.transactionId}:`, err);
    return false;
  }
}
