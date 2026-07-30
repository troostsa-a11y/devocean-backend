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
 *
 * 4. Hreflang management:
 *    - Homepage (/): hreflang is baked into index.html — left untouched.
 *    - Experience pages (/experiences/:key): replaced with route-specific
 *      hreflang pointing to the correct experience URL for each language.
 *      All 22 supported languages are fully translated for these pages.
 *    - Booking/info SPA routes (ROUTE_META) and unknown routes: hreflang
 *      block is stripped — these pages have no genuine translated variants.
 */

const BASE_URL = 'https://devoceanlodge.com';

// ---------------------------------------------------------------------------
// Hreflang: language code → URL ?lang= parameter mapping
// Mirrors the homepage hreflang block in index.html exactly.
// Only include a language here if the experience pages are fully translated
// (title, meta description, H1, body copy, image labels).
// ---------------------------------------------------------------------------
const HREFLANG_LANGS = [
  { hreflang: 'pt-PT',   param: 'pt'    },
  { hreflang: 'pt-BR',   param: 'pt-BR' },
  { hreflang: 'de',      param: 'de'    },
  { hreflang: 'fr',      param: 'fr'    },
  { hreflang: 'es',      param: 'es'    },
  { hreflang: 'it',      param: 'it'    },
  { hreflang: 'nl',      param: 'nl'    },
  { hreflang: 'sv',      param: 'sv'    },
  { hreflang: 'pl',      param: 'pl'    },
  { hreflang: 'af',      param: 'af'    },
  { hreflang: 'zu',      param: 'zu'    },
  { hreflang: 'sw',      param: 'sw'    },
  { hreflang: 'ja',      param: 'ja'    },
  { hreflang: 'zh-Hans', param: 'zh'    },
  { hreflang: 'ru',      param: 'ru'    },
  { hreflang: 'ro',      param: 'ro'    },
  { hreflang: 'sr',      param: 'sr'    },
  { hreflang: 'hr',      param: 'hr'    },
  { hreflang: 'cs',      param: 'cs'    },
  { hreflang: 'tr',      param: 'tr'    },
];

/**
 * Build a complete hreflang block for a fully-translated page.
 * pageUrl must be the canonical (language-neutral) URL, e.g.
 * "https://devoceanlodge.com/experiences/surfing".
 */
function buildHreflang(pageUrl) {
  const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length));
  const lines = [
    `  <!-- hreflang alternate links — all 22 translated language variants -->`,
    `  <link rel="alternate" hreflang="x-default" href="${pageUrl}" />`,
    `  <link rel="alternate" hreflang="en"         href="${pageUrl}" />`,
  ];
  for (const { hreflang, param } of HREFLANG_LANGS) {
    lines.push(
      `  <link rel="alternate" hreflang="${pad(hreflang + '"', 11)} href="${pageUrl}?lang=${param}" />`
    );
  }
  lines.push(`  <!-- /hreflang -->`);
  return lines.join('\n');
}

// Matches the hreflang block from its opening comment through to the
// <!-- /hreflang --> sentinel added to index.html.
const HREFLANG_BLOCK_RE = /<!-- hreflang alternate links[\s\S]*?<!-- \/hreflang -->/;

// Empty replacement — strips the hreflang block for pages that have no
// genuine translated variants (booking flow, unknown SPA routes, etc.).
const EMPTY_HREFLANG = '<!-- /hreflang -->';

// ---------------------------------------------------------------------------
// Experience pages: all seven types, all 22 languages fully translated in
// both ExperienceDetailPage.jsx and seoMeta.js META_DESCRIPTIONS.
// ---------------------------------------------------------------------------
const EXPERIENCE_KEYS = new Set(['diving', 'dolphins', 'seafari', 'safari', 'fishing', 'surfing', 'lighthouse']);

