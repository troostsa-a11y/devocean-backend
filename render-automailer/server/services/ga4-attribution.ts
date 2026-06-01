/**
 * GA4 Attribution Service
 *
 * Fires a server-side `purchase` event to GA4 Measurement Protocol after the
 * automailer confirms a new Beds24 booking.  This closes the conversion loop
 * that client-side tracking cannot close (the booking happens inside a
 * third-party Beds24 iframe on a sandboxed domain).
 *
 * Required env vars (set in Render dashboard):
 *   GA4_MEASUREMENT_ID  — e.g. "G-XXXXXXXXXX"
 *   GA4_API_SECRET      — created in GA4 > Admin > Data Streams > Measurement Protocol API secrets
 */

export interface AttributionBooking {
  groupRef:      string;
  guestLanguage: string;
}

export async function fireGA4Conversion(
  clientId: string,
  booking: AttributionBooking
): Promise<void> {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret     = process.env.GA4_API_SECRET;

  if (!measurementId || !apiSecret) {
    console.warn('[ga4-attribution] GA4_MEASUREMENT_ID or GA4_API_SECRET not set — skipping');
    return;
  }

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

  const payload = {
    client_id: clientId,
    events: [{
      name: 'purchase',
      params: {
        transaction_id:   booking.groupRef,
        currency:         'USD',
        tracking_method:  'automailer_session_match',
      },
    }],
  };

  try {
    const res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`[ga4-attribution] MP returned ${res.status} for booking ${booking.groupRef}`);
    } else {
      console.log(`[ga4-attribution] Fired purchase event for booking ${booking.groupRef} (client: ${clientId.slice(0, 8)}...)`);
    }
  } catch (err) {
    console.error(`[ga4-attribution] fetch failed for booking ${booking.groupRef}:`, err);
  }
}
