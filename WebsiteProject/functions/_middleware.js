/**
 * Cloudflare Pages Functions Middleware
 *
 * 1. Injects window.__CF_COUNTRY__ into HTML responses so the React app can
 *    default to the visitor's local currency without an extra API round-trip.
 *
 * 2. SPA fallback: when context.next() finds no static asset (404) and the
 *    browser is requesting HTML, serve index.html so React's router can handle
 *    the path (e.g. /admin, /why-ponta, /experiences/:key).
 *    We cannot rely on _redirects for this because the root middleware
 *    intercepts every request before _redirects is consulted.
 *
 * 3. Route-specific pre-render injection: for known SPA routes the universal
 *    homepage #static-content block is replaced with route-specific HTML so
 *    crawlers see correct title, meta description, canonical and H1 before
 *    JavaScript executes.  For all other non-homepage SPA routes the block is
 *    emptied to prevent homepage content polluting unrelated pages.
 */

const BASE_URL = 'https://devoceanlodge.com';

// ---------------------------------------------------------------------------
// Pre-render content per SPA route.
// Each entry supplies the correct initial-HTML signals for that URL.
// Keys are exact pathnames (no trailing slash).
// ---------------------------------------------------------------------------
const ROUTE_META = {

  '/book-direct': {
    title: 'Book Direct | DEVOCEAN Lodge — Ponta do Ouro, Mozambique',
    description: 'Book your stay at DEVOCEAN Lodge direct for the best available rate. No booking fees, no OTA markup. Instant confirmation. Safari tents, garden cottage and thatched chalet, Ponta do Ouro, Mozambique.',
    ogTitle: 'Book Direct | DEVOCEAN Lodge',
    ogDescription: 'Best-rate direct booking — no fees, instant confirmation. Nine units across four accommodation types in Ponta do Ouro, Mozambique.',
    staticHtml: `<div id="static-content">
<section>
  <h1>Book Your Stay Direct at DEVOCEAN Lodge</h1>
  <p>Book directly for the best available rate — no booking fees, no OTA markup. Instant confirmation by email. DEVOCEAN Lodge, Rua C Parcela 12, Ponta do Ouro, Mozambique.</p>
  <h2>Nine units across four accommodation types</h2>
  <ul>
    <li><strong>Safari Tent</strong> (four units) — Canvas tent on a raised platform. Twin or king bed, fan, shared hot-water ablutions, private terrace.</li>
    <li><strong>Comfort Tent</strong> (three units) — En-suite bathroom under thatched roof. Twin or king bed, private terrace.</li>
    <li><strong>Garden Cottage</strong> (one unit) — Queen bed, inverter air-conditioning, desk, private bathroom in thatched roundavel.</li>
    <li><strong>Thatched Chalet</strong> (one unit) — Twin or king bed, inverter air-conditioning, private bathroom, private terrace.</li>
  </ul>
  <p>All units include: breakfast daily, free WiFi, fresh linen, mosquito screening, private terrace.</p>
  <p>Check-in from 14:00 · Check-out by 10:00 · No 4×4 required · On-site parking</p>
  <p><a href="/book-direct">Check live availability and rates</a></p>
</section>
</div><!-- /static-content -->`,
  },

  '/why-ponta': {
    title: 'Why Ponta do Ouro? | DEVOCEAN Lodge — Mozambique',
    description: "Discover why Ponta do Ouro is Southern Africa's most rewarding destination: marine reserve, year-round dolphins, humpback whale watching, big-game fishing, surfing and uncrowded beaches.",
    ogTitle: 'Why Ponta do Ouro? | DEVOCEAN Lodge',
    ogDescription: 'Pristine beaches, world-class diving, humpback whale watching, ethical dolphin swims and Maputo National Park — all within reach of DEVOCEAN Lodge.',
    staticHtml: `<div id="static-content">
<section>
  <h1>Why Ponta do Ouro?</h1>
  <p>Ponta do Ouro is a small coastal village at the southern tip of Mozambique, 13 km from the Kosi Bay border with South Africa. It sits within the Ponta do Ouro Partial Marine Reserve — one of Southern Africa's most biodiverse marine protected areas.</p>
  <h2>Marine Wildlife</h2>
  <p>Year-round wild dolphin swims with 200+ resident Indo-Pacific bottlenose dolphins. Scuba diving on 20+ named sites from 8 m to 48 m depth. Humpback whale watching July–November. Whale sharks October–March. 19 shark species including bull, tiger and great hammerhead sharks.</p>
  <h2>Activities</h2>
  <p>Surfing a classic right-hand point break. Deep-sea fishing in the Mozambique Channel (black marlin, sailfish, yellowfin tuna). Game safaris to Maputo National Park — a UNESCO World Heritage Site with elephants, hippos, giraffes and zebras. Ocean seafaris, snorkelling, kayaking and beach walks to Ponta Malongane.</p>
  <h2>Getting There</h2>
  <p>13 km from the Kosi Bay border with South Africa. The approach road is largely tarred — no 4×4 required to reach the lodge or the main beach. 85 km south of Maputo via the Maputo–Katembe Bridge.</p>
  <h2>Stay at DEVOCEAN Lodge</h2>
  <p>DEVOCEAN Lodge sits in a lush tropical garden approximately 300 metres from the beach. Nine units across four accommodation types — safari tents, comfort tents, a garden cottage and a thatched chalet. Family-run, eco-friendly hospitality with breakfast included. <a href="/book-direct">Book direct for best rates.</a></p>
</section>
</div><!-- /static-content -->`,
  },

  '/gift-vouchers': {
    title: 'Gift Vouchers | DEVOCEAN Lodge — Ponta do Ouro, Mozambique',
    description: 'Give the gift of a stay at DEVOCEAN Lodge in Ponta do Ouro, Mozambique. Gift vouchers available for any accommodation type, valid for 12 months from purchase.',
    ogTitle: 'Gift Vouchers | DEVOCEAN Lodge',
    ogDescription: 'Give the perfect gift — a stay at DEVOCEAN Lodge in Ponta do Ouro, Mozambique. Redeemable for any accommodation type.',
    staticHtml: `<div id="static-content">
<section>
  <h1>Gift Vouchers — DEVOCEAN Lodge</h1>
  <p>Give the gift of a stay at DEVOCEAN Lodge in Ponta do Ouro, Mozambique. Gift vouchers are available for any accommodation type and any amount, and are valid for 12 months from the date of purchase. The perfect present for divers, surfers, nature lovers and anyone looking for an unforgettable beach escape in Southern Africa.</p>
  <p>DEVOCEAN Lodge, Rua C Parcela 12, Ponta do Ouro, Mozambique. <a href="/gift-vouchers">Buy a gift voucher.</a></p>
</section>
</div><!-- /static-content -->`,
  },

};