const EXPERIENCE_META = {
  diving: {
    title:         'Scuba Diving | DEVOCEAN Lodge — Ponta do Ouro, Mozambique',
    description:   'Scuba diving in Ponta do Ouro, Mozambique. Explore coral reefs, encounter dolphins and marine life. PADI certified dive centre. Book your dive adventure.',
    ogTitle:       'Scuba Diving Ponta do Ouro | DEVOCEAN Lodge',
    ogDescription: 'Dive 20+ named sites — coral reefs, dolphins, whale sharks. PADI certified dive centre, Ponta do Ouro Marine Reserve.',
  },
  dolphins: {
    title:         'Swim with Dolphins | DEVOCEAN Lodge — Ponta do Ouro, Mozambique',
    description:   'Swim with wild dolphins in Ponta do Ouro, Mozambique. Ethical ocean safari encounters with bottlenose dolphins in their natural habitat.',
    ogTitle:       'Swim with Wild Dolphins | DEVOCEAN Lodge',
    ogDescription: 'Ethical ocean safaris with 200+ resident Indo-Pacific bottlenose dolphins in Ponta do Ouro Marine Reserve.',
  },
  seafari: {
    title:         'Ocean Seafari | DEVOCEAN Lodge — Ponta do Ouro, Mozambique',
    description:   'Ocean seafari in Ponta do Ouro, Mozambique. Whale watching, dolphins, and marine wildlife boat tours. Experience the Indian Ocean wonders.',
    ogTitle:       'Ocean Seafari Ponta do Ouro | DEVOCEAN Lodge',
    ogDescription: 'Whale watching, dolphins and marine wildlife boat tours in the Ponta do Ouro Marine Reserve, Mozambique.',
  },
  safari: {
    title:         'African Wildlife Safari | DEVOCEAN Lodge — Ponta do Ouro, Mozambique',
    description:   'African wildlife safari near Ponta do Ouro, Mozambique. Day trips to Tembe Elephant Park and Maputo Special Reserve. See elephants, lions, and more.',
    ogTitle:       'Wildlife Safari Near Ponta do Ouro | DEVOCEAN Lodge',
    ogDescription: 'Day safaris to Maputo National Park — elephants, hippos, giraffes, zebras — from DEVOCEAN Lodge, Ponta do Ouro.',
  },
  fishing: {
    title:         'Deep Sea Fishing | DEVOCEAN Lodge — Ponta do Ouro, Mozambique',
    description:   'Deep sea fishing charters in Ponta do Ouro, Mozambique. Catch marlin, sailfish, and tuna. Professional fishing boats and experienced crew.',
    ogTitle:       'Deep Sea Fishing Ponta do Ouro | DEVOCEAN Lodge',
    ogDescription: 'Black marlin, sailfish and yellowfin tuna fishing charters in the Mozambique Channel from Ponta do Ouro.',
  },
  surfing: {
    title:         'Surfing Ponta do Ouro | DEVOCEAN Lodge — Mozambique',
    description:   'Surfing lessons and rentals in Ponta do Ouro, Mozambique. Learn to surf on pristine beaches. Beginner-friendly waves and experienced instructors.',
    ogTitle:       'Surfing Ponta do Ouro | DEVOCEAN Lodge',
    ogDescription: 'Surf a classic right-hand point break in Ponta do Ouro. Lessons and board rentals for beginners and experienced surfers.',
  },
  lighthouse: {
    title:         'Ponta do Ouro Lighthouse | DEVOCEAN Lodge — Mozambique',
    description:   'Ponta do Ouro Lighthouse — historic landmark and scenic viewpoint in Southern Mozambique. Panoramic ocean views and photography spot.',
    ogTitle:       'Ponta do Ouro Lighthouse | DEVOCEAN Lodge',
    ogDescription: 'Historic lighthouse and panoramic viewpoint at the southern tip of Mozambique. Walking distance from DEVOCEAN Lodge.',
  },
};

