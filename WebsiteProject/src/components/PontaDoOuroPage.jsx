import { useEffect } from 'react';
import './GuidePage.css';


export default function PontaDoOuroPage({ bookUrl = '/book-direct' }) {
  useEffect(() => {
    document.title = 'Ponta do Ouro Travel Guide | DEVOCEAN Lodge — Mozambique';
    document.querySelector('meta[name="description"]')?.setAttribute('content',
      'Complete travel guide to Ponta do Ouro, Mozambique — pristine beaches, 1,200+ marine species, ethical dolphin swims, and whale watching June–November.');
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', 'https://devoceanlodge.com/ponta-do-ouro');
  }, []);


  return (
    <div className="guide-page">
      <main>
        <div className="wrap">

          <div className="hero">
            <span className="eyebrow">Southern Mozambique</span>
            <h1>Why Ponta do Ouro?</h1>
            <p>A pristine coastal village at the southern tip of Mozambique — gateway to 1,200+ marine species, ethical dolphin swims, whale watching, and Africa's hidden UNESCO wilderness.</p>
          </div>

          <div className="facts">
            {[
              ['1,200+ marine species', ''],
              ['Resident dolphin pods', 'green'],
              ['Whale watching Jun–Nov', 'teal'],
              ['Maputo National Park 30 km', ''],
              ['Dive sites 10 m – 47 m', 'blue'],
              ['Non-commercialised village', 'green'],
            ].map(([t, c]) => (
              <div key={t} className="fact"><span className={`fact-dot${c ? ' ' + c : ''}`} />{t}</div>
            ))}
          </div>

          <hr className="divider" />

          <section className="section" aria-labelledby="beaches-title">
            <h2 className="section-title" id="beaches-title">Stunning Beaches and Coastal Beauty <span className="badge">A true escape</span></h2>
            <p>Ponta do Ouro's beaches are framed by casuarina trees, rolling sand dunes, and crystal-clear Indian Ocean water. The main beach is wide, uncrowded and pristine — dramatically different from the developed resorts further north. The raw, unfiltered character of the shoreline invites slow travel: long walks at low tide, sunrise swims, and evenings where the only sounds are waves.</p>
            <p>Unlike more commercialised coastal destinations, Ponta do Ouro has deliberately avoided mass development. Infrastructure is modest by design. The village has electricity, reliable mobile data, and a small selection of restaurants and bars — but the authentic character remains intact.</p>
          </section>

          <section className="section" aria-labelledby="marine-title">
            <h2 className="section-title" id="marine-title">World-Class Marine Adventures <span className="badge">1,200+ species</span></h2>
            <p>The Ponta do Ouro Partial Marine Reserve is one of Southern Africa's most biodiverse marine protected areas. Resident bottlenose dolphin pods are encountered year-round, both from the surface and underwater on ethical guided swims managed to strict eco-tourism standards.</p>
            <p>Scuba diving ranges from 10 m at Crèche reef (abundant fish life, ideal for beginners and dolphin dives) to 47 m at the Atlantis pinnacle. Bull sharks, hammerheads, manta rays, potato bass, kingfish, barracuda, moray eels and sea turtles are regularly sighted. Humpback whales migrate through from June to November.</p>
            <div className="grid-2">
              <div className="card">
                <h3>Diving highlights</h3>
                <ul>
                  <li>Crèche — 10 m, dolphin interactions</li>
                  <li>Pinnacles — 18–22 m, sharks and rays</li>
                  <li>Atlantis — 47 m, advanced divers</li>
                  <li>Bull shark sightings year-round</li>
                  <li>Multiple PADI operators on-site</li>
                </ul>
              </div>
              <div className="card">
                <h3>On the water</h3>
                <ul>
                  <li>Ethical wild dolphin swims</li>
                  <li>Whale watching June – November</li>
                  <li>Ocean seafari (whale shark, dolphins)</li>
                  <li>Deep-sea fishing (marlin, sailfish)</li>
                  <li>Surfing — consistent beach breaks</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="section" aria-labelledby="wildlife-title">
            <h2 className="section-title" id="wildlife-title">Wildlife Reserves at the Doorstep <span className="badge">Bush-to-beach</span></h2>
            <p>Maputo National Park (formerly Maputo Special Reserve) is 30 km north of Ponta do Ouro and forms part of the UNESCO-listed Lubombo Transfrontier Conservation Area. The park shelters large herds of elephants, hippos, giraffes, zebras, blue wildebeest, nyala, kudu and over 526 bird species across savanna, dunes and mangroves.</p>
            <div className="grid-2">
              <div className="card">
                <h3>Maputo National Park — 30 km (UNESCO)</h3>
                <ul>
                  <li>Elephants, hippos, giraffes, zebras</li>
                  <li>526+ bird species</li>
                  <li>Half-day and full-day safaris available</li>
                </ul>
              </div>
              <div className="card">
                <h3>South Africa — day trips</h3>
                <ul>
                  <li>Tembe Elephant Park — 2 h</li>
                  <li>Hluhluwe-iMfolozi Park — 3–4 h</li>
                  <li>iSimangaliso Wetland Park — 3 h (UNESCO)</li>
                  <li>Kruger National Park — 4–5 h</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="section" aria-labelledby="culture-title">
            <h2 className="section-title" id="culture-title">Cultural and Scenic Road Trips <span className="badge">UNESCO heritage</span></h2>
            <p>Ponta do Ouro's location near the South African and eSwatini borders opens a radius of cultural day trips. eSwatini (3–4 h) is home to Mantenga Nature Reserve and traditional Swazi cultural performances — including Sibhaca dances, recognised as UNESCO intangible cultural heritage. The Panorama Route (5–6 h) sweeps through Blyde River Canyon, God's Window, and numerous waterfalls.</p>
            <p>Locally, Mozambican village life is authentically unhurried. Fresh seafood markets, artisan craft stalls and lively outdoor bars are woven into the daily fabric of Ponta do Ouro village.</p>
          </section>

          <section className="section" aria-labelledby="charm-title">
            <h2 className="section-title" id="charm-title">Authentic Mozambican Charm <span className="badge">Non-commercialised</span></h2>
            <p>Ponta do Ouro is resolutely non-commercialised. There are no resort hotels, no mass-market beach clubs, and no trinket shops dominating the beachfront. The village has grown organically around fishing, diving and a small community of long-term residents — and that character is its greatest asset for visitors who want something genuine.</p>
            <p>The pace is slow by design. Meals take their time. The beach is reached on foot. The ocean is the entertainment.</p>
          </section>

          <hr className="divider" />

          <section className="section" aria-labelledby="faq-title">
            <h2 className="section-title" id="faq-title">Frequently Asked Questions</h2>
            <ul className="faq-list">
              {[
                ['How do I get to Ponta do Ouro?', 'The most common route is via the Kosi Bay border crossing from South Africa — 13 km from the village on a largely tarred road. From Maputo it is approximately 120 km via the Maputo–Katembe Bridge. No 4×4 is required to reach DEVOCEAN Lodge.'],
                ['When is the best time to visit Ponta do Ouro?', 'April to November is the dry season with the calmest seas and best diving visibility (15–30 m). August to October adds humpback whale watching. Dolphins are present year-round. December to March is warmer and wetter.'],
                ['Is Ponta do Ouro suitable for families with children?', 'Yes. The village is quiet and walkable. Dolphin swims are suitable for confident swimmers of all ages, snorkelling is excellent at Crèche reef, and the beach is calm and uncrowded. DEVOCEAN Lodge accommodates families across all unit types.'],
                ['What currency should I bring?', 'The local currency is the Mozambican Metical (MZN). South African Rand is widely accepted in shops, restaurants and at the lodge. USD and EUR can be exchanged locally. Card payments are limited outside the lodge — bring sufficient cash for excursions and meals.'],
                ['Where should I stay in Ponta do Ouro?', 'DEVOCEAN Lodge is a family-run eco-lodge in the village centre, approximately 300 metres from the main beach. Nine units across four accommodation types — safari tents, comfort tents, a garden cottage and a thatched chalet. Breakfast included.'],
              ].map(([q, a]) => (
                <li key={q} className="faq-item">
                  <div className="faq-q">{q}</div>
                  <div className="faq-a">{a}</div>
                </li>
              ))}
            </ul>
          </section>

          <section className="section" aria-labelledby="guides-title">
            <h2 className="section-title" id="guides-title">Useful Guides for Your Trip</h2>
            <div className="related">
              <a href="/getting-to-ponta-do-ouro" className="related-link">Getting to Ponta do Ouro</a>
              <a href="/ponta-do-ouro-without-4x4" className="related-link">Visiting without a 4×4</a>
              <a href="/ponta-do-ouro-accommodation" className="related-link">Accommodation at DEVOCEAN Lodge</a>
              <a href="/devocean-lodge-meals" className="related-link">Meals & dining</a>
              <a href="/experiences/diving" className="related-link">Scuba diving</a>
              <a href="/experiences/dolphins" className="related-link">Dolphin swims</a>
            </div>
          </section>

          <div className="cta">
            <h2>Stay at DEVOCEAN Lodge</h2>
            <p>Family-run eco-lodge in the village centre. Nine accommodation options, breakfast included, and everything Ponta do Ouro has to offer within walking distance.</p>
            <div className="btn-row">
              <a href={bookUrl} className="gbtn gbtn-primary">Book Direct — Best Rates</a>
              <a href="/ponta-do-ouro-accommodation" className="gbtn gbtn-secondary">View Accommodation</a>
              <button type="button" onClick={() => window.dvAsk?.()} className="gbtn gbtn-ask" aria-label="Ask Marin">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </button>
            </div>
          </div>

        </div>
      </main>
      <footer className="page-footer">
        <p>&copy; 2026 <a href="/">DEVOCEAN Lodge</a>, Ponta do Ouro, Mozambique &mdash; <a href="/legal/privacy.html">Privacy</a> &middot; <a href="/legal/terms.html">Terms</a></p>
      </footer>
    </div>
  );
}
