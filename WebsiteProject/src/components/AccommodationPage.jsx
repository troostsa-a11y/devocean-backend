import { useEffect } from 'react';
import { ROUTE_DESCRIPTIONS } from '../utils/routeDescriptions.js';
import './GuidePage.css';


export default function AccommodationPage({ bookUrl = '/book-direct' }) {
  useEffect(() => {
    document.title = 'Accommodation in Ponta do Ouro Near the Beach | DEVOCEAN Lodge';
    document.querySelector('meta[name="description"]')?.setAttribute('content',
      ROUTE_DESCRIPTIONS['/ponta-do-ouro-accommodation']);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', 'https://devoceanlodge.com/ponta-do-ouro-accommodation');
  }, []);


  return (
    <div className="guide-page">
      <main>
        <div className="wrap">

          <div className="hero">
            <span className="eyebrow">DEVOCEAN Lodge · Ponta do Ouro</span>
            <h1>Accommodation in Ponta do Ouro Near the Beach</h1>
            <p>Nine units across four accommodation types, set in a lush tropical garden approximately 300 metres from the Indian Ocean. Four Safari Tents, three Comfort Tents, a Garden Cottage and a Thatched Chalet — each with private terraces and easy access to the beach, dive boats and village on foot.</p>
          </div>

          <div className="facts">
            {[
              ['9 units, 4 types', 'green'],
              ['~300 m to beach', ''],
              ['150 m from transport', 'teal'],
              ['Breakfast included', 'green'],
              ['Free WiFi', 'blue'],
              ['Book direct — best rates', ''],
            ].map(([t, c]) => (
              <div key={t} className="fact"><span className={`fact-dot${c ? ' ' + c : ''}`} />{t}</div>
            ))}
          </div>

          <hr className="divider" />

          <section className="section" aria-labelledby="location-title">
            <h2 className="section-title" id="location-title">Where We Are</h2>
            <p>DEVOCEAN Lodge is set in a lush tropical garden in the heart of Ponta do Ouro village, Southern Mozambique. The Indian Ocean is a few minutes' walk away through the village streets. The main beach — wide, uncrowded and framed by casuarina trees — is reached on foot without needing a vehicle.</p>
            <p>The village centre, with its restaurants, bars and dive operators, is immediately accessible. The public transport terminal — where shared chapas depart for the Kosi Bay border and Maputo — is just <strong>150 metres from the gate</strong>. The approach road to Ponta do Ouro is tarred and accessible by standard car. A 4×4 is not required to reach the lodge.</p>
          </section>

          <section className="section" aria-labelledby="units-title">
            <h2 className="section-title" id="units-title">9 Units Across Four Accommodation Types <span className="badge">Book direct</span></h2>
            <div className="grid-2">
              <div className="card">
                <h3>Safari Tent</h3>
                <p><strong>King or Twin · Shared ablutions</strong></p>
                <p>12 m² canvas tent on a raised 3×6 m wooden platform. Protective side and back walls, mosquito mesh windows, private terrace with views into the garden. Safari Tent guests use a shared ablutions block with separate women's and men's sections — each with two showers and two toilets.</p>
                <p style={{marginTop:'0.5rem'}}><a href="/experiences/safari">View full details →</a></p>
              </div>
              <div className="card">
                <h3>Comfort Safari Tent</h3>
                <p><strong>King or Twin · Private en-suite bathroom in adjoining thatched rondavel</strong></p>
                <p>The canvas experience with added privacy and convenience. Your private bathroom is housed in an adjoining thatched rondavel, reached from the tent's rear door via a short private connection. Private wooden terrace overlooking the garden, lit romantically at night.</p>
                <p style={{marginTop:'0.5rem'}}><a href="/experiences/safari">View full details →</a></p>
              </div>
              <div className="card">
                <h3>Garden Cottage</h3>
                <p><strong>AC Inverter · En-suite bathroom in adjoining thatched rondavel · Desk</strong></p>
                <p>A solid-walled cottage with a red Roman-tiled roof and high white ceiling with dark wooden beams. AC inverter for cooling and heating. Dining table, desk, private terrace and garden views. Your private en-suite bathroom is housed in an adjoining thatched rondavel, accessed directly through the bedroom's rear door.</p>
              </div>
              <div className="card">
                <h3>Thatched Chalet</h3>
                <p><strong>King or Twin · AC Inverter · Private</strong></p>
                <p>Hidden in a secluded corner under palms, strelitzia and acacia. The most private unit on the property. AC inverter, private bathroom, private terrace — a romantic retreat for two.</p>
              </div>
            </div>
          </section>

          <section className="section" aria-labelledby="included-title">
            <h2 className="section-title" id="included-title">What's Included in Every Stay</h2>
            <div className="grid-2">
              <div className="card">
                <h3>In every unit</h3>
                <ul>
                  <li>Private outdoor terrace</li>
                  <li>Mosquito-screened windows and doors</li>
                  <li>Power points for device charging</li>
                  <li>Fresh linen and towels</li>
                  <li>Free WiFi across the property</li>
                </ul>
              </div>
              <div className="card">
                <h3>On the property</h3>
                <ul>
                  <li><strong>Breakfast included</strong> — served daily in the garden</li>
                  <li>Dinner available by advance pre-order (residents only)</li>
                  <li>Outdoor braai / BBQ facilities</li>
                  <li>On-site parking (no 4×4 required)</li>
                  <li>150 m from public transport terminal</li>
                  <li>Marin AI receptionist — 24 hr guest support</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="section" aria-labelledby="activities-title">
            <h2 className="section-title" id="activities-title">Activities From Your Doorstep</h2>
            <p>Ponta do Ouro is one of Southern Africa's most rewarding adventure destinations — and almost everything is within easy reach of the lodge on foot or by a short local transfer.</p>
            <div className="grid-2">
              <div className="card">
                <h3>In the water</h3>
                <ul>
                  <li>Scuba diving — multiple PADI operators nearby</li>
                  <li>Ethical wild dolphin swims (year-round)</li>
                  <li>Whale watching (June – November)</li>
                  <li>Ocean seafaris (whale shark, turtles, rays)</li>
                  <li>Snorkelling, surfing, deep-sea fishing</li>
                  <li>Beach walks and sunrise swims</li>
                </ul>
              </div>
              <div className="card">
                <h3>On land</h3>
                <ul>
                  <li>Maputo National Park day trips — 30 km</li>
                  <li>Village restaurants, bars and craft stalls</li>
                  <li>Kosi Bay iSimangaliso Wetlands — 25 min</li>
                  <li>Hiking and sand dune walks</li>
                  <li>Lighthouse viewpoint</li>
                </ul>
              </div>
            </div>
          </section>

          <hr className="divider" />

          <section className="section" aria-labelledby="faq-title">
            <h2 className="section-title" id="faq-title">Frequently Asked Questions</h2>
            <ul className="faq-list">
              {[
                ['How far is DEVOCEAN Lodge from the beach?', 'The lodge is approximately 300 metres from the main beach — a few minutes\' walk through the village streets. No vehicle is needed to reach the beach from the lodge.'],
                ['Do I need a 4×4 to get to DEVOCEAN Lodge?', 'No. DEVOCEAN Lodge is on a navigable road in the village centre. A standard car handles the route from the Kosi Bay border comfortably. On-site parking is available.'],
                ['Is DEVOCEAN Lodge suitable for families?', 'Yes. We accommodate families across all unit types. Children are welcome. Please mention family composition when booking so we can advise on the best unit configuration.'],
                ['How do I get from the Kosi Bay border to the lodge?', 'Shared chapas run throughout the day from the border to the village (20–30 min, departing when full). DEVOCEAN Lodge is 150 m from the village transport terminal. We also arrange private transfers — ask Marin when booking.'],
                ['Is breakfast included?', 'Yes. Breakfast is included in the accommodation rate for all stays and is served in the garden between 07:30 and 11:00.'],
                ['Can I book direct without paying OTA fees?', 'Yes — book at devoceanlodge.com/book-direct for live availability and confirmed best rates. No OTA markup, instant confirmation.'],
              ].map(([q, a]) => (
                <li key={q} className="faq-item">
                  <div className="faq-q">{q}</div>
                  <div className="faq-a">{a}</div>
                </li>
              ))}
            </ul>
          </section>

          <section className="section" aria-labelledby="guides-title">
            <h2 className="section-title" id="guides-title">More Useful Guides</h2>
            <div className="related">
              <a href="/safari-tents-ponta-do-ouro" className="related-link">Safari tents in Ponta do Ouro</a>
              <a href="/getting-to-ponta-do-ouro" className="related-link">Getting to Ponta do Ouro</a>
              <a href="/ponta-do-ouro-without-4x4" className="related-link">Visiting without a 4×4</a>
              <a href="/ponta-do-ouro" className="related-link">Ponta do Ouro travel guide</a>
              <a href="/devocean-lodge-meals" className="related-link">Meals &amp; dining</a>
              <a href="/diving-dolphin-accommodation" className="related-link">Diving &amp; dolphins</a>
            </div>
          </section>

          <div className="cta">
            <h2>Check Availability</h2>
            <p>Nine accommodation options in a tropical garden, 300 m from the beach. Breakfast included. Book direct for best rates.</p>
            <div className="btn-row">
              <a href={bookUrl} className="gbtn gbtn-primary">Check Availability →</a>
              <a href="/#stay" className="gbtn gbtn-secondary">View All Rooms</a>
              <button type="button" onClick={() => window.dvAsk?.()} className="gbtn gbtn-ask" aria-label="Ask Marin">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </button>
            </div>
          </div>

        </div>
      </main>
      <footer className="page-footer">
        <p>&copy; 2026 <a href="/">DEVOCEAN Lodge</a>, Ponta do Ouro, Mozambique &mdash; <a href="/legal/privacy">Privacy</a> &middot; <a href="/legal/terms">Terms</a></p>
      </footer>
    </div>
  );
}