// ---------------------------------------------------------------------------
// Pre-render content per known booking/info SPA route.
// Each entry supplies the correct initial-HTML signals for that URL.
// These routes serve English-only content to crawlers (no translated variants).
// ---------------------------------------------------------------------------
const ROUTE_META = {

  '/ponta-do-ouro': {
    title: 'Ponta do Ouro Travel Guide | DEVOCEAN Lodge — Mozambique',
    description: "Complete travel guide to Ponta do Ouro, Mozambique — pristine beaches, 1,200+ marine species, ethical dolphin swims, whale watching June–November, and proximity to Maputo National Park UNESCO site.",
    ogTitle: 'Ponta do Ouro Travel Guide | DEVOCEAN Lodge',
    ogDescription: 'Pristine beaches, world-class diving, humpback whale watching, ethical dolphin swims and Maputo National Park — all within reach of DEVOCEAN Lodge.',
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'TouristDestination', '@id': 'https://devoceanlodge.com/ponta-do-ouro#destination', name: 'Ponta do Ouro', description: 'Pristine coastal village at the southern tip of Mozambique. Marine reserve, resident dolphin pods, whale watching, scuba diving and proximity to Maputo National Park.', url: 'https://devoceanlodge.com/ponta-do-ouro', touristType: ['Scuba Diver', 'Wildlife Enthusiast', 'Beach Traveller', 'Adventure Traveller'], geo: { '@type': 'GeoCoordinates', latitude: -26.837, longitude: 32.893 } },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [ { '@type': 'Question', name: 'How do I get to Ponta do Ouro?', acceptedAnswer: { '@type': 'Answer', text: 'The most common route is via the Kosi Bay border crossing from South Africa — 13 km from the village. From Maputo it is approximately 120 km via the Maputo–Katembe Bridge and the coastal road.' } }, { '@type': 'Question', name: 'When is the best time to visit Ponta do Ouro?', acceptedAnswer: { '@type': 'Answer', text: 'April to November is the dry season with calmer seas and best diving visibility. August to October adds humpback whale watching. Dolphins are present year-round.' } }, { '@type': 'Question', name: 'Is Ponta do Ouro suitable for families?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The village is quiet and safe. DEVOCEAN Lodge accommodates families across all unit types. Dolphin swims, snorkelling and beach walks are family-friendly activities.' } }, { '@type': 'Question', name: 'What currency is used in Ponta do Ouro?', acceptedAnswer: { '@type': 'Answer', text: 'The local currency is the Mozambican Metical (MZN). South African Rand is widely accepted. USD and EUR can be exchanged locally. Card payments are limited — bring cash.' } } ] },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'DEVOCEAN Lodge', item: 'https://devoceanlodge.com/' }, { '@type': 'ListItem', position: 2, name: 'Ponta do Ouro Travel Guide', item: 'https://devoceanlodge.com/ponta-do-ouro' } ] },
    ],
    staticHtml: `<div id="static-content">
<section>
  <h1>Why Ponta do Ouro?</h1>
  <p>A pristine coastal village at the southern tip of Mozambique, 13 km from the Kosi Bay border with South Africa. Gateway to 1,200+ marine species, ethical dolphin swims, humpback whale watching and the UNESCO-listed Maputo National Park.</p>
  <h2>World-Class Marine Adventures</h2>
  <p>The Ponta do Ouro Partial Marine Reserve is one of Southern Africa's most biodiverse marine protected areas. Year-round resident bottlenose dolphin pods, scuba diving from 10 m to 47 m, bull sharks, hammerheads, manta rays and humpback whales June–November.</p>
  <h2>Wildlife Reserves at the Doorstep</h2>
  <p>Maputo National Park (UNESCO) is 30 km north — elephants, hippos, giraffes, zebras and 526+ bird species. iSimangaliso Wetland Park is 25 minutes away across the border.</p>
  <p><a href="/book-direct">Book direct at DEVOCEAN Lodge</a> · <a href="/ponta-do-ouro-accommodation">View accommodation</a></p>
</section>
</div><!-- /static-content -->`,
  },

  '/getting-to-ponta-do-ouro': {
    title: 'Getting to Ponta do Ouro from Kosi Bay and Maputo | Travel Guide',
    description: 'Complete guide to getting to Ponta do Ouro, Mozambique — via Kosi Bay border (13 km), from Maputo (120 km), by transfer or public transport. Border hours, road conditions and rental car rules explained.',
    ogTitle: 'Getting to Ponta do Ouro | DEVOCEAN Lodge',
    ogDescription: 'Via Kosi Bay border (13 km), from Maputo by road or transfer (120 km), or by public chapa. No 4×4 required to reach DEVOCEAN Lodge.',
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [ { '@type': 'Question', name: 'Do I need a visa to enter Mozambique at the Kosi Bay border?', acceptedAnswer: { '@type': 'Answer', text: 'Entry requirements depend on your nationality. Mozambique offers an online eVisa as well as visa-on-arrival at some crossings. Check the official Mozambique eVisa portal before travel.' } }, { '@type': 'Question', name: 'What are the Kosi Bay border opening hours?', acceptedAnswer: { '@type': 'Answer', text: 'The Kosi Bay border is listed as open 08:00–17:00 daily. Always verify current hours before travel. Allow time to clear before 17:00 on busy days.' } }, { '@type': 'Question', name: 'Can I take a normal car to Ponta do Ouro?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The main route from Kosi Bay border to the village is navigable by standard vehicles. DEVOCEAN Lodge is on a tarred road. No 4×4 required.' } }, { '@type': 'Question', name: 'Is there public transport from the Kosi Bay border to Ponta do Ouro?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Shared chapas run between the border and village throughout the day, departing when full. Journey takes 20–30 minutes. DEVOCEAN Lodge is 150 m from the village transport terminal.' } } ] },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'DEVOCEAN Lodge', item: 'https://devoceanlodge.com/' }, { '@type': 'ListItem', position: 2, name: 'Getting to Ponta do Ouro', item: 'https://devoceanlodge.com/getting-to-ponta-do-ouro' } ] },
    ],
    staticHtml: `<div id="static-content">
<section>
  <h1>Getting to Ponta do Ouro from Kosi Bay and Maputo</h1>
  <p>The most common route is via the Kosi Bay border crossing from South Africa — 13 km from the village on a largely tarred road. From Maputo it is approximately 120 km via the Maputo–Katembe Bridge. No 4×4 required to reach DEVOCEAN Lodge.</p>
  <h2>From South Africa via the Kosi Bay Border</h2>
  <p>The Kosi Bay border is open 08:00–17:00 daily. Shared chapas run from the border to the village throughout the day (20–30 min). DEVOCEAN Lodge is 150 m from the village transport terminal. Private transfers can be arranged.</p>
  <h2>From Maputo by Road or Transfer</h2>
  <p>Cross the Maputo–Katembe Bridge and follow the coastal road south. Allow approximately 2 hours. A standard car is sufficient.</p>
  <p><a href="/book-direct">Book direct</a> · <a href="/ponta-do-ouro-without-4x4">Can I visit without a 4×4?</a></p>
</section>
</div><!-- /static-content -->`,
  },

  '/ponta-do-ouro-without-4x4': {
    title: 'Visiting Ponta do Ouro Without a 4×4 | Complete Guide | DEVOCEAN Lodge',
    description: 'Can you visit Ponta do Ouro without a 4×4? Yes. The main village road is tarred and a standard car gets you to DEVOCEAN Lodge. What is sandy, what is tarred, and how to get here without your own vehicle.',
    ogTitle: 'Visiting Ponta do Ouro Without a 4×4 | DEVOCEAN Lodge',
    ogDescription: 'Yes, you can visit without a 4×4. DEVOCEAN Lodge is on a navigable road. The main beach is walkable. Chapas and bakkie taxis cover everything else.',
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [ { '@type': 'Question', name: 'Is the road from the Kosi Bay border fully tarred?', acceptedAnswer: { '@type': 'Answer', text: 'It is largely tarred with some short sandy sections that can worsen after heavy rain. Under normal dry-season conditions (April–November), a standard sedan handles it comfortably.' } }, { '@type': 'Question', name: 'Can I reach the beach without a 4×4?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The main Ponta do Ouro beach is walkable from the lodge and from the village centre. No vehicle is needed to reach the beach on foot.' } }, { '@type': 'Question', name: 'Can I visit Malongane without a 4×4?', acceptedAnswer: { '@type': 'Answer', text: 'Malongane is reached via deep coastal sand — a 4×4 is required to drive there. However, local bakkie taxis run the route and are an inexpensive way to visit without your own 4×4.' } } ] },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'DEVOCEAN Lodge', item: 'https://devoceanlodge.com/' }, { '@type': 'ListItem', position: 2, name: 'Visiting Without a 4×4', item: 'https://devoceanlodge.com/ponta-do-ouro-without-4x4' } ] },
    ],
    staticHtml: `<div id="static-content">
<section>
  <h1>Visiting Ponta do Ouro Without a 4×4</h1>
  <p>Yes, you can visit Ponta do Ouro without a 4×4. DEVOCEAN Lodge is on a navigable road in the village centre. A standard car or public transport handles the full journey from the Kosi Bay border. The main beach is walkable from the lodge.</p>
  <h2>Road Conditions</h2>
  <p>The 13 km from the Kosi Bay border to the village is largely tarred, with a few short sandy sections that a standard sedan handles comfortably in dry conditions (April–November). Malongane requires a 4×4 to drive, but local bakkie taxis run the route daily.</p>
  <p><a href="/book-direct">Book direct</a> · <a href="/getting-to-ponta-do-ouro">Full getting-here guide</a></p>
</section>
</div><!-- /static-content -->`,
  },

  '/ponta-do-ouro-accommodation': {
    title: 'Accommodation in Ponta do Ouro Near the Beach | DEVOCEAN Lodge',
    description: 'DEVOCEAN Lodge sits in a lush tropical garden approximately 300 metres from the beach in Ponta do Ouro. Nine units across four accommodation types — safari tents, comfort tents, a garden cottage and a thatched chalet.',
    ogTitle: 'Accommodation in Ponta do Ouro | DEVOCEAN Lodge',
    ogDescription: 'Nine units across four types, 300 m from the beach. Safari tents, comfort tents, garden cottage and thatched chalet. Breakfast included. Book direct for best rates.',
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'LodgingBusiness', '@id': 'https://devoceanlodge.com/#lodge', name: 'DEVOCEAN Lodge', url: 'https://devoceanlodge.com', description: 'Family-run eco-lodge in Ponta do Ouro, Southern Mozambique. Nine units across four accommodation types set in a lush tropical garden approximately 300 metres from the beach.', address: { '@type': 'PostalAddress', addressLocality: 'Ponta do Ouro', addressCountry: 'MZ' }, amenityFeature: [ { '@type': 'LocationFeatureSpecification', name: 'Breakfast included', value: true }, { '@type': 'LocationFeatureSpecification', name: 'Free WiFi', value: true }, { '@type': 'LocationFeatureSpecification', name: 'On-site parking', value: true }, { '@type': 'LocationFeatureSpecification', name: 'No 4×4 required', value: true } ] },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [ { '@type': 'Question', name: 'How far is DEVOCEAN Lodge from the beach?', acceptedAnswer: { '@type': 'Answer', text: "The lodge is approximately 300 metres from the main beach — a few minutes' walk through the village streets." } }, { '@type': 'Question', name: 'Do I need a 4×4 to get to DEVOCEAN Lodge?', acceptedAnswer: { '@type': 'Answer', text: 'No. DEVOCEAN Lodge is on a navigable road in the village centre. A standard car handles the route from the Kosi Bay border comfortably.' } } ] },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'DEVOCEAN Lodge', item: 'https://devoceanlodge.com/' }, { '@type': 'ListItem', position: 2, name: 'Accommodation in Ponta do Ouro', item: 'https://devoceanlodge.com/ponta-do-ouro-accommodation' } ] },
    ],
    staticHtml: `<div id="static-content">
<section>
  <h1>Accommodation in Ponta do Ouro Near the Beach</h1>
  <p>DEVOCEAN Lodge is set in a lush tropical garden in the heart of Ponta do Ouro village, approximately 300 metres from the main beach. Nine units across four accommodation types — four Safari Tents, three Comfort Tents, a Garden Cottage and a Thatched Chalet.</p>
  <ul>
    <li><strong>Safari Tent</strong> (4 units) — Canvas tent on a raised platform. King or Twin, fan, shared bathroom, private terrace.</li>
    <li><strong>Comfort Safari Tent</strong> (3 units) — Canvas tent with private en-suite thatched bathroom. King or Twin, private terrace.</li>
    <li><strong>Garden Cottage</strong> (1 unit) — Roundavel with AC inverter, desk, dining table, private bathroom.</li>
    <li><strong>Thatched Chalet</strong> (1 unit) — Secluded, AC inverter, private bathroom, private terrace.</li>
  </ul>
  <p>All units include breakfast daily, free WiFi, fresh linen and mosquito screening. <a href="/book-direct">Check live availability and book direct.</a></p>
</section>
</div><!-- /static-content -->`,
  },

  '/safari-tents-ponta-do-ouro': {
    title: 'Safari Tents in Ponta do Ouro, Mozambique | DEVOCEAN Lodge',
    description: "DEVOCEAN Lodge offers two safari tents in Ponta do Ouro — a classic canvas tent on a raised platform and a more private Comfort Tent with en-suite bathroom. Breakfast included. Book direct.",
    ogTitle: 'Safari Tents in Ponta do Ouro | DEVOCEAN Lodge',
    ogDescription: 'Two canvas safari tents on raised wooden platforms in a tropical garden. Shared or en-suite bathroom, fan, private terrace. A few minutes from the Indian Ocean.',
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [ { '@type': 'Question', name: 'Is it real camping or glamping?', acceptedAnswer: { '@type': 'Answer', text: 'Somewhere in between. Genuine canvas tent on a wooden platform — so the sounds, feel and connection to the outdoors are real. But with a proper bed, fresh linen, a private terrace and a well-maintained garden. The Comfort Tent adds an en-suite bathroom.' } }, { '@type': 'Question', name: 'What is the bathroom situation for the standard Safari Tent?', acceptedAnswer: { '@type': 'Answer', text: 'The standard Safari Tent uses a shared bathroom — clean, maintained, and used only by safari tent guests. The Comfort Safari Tent has its own private en-suite bathroom attached to the rear of the tent.' } }, { '@type': 'Question', name: 'Is Ponta do Ouro a malaria area?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Standard precautions apply: consult your doctor about prophylaxis before travel, and bring DEET insect repellent. The tents are fitted with mosquito-mesh windows and doors.' } } ] },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'DEVOCEAN Lodge', item: 'https://devoceanlodge.com/' }, { '@type': 'ListItem', position: 2, name: 'Safari Tents in Ponta do Ouro', item: 'https://devoceanlodge.com/safari-tents-ponta-do-ouro' } ] },
    ],
    staticHtml: `<div id="static-content">
<section>
  <h1>Safari Tents in Ponta do Ouro</h1>
  <p>DEVOCEAN Lodge offers two safari tent options — a classic canvas Safari Tent on a raised 3×6 m wooden platform, and a Comfort Safari Tent with a private en-suite thatched bathroom. Both are a few minutes' walk from the Indian Ocean and the dive boats.</p>
  <h2>Safari Tent</h2>
  <p>12 m² canvas tent. King or Twin configuration, strong fan, private wooden terrace, mosquito mesh. Shared clean bathroom used only by safari tent guests.</p>
  <h2>Comfort Safari Tent</h2>
  <p>Same canvas experience with a private en-suite thatched bathroom. King or Twin, private terrace, fan, mosquito mesh.</p>
  <p>Breakfast included in both. Ponta do Ouro is a malaria area — bring DEET and consult your doctor about prophylaxis. <a href="/book-direct">Check availability for both tents.</a></p>
</section>
</div><!-- /static-content -->`,
  },

  '/diving-dolphin-accommodation': {
    title: 'Accommodation for Diving and Dolphin Swims in Ponta do Ouro | DEVOCEAN Lodge',
    description: "DEVOCEAN Lodge is a few minutes from Ponta do Ouro's dive operators and dolphin swim centre. Dive sites 10 m–47 m, resident dolphin pods year-round, whale watching June–November.",
    ogTitle: 'Dive Base Accommodation in Ponta do Ouro | DEVOCEAN Lodge',
    ogDescription: 'Walk to the dive boats, dolphin swims and whale-watching trips. Gear rinse on-site. Four accommodation types. Breakfast included. Book direct.',
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [ { '@type': 'Question', name: 'Which dive operators are closest to DEVOCEAN Lodge?', acceptedAnswer: { '@type': 'Answer', text: 'Multiple PADI operators are based in the village, all within a short walk. Ask our team for current operator recommendations when you book.' } }, { '@type': 'Question', name: 'What time do dive trips depart?', acceptedAnswer: { '@type': 'Answer', text: 'Most operators run two dives per day. The first dive typically departs around 07:30–08:00, with the second following mid-morning. Dolphin swims leave at a similar time.' } }, { '@type': 'Question', name: 'Are dolphin swims suitable for non-divers?', acceptedAnswer: { '@type': 'Answer', text: "Yes. Dolphin swims are conducted while snorkelling in shallow water at Crèche reef. You don't need to be a certified diver — confident swimmers are welcome." } }, { '@type': 'Question', name: 'What is the best time of year for diving in Ponta do Ouro?', acceptedAnswer: { '@type': 'Answer', text: 'April–November offers the best visibility (15–30 m). August–October adds whale season. December–March brings warmer water but occasionally reduced visibility. Dolphins are present year-round.' } } ] },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'DEVOCEAN Lodge', item: 'https://devoceanlodge.com/' }, { '@type': 'ListItem', position: 2, name: 'Accommodation for Diving and Dolphins', item: 'https://devoceanlodge.com/diving-dolphin-accommodation' } ] },
    ],
    staticHtml: `<div id="static-content">
<section>
  <h1>Accommodation for Diving and Dolphins in Ponta do Ouro</h1>
  <p>DEVOCEAN Lodge is in the village centre, a short walk from every PADI dive operator and from The Dolphin Centre. Dive boats typically leave at 07:30–08:00 — proximity to the launch point changes your whole dive day.</p>
  <h2>Dive Sites Around Ponta do Ouro</h2>
  <ul>
    <li><strong>Crèche</strong> — 10 m, dolphin interactions, ideal for beginners</li>
    <li><strong>Pinnacles</strong> — 18–22 m, bull sharks, hammerheads, manta rays</li>
    <li><strong>Atlantis</strong> — 47 m, advanced dive, exceptional pelagic species</li>
  </ul>
  <h2>Wild Dolphin Swims</h2>
  <p>200+ resident Indo-Pacific bottlenose dolphins year-round. The Dolphin Centre operates ethical swims from Crèche reef. Suitable for confident swimmers — no diving certification required.</p>
  <h2>Whale Watching — June to November</h2>
  <p>Humpback whales migrate through Ponta do Ouro's waters June–November. August–October is the peak window for diving, dolphins and whales combined.</p>
  <p><a href="/book-direct">Book your dive base</a> · <a href="/ponta-do-ouro-accommodation">View all accommodation</a></p>
</section>
</div><!-- /static-content -->`,
  },

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

  '/story': {
    title: 'Our Story | DEVOCEAN Lodge — Ponta do Ouro, Mozambique',
    description: "Discover DEVOCEAN Lodge's journey since 2015. Family-run, community-focused eco-lodge in Ponta do Ouro with plans for sustainable growth and local community impact.",
    ogTitle: 'Our Story | DEVOCEAN Lodge',
    ogDescription: 'Family-run eco-lodge in Ponta do Ouro since 2015. Your stay supports sustainable development, local farming, and community projects in southern Mozambique.',
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'AboutPage', name: 'Our Story | DEVOCEAN Lodge', url: 'https://devoceanlodge.com/story', description: "Discover DEVOCEAN Lodge's journey since 2015. Family-run, community-focused eco-lodge in Ponta do Ouro.", about: { '@type': 'LodgingBusiness', '@id': 'https://devoceanlodge.com/#lodge', name: 'DEVOCEAN Lodge', url: 'https://devoceanlodge.com/', foundingDate: '2015', address: { '@type': 'PostalAddress', addressLocality: 'Ponta do Ouro', addressRegion: 'Matutuíne, Província de Maputo', addressCountry: 'MZ' } } },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'DEVOCEAN Lodge', item: 'https://devoceanlodge.com/' }, { '@type': 'ListItem', position: 2, name: 'Our Story', item: 'https://devoceanlodge.com/story' } ] },
    ],
    staticHtml: `<div id="static-content">
<section>
  <h1>Adventure meets sustainability — your stay makes a difference</h1>
  <p>DEVOCEAN Lodge has been welcoming guests to Ponta do Ouro since 2015. We are a family-run, community-focused eco-lodge with nine accommodation options, blending adventure with comfort while growing alongside our dedicated staff and the local community.</p>
  <h2>Lake Sotiba Guest Farm</h2>
  <p>Trusted by local leaders, we are developing a guest farm at Lake Sotiba — a hub for hands-on, sustainable practices in self-reliance and knowledge sharing.</p>
  <h2>From our land to your plate</h2>
  <p>Enjoy a breakfast included with every stay, and pre-order a freshly prepared dinner from our in-house kitchen. Our produce connects directly to local agriculture cooperatives.</p>
  <h2>Your stay creates impact</h2>
  <p>Every booking supports sustainable development and empowers the local community — bringing our vision of a flourishing, eco-conscious southern Mozambique to life.</p>
  <p><a href="/book-direct">Book your stay at DEVOCEAN Lodge</a> · <a href="/#stay">View accommodations</a></p>
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

  '/booking-confirmed': {
    title: 'Booking Confirmed | DEVOCEAN Lodge',
    description: 'Your booking at DEVOCEAN Lodge, Ponta do Ouro is confirmed.',
    ogTitle: 'Booking Confirmed | DEVOCEAN Lodge',
    ogDescription: 'Your booking at DEVOCEAN Lodge, Ponta do Ouro is confirmed.',
    noindex: true,
    staticHtml: '<div id="static-content" aria-hidden="true"></div><!-- /static-content -->',
  },

  '/gift-confirmed': {
    title: 'Gift Voucher Purchase Confirmed | DEVOCEAN Lodge',
    description: 'Your DEVOCEAN Lodge gift voucher purchase is confirmed.',
    ogTitle: 'Gift Voucher Purchase Confirmed | DEVOCEAN Lodge',
    ogDescription: 'Your DEVOCEAN Lodge gift voucher purchase is confirmed.',
    noindex: true,
    staticHtml: '<div id="static-content" aria-hidden="true"></div><!-- /static-content -->',
  },

  '/admin': {
    title: 'Admin | DEVOCEAN Lodge',
    description: 'DEVOCEAN Lodge admin area.',
    ogTitle: 'Admin | DEVOCEAN Lodge',
    ogDescription: 'DEVOCEAN Lodge admin area.',
    noindex: true,
    staticHtml: '<div id="static-content" aria-hidden="true"></div><!-- /static-content -->',
  },

  '/story': {
    title: 'Our Story | DEVOCEAN Lodge',
    description: "Discover DEVOCEAN Lodge's journey since 2015. Family-run, community-focused eco-lodge in Ponta do Ouro with plans for sustainable growth and local impact.",
    ogTitle: 'Our Story | DEVOCEAN Lodge',
    ogDescription: 'Family-run, community-focused and growing with purpose since 2015. Book direct to support local projects and enjoy a warm, effortless stay by the beach.',
    staticHtml: `<div id="static-content">