// Routes that get the static block emptied entirely (transactional / private).
const STRIP_STATIC = new Set([
  '/booking-confirmed',
  '/gift-confirmed',
  '/admin',
]);

// Matches the full #static-content block including the sentinel comment added
// to index.html.  The lazy quantifier stops at the first occurrence of the
// sentinel so nested HTML is safe.
const STATIC_CONTENT_RE = /<div id="static-content">[\s\S]*?<\/div><!-- \/static-content -->/;

// Empty replacement used for transactional routes and unknown SPA routes.
const EMPTY_STATIC = '<div id="static-content" aria-hidden="true"></div><!-- /static-content -->';

// ---------------------------------------------------------------------------

export async function onRequest(context) {
  try {
    const { pathname } = new URL(context.request.url);

    // Markdown Negotiation — serve llms.txt when agents request text/markdown
    // Satisfies the isitagentready.com "Markdown Negotiation" check.
    const acceptHeader = context.request.headers.get('accept') || '';
    const isAssetPath = /\.(js|css|json|png|jpg|jpeg|webp|svg|ico|woff2?|ttf|txt|xml|pdf)$/i.test(pathname);
    if (acceptHeader.includes('text/markdown') && !isAssetPath) {
      const llmsUrl = new URL('/llms.txt', context.request.url);
      const llmsResp = await fetch(llmsUrl.href);
      if (llmsResp.ok) {
        const body = await llmsResp.text();
        const tokenEstimate = Math.ceil(body.length / 4);
        return new Response(body, {
          status: 200,
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'X-Markdown-Tokens': String(tokenEstimate),
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    }

    // Legacy iframe booking pages → native direct-booking flow.
    if (pathname.startsWith('/book/')) {
      return Response.redirect(new URL('/book-direct', context.request.url).href, 301);
    }

    // HotelRunner legacy paths (e.g. /sv/pages/home) leaked into Google's index.
    if (pathname.split('/')[2] === 'pages') {
      return Response.redirect(new URL('/', context.request.url).href, 302);
    }

    let response = await context.next();

    // SPA fallback: no static file matched → serve index.html for React routing.
    if (response.status === 404) {
      const accept = context.request.headers.get('accept') || '';
      if (accept.includes('text/html')) {
        const rootUrl = new URL('/', context.request.url);
        response = await context.env.ASSETS.fetch(new Request(rootUrl, context.request));
      } else {
        return response;
      }
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return response;
    }

    const countryCode = context.request?.cf?.country || '';
    let html = await response.text();

    // ── 1. Inject CF country for client-side currency detection ──────────────
    const countryInjection = `<script>window.__CF_COUNTRY__="${countryCode}";</script>`;
    html = html.replace('<head>', `<head>${countryInjection}`);

    // ── 2. Route-specific pre-render injection ───────────────────────────────
    // Only applies when the SPA shell (index.html) is being served.
    // Static files (e.g. experiences/surfing.html) already have correct meta
    // and are never transformed here — they serve the correct content directly.
    if (pathname !== '/') {
      const route = ROUTE_META[pathname];

      if (route) {
        // Replace <title>
        html = html.replace(
          /<title>[^<]*<\/title>/,
          `<title>${route.title}</title>`
        );
        // Replace meta description (attribute spans two lines in index.html)
        html = html.replace(
          /<meta name="description"\s+content="[^"]*"/,
          `<meta name="description" content="${route.description}"`
        );
        // Replace canonical
        html = html.replace(
          /(<link rel="canonical" href=")[^"]*(")/,
          `$1${BASE_URL}${pathname}$2`
        );
        // Replace og:title
        html = html.replace(
          /(<meta property="og:title" content=")[^"]*(")/,
          `$1${route.ogTitle}$2`
        );
        // Replace og:description (also spans two lines)
        html = html.replace(
          /<meta property="og:description"\s+content="[^"]*"/,
          `<meta property="og:description" content="${route.ogDescription}"`
        );
        // Replace og:url
        html = html.replace(
          /(<meta property="og:url" content=")[^"]*(")/,
          `$1${BASE_URL}${pathname}$2`
        );
        // Replace #static-content block with route-specific HTML
        html = html.replace(STATIC_CONTENT_RE, route.staticHtml);

      } else {
        // Unknown SPA route (or transactional page) — strip the homepage block
        // so its content does not appear in search results for unrelated pages.
        html = html.replace(STATIC_CONTENT_RE, EMPTY_STATIC);
      }
    }

    // ────────────────────────────────────────────────────────────────────────

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    // Content-Signal (contentsignals.org / IETF draft):
    // ai-train=no  — disallow bulk model-training crawlers (robots.txt too)
    // search=yes   — allow all search engines
    // ai-input=yes — allow retrieval AI (Perplexity, ChatGPT, Claude)
    headers.set('Content-Signal', 'ai-train=no, search=yes, ai-input=yes');
    return new Response(html, { status: response.status, headers });

  } catch (err) {
    console.error('[middleware]', err);
    return new Response('Service Error', { status: 500 });
  }
}