<section>
  <h1>Adventure meets sustainability — Your stay makes a difference.</h1>
  <p>Since 2015, DEVOCEAN Lodge has been family-run and community-focused in Ponta do Ouro, Mozambique. Book direct to support local projects and enjoy a warm, effortless stay by the beach.</p>
  <h2>Today at DEVOCEAN Lodge</h2>
  <p>We offer 9 unique accommodation options, blending adventure with comfort, while continually enhancing the guest experience together with our dedicated staff and the local community.</p>
  <h2>Lake Sotiba Guest Farm</h2>
  <p>Trusted by local leaders, we are developing a guest farm at Lake Sotiba — a hub for hands-on, sustainable practices in self-reliance and knowledge sharing.</p>
  <h2>Your stay creates impact</h2>
  <p>Every booking supports sustainable development and empowers the local community — bringing our vision of a flourishing, eco-conscious southern Mozambique to life.</p>
  <p><a href="/book-direct">Book your stay at DEVOCEAN Lodge.</a></p>
</section>
</div><!-- /static-content -->`,
  },

  '/devocean-lodge-meals': {
    title: 'Meals at DEVOCEAN Lodge | Breakfast Included & Guest Dinners',
    description: 'Breakfast is included at DEVOCEAN Lodge in Ponta do Ouro. Resident guests can also pre-order freshly prepared dinners from our in-house restaurant.',
    ogTitle: 'Meals at DEVOCEAN Lodge | Breakfast Included',
    ogDescription: 'Breakfast included with every stay. Resident guests can pre-order freshly prepared dinners from our in-house restaurant in Ponta do Ouro, Mozambique.',
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'LodgingBusiness', '@id': 'https://devoceanlodge.com/#lodge', name: 'DEVOCEAN Lodge', url: 'https://devoceanlodge.com', amenityFeature: [ { '@type': 'LocationFeatureSpecification', name: 'Breakfast included', value: true }, { '@type': 'LocationFeatureSpecification', name: 'Dinner by pre-order (resident guests)', value: true }, { '@type': 'LocationFeatureSpecification', name: 'Honesty bar', value: true }, { '@type': 'LocationFeatureSpecification', name: 'Filtered water fountain', value: true } ], servesCuisine: ['Mozambican', 'International'], hasMenu: 'https://devoceanlodge.com/devocean-lodge-meals' },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [ { '@type': 'Question', name: 'Is breakfast included at DEVOCEAN Lodge?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Breakfast is included in the accommodation rate.' } }, { '@type': 'Question', name: 'What time is breakfast served?', acceptedAnswer: { '@type': 'Answer', text: 'Breakfast is normally served from 08:30 until 11:00. Earlier or later service can often be arranged when requested beforehand — for example, if you have an early dive or dolphin swim.' } }, { '@type': 'Question', name: 'Can I have dinner at DEVOCEAN Lodge?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Resident guests can order dinner from our in-house restaurant. Please order in advance and no later than 20:00. The kitchen closes at 21:00.' } }, { '@type': 'Question', name: 'Is the DEVOCEAN Lodge kitchen open to outside visitors?', acceptedAnswer: { '@type': 'Answer', text: 'No. Our meal service is reserved for guests staying at DEVOCEAN Lodge.' } }, { '@type': 'Question', name: 'Does DEVOCEAN Lodge serve lunch?', acceptedAnswer: { '@type': 'Answer', text: 'We do not offer regular lunch service. We are happy to suggest nearby cafés and restaurants based on what is currently open.' } }, { '@type': 'Question', name: 'Can DEVOCEAN Lodge accommodate dietary requirements?', acceptedAnswer: { '@type': 'Answer', text: 'Often, yes. Please advise us of any dietary requirements before arrival. Our kitchen is small and local supplies vary, but we will always be honest about what we can accommodate.' } } ] },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'DEVOCEAN Lodge', item: 'https://devoceanlodge.com/' }, { '@type': 'ListItem', position: 2, name: 'Meals & Dining', item: 'https://devoceanlodge.com/devocean-lodge-meals' } ] },
    ],
    staticHtml: `<div id="static-content">
<section>
  <h1>Breakfast included. Dinner prepared for you on demand.</h1>
  <p>Every stay at DEVOCEAN Lodge includes breakfast, served in our tropical garden. In the evening, resident guests can pre-order a freshly prepared dinner from our in-house restaurant.</p>
  <h2>Breakfast in the Garden</h2>
  <p>Breakfast is included in your accommodation rate and is normally served between 08:30 and 11:00 in the tropical garden. Guests can choose from our breakfast menu, with both cooked and lighter options. Fresh Portuguese bread is served daily, accompanied by coffee, tea or hot chocolate. If you have an early dive or dolphin swim, an earlier or later breakfast can usually be arranged.</p>
  <h2>Dinner at DEVOCEAN</h2>
  <p>Our in-house restaurant prepares dinner exclusively for guests staying at the lodge. Please order in advance — latest order time is 20:00, and the kitchen closes at 21:00. Meals are prepared fresh to order using ingredients purchased daily.</p>
  <h2>Dietary Requirements</h2>
  <p>Please advise us of any vegetarian, vegan or other dietary requirements before arrival. Our kitchen is small and local supplies vary, but we will always be honest about what we can accommodate.</p>
  <p><a href="/book-direct">Book a stay at DEVOCEAN Lodge — breakfast included.</a></p>
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
// Private/transactional routes that must never be indexed.
// These inject a noindex meta tag in addition to the robots.txt Disallow rules.
// ---------------------------------------------------------------------------
const NOINDEX_PATHS = new Set([
  '/admin',
  '/booking-confirmed',
  '/gift-confirmed',
  '/gift-canceled',
  '/thankyou',
  '/canceled',
]);

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
    // Static files (e.g. comfort.html) already have correct meta and are
    // never transformed here — they serve the correct content directly.
    if (pathname !== '/') {

      const expMatch = pathname.match(/^\/experiences\/([a-z]+)$/);
      const expKey = expMatch ? expMatch[1] : null;
      const route = ROUTE_META[pathname];

      if (expKey && EXPERIENCE_KEYS.has(expKey)) {
        // ── Experience detail page (all 22 languages fully translated) ───────
        const pageUrl = `${BASE_URL}/experiences/${expKey}`;
        const meta = EXPERIENCE_META[expKey];

        if (meta) {
          html = html.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);
          html = html.replace(
            /<meta name="description"\s+content="[^"]*"/,
            `<meta name="description" content="${meta.description}"`
          );
          html = html.replace(
            /(<link rel="canonical" href=")[^"]*(")/,
            `$1${pageUrl}$2`
          );
          html = html.replace(
            /(<meta property="og:title" content=")[^"]*(")/,
            `$1${meta.ogTitle}$2`
          );
          html = html.replace(
            /<meta property="og:description"\s+content="[^"]*"/,
            `<meta property="og:description" content="${meta.ogDescription}"`
          );
          html = html.replace(
            /(<meta property="og:url" content=")[^"]*(")/,
            `$1${pageUrl}$2`
          );
        }

        // Strip homepage static-content block (experience renders via React)
        html = html.replace(STATIC_CONTENT_RE, EMPTY_STATIC);

        // Inject experience-specific hreflang (self-referential + all 22 langs)
        html = html.replace(HREFLANG_BLOCK_RE, buildHreflang(pageUrl));

      } else if (route) {
        // ── Known booking/info route (English-only, no translated variants) ──
        html = html.replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`);
        html = html.replace(
          /<meta name="description"\s+content="[^"]*"/,
          `<meta name="description" content="${route.description}"`
        );
        html = html.replace(
          /(<link rel="canonical" href=")[^"]*(")/,
          `$1${BASE_URL}${pathname}$2`
        );
        html = html.replace(
          /(<meta property="og:title" content=")[^"]*(")/,
          `$1${route.ogTitle}$2`
        );
        html = html.replace(
          /<meta property="og:description"\s+content="[^"]*"/,
          `<meta property="og:description" content="${route.ogDescription}"`
        );
        html = html.replace(
          /(<meta property="og:url" content=")[^"]*(")/,
          `$1${BASE_URL}${pathname}$2`
        );
        html = html.replace(STATIC_CONTENT_RE, route.staticHtml);

        // Inline JSON-LD into <head> — served without JavaScript, visible to all crawlers
        if (route.jsonLd?.length) {
          const scripts = route.jsonLd
            .map(ld => `<script type="application/ld+json">${JSON.stringify(ld)}</script>`)
            .join('\n');
          html = html.replace('</head>', `${scripts}\n</head>`);
        }

        // Strip hreflang — no genuine translated variants for this route
        html = html.replace(HREFLANG_BLOCK_RE, EMPTY_HREFLANG);

        // Noindex — transactional / confirmation pages should not be indexed
        if (route.noindex) {
          html = html.replace('</head>', '<meta name="robots" content="noindex">\n</head>');
        }

      } else {
        // ── Unknown SPA route or transactional page ───────────────────────────
        // Strip homepage static-content so it doesn't pollute unrelated pages.
        html = html.replace(STATIC_CONTENT_RE, EMPTY_STATIC);

        // Strip hreflang — we have no information about translated variants here
        html = html.replace(HREFLANG_BLOCK_RE, EMPTY_HREFLANG);

        // Noindex — private/transactional routes must not appear in search results
        if (NOINDEX_PATHS.has(pathname)) {
          html = html.replace('</head>', '<meta name="robots" content="noindex,nofollow">\n</head>');
        }
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
