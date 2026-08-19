import { useEffect } from 'react';
import { ROUTE_DESCRIPTIONS } from '../utils/routeDescriptions.js';
import './GuidePage.css';


export default function DivingDolphinsPage({ bookUrl = '/book-direct' }) {
  useEffect(() => {
    document.title = 'Accommodation for Diving and Dolphin Swims in Ponta do Ouro | DEVOCEAN Lodge';
    document.querySelector('meta[name="description"]')?.setAttribute('content',
      ROUTE_DESCRIPTIONS['/diving-dolphin-accommodation']);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', 'https://devoceanlodge.com/diving-dolphin-accommodation');
  }, []);


  return (
    <div className="guide-page">
      <main>
        <div className="wrap">

          <div className="hero">
            <span className="eyebrow">Dive Base · Ponta do Ouro</span>
            <h1>Accommodation for Diving and Dolphins in Ponta do Ouro</h1>
            <p>The dive boats leave early. Being 5 minutes from the launch point — rather than 30 — changes your whole day. DEVOCEAN Lodge is in the village centre, within walking distance of every dive operator and The Dolphin Centre.</p>
          </div>

          <div className="facts">
            {[
              ['Walk to dive operators', 'green'],
              ['Resident dolphins year-round', 'teal'],
              ['Whale watching Jun–Nov', ''],
              ['Sites 10 m – 47 m', 'blue'],
              ['Gear rinse on-site', 'green'],
              ['Breakfast included', ''],
            ].map(([t, c]) => (
              <div key={t} className="fact"><span className={`fact-dot${c ? ' ' + c : ''}`} />{t}</div>
            ))}
          </div>

          <hr className="divider" />

          <section className="section" aria-labelledby="location-title">
            <h2 className="section-title" id="location-title">Why Where You Stay Matters for Diving</h2>
            <p>Most dive operators in Ponta do Ouro run two dives per day, with the first typically departing around 07:30–08:00. Dolphin swims leave at a similar time. When the boats leave early, proximity matters — a 5-minute walk beats a 30-minute transfer before your first dive of the day.</p>
            <p>DEVOCEAN Lodge is in the village centre, a short walk from every dive operator and from The Dolphin Centre. After diving, the walk back takes you past restaurants and coffee shops. There is no waiting for transfers, no logistics — just diving.</p>
          </section>

          <section className="section" aria-labelledby="sites-title">
            <h2 className="section-title" id="sites-title">Dive Sites Around Ponta do Ouro</h2>
            <div className="grid-3">
              <div className="card">
                <h3>Crèche — 10 m</h3>
                <p>Ponta do Ouro's shallowest and most popular site. Abundant fish life, excellent for beginners and open water divers. The primary site for dolphin interaction dives.</p>
              </div>
              <div className="card">
                <h3>Pinnacles — 18–22 m</h3>
                <p>Rocky pinnacles with strong currents and excellent shark and ray activity. Bull sharks, hammerheads, manta rays, potato bass and large kingfish are regularly sighted.</p>
              </div>
              <div className="card">
                <h3>Atlantis — 47 m</h3>
                <p>Advanced dive on a deep pinnacle. Exceptional visibility and large pelagic species. Requires advanced certification and experience.</p>
              </div>
            </div>
            <div className="highlight-box" style={{marginTop:'1.25rem'}}>
              <h3>Regularly sighted species</h3>
              <p>Bull sharks · Great hammerhead sharks · Tiger sharks · Manta rays · Whale sharks (Oct–Mar) · Humpback whales (Jun–Nov) · Indo-Pacific bottlenose dolphins (year-round) · Potato bass · Kingfish · Barracuda · Moray eels · Sea turtles</p>
            </div>
          </section>

          <section className="section" aria-labelledby="dolphins-title">
            <h2 className="section-title" id="dolphins-title">Wild Dolphin Swims with The Dolphin Centre</h2>
            <p>Ponta do Ouro is home to one of the largest resident populations of Indo-Pacific bottlenose dolphins in the world — over 200 individuals in stable pods that are encountered year-round. The Dolphin Centre operates ethical dolphin swims from Crèche reef, managed to strict eco-tourism standards that prioritise animal welfare.</p>
            <p>Dolphin swims are suitable for confident swimmers and snorkellers. You do not need to be a certified diver. Trips typically depart early morning, when the dolphins are most active and the sea is calmest. Book in advance during peak season (South African school holidays and June–September).</p>
          </section>

          <section className="section" aria-labelledby="whales-title">
            <h2 className="section-title" id="whales-title">Whale Watching — June to November <span className="badge">Seasonal</span></h2>
            <p>Humpback whales migrate through Ponta do Ouro's coastal waters from June to November each year. Ocean seafari operators run dedicated whale-watching excursions from the village, and sightings are virtually guaranteed at peak season (August–October). Whales are occasionally visible from the beach during good years.</p>
            <p>Whale season coincides with the dry season — when diving visibility is at its best, the sea is calmer, and the wind is mild. <strong>August to October is the single best window</strong> for combining diving, dolphin swims and whale watching.</p>
          </section>

          <section className="section" aria-labelledby="recovery-title">
            <h2 className="section-title" id="recovery-title">Back at the Lodge — Rest, Rinse, Recharge</h2>
            <p>After a morning of two dives, the body wants three things: a rinse, a meal and a horizontal surface. DEVOCEAN Lodge has <strong>outdoor gear-rinsing facilities</strong> and ample space to lay equipment out to dry in the garden. The village's restaurants are a short walk away — strong coffee, fresh seafood and shade are all within five minutes.</p>
            <p>The lodge has four accommodation types to suit different divers. The Safari Tent and Comfort Tent are excellent value for solo divers or couples who prioritise proximity over luxury. The Garden Cottage and Thatched Chalet both have AC inverters for a cool, dark room for afternoon recovery sleep between dive days.</p>
          </section>

          <hr className="divider" />

          <section className="section" aria-labelledby="faq-title">
            <h2 className="section-title" id="faq-title">Frequently Asked Questions</h2>
            <ul className="faq-list">
              {[
                ['Which dive operators are closest to DEVOCEAN Lodge?', 'Multiple PADI operators are based in the village, all within a short walk. Ask Marin (our AI receptionist) or our team for current operator recommendations when you book — we know who\'s running well each season.'],
                ['What time do dive trips depart?', 'Most operators run two dives per day. The first dive typically departs around 07:30–08:00, with the second following mid-morning. Dolphin swims leave at a similar time. Early starts are much easier when you\'re a 5-minute walk from the launch point.'],
                ['Can I store and rinse my dive gear at the lodge?', 'Yes. We have outdoor rinse and drying facilities. Speak to the team on arrival to arrange gear storage for your stay.'],
                ['Are dolphin swims suitable for non-divers?', "Yes. Dolphin swims are conducted while snorkelling in shallow water at Crèche reef (10 m depth). You don't need to be a certified diver — confident swimmers are welcome. The Dolphin Centre sets the age and ability requirements."],
                ['What is the best time of year for diving in Ponta do Ouro?', 'April–November offers the best visibility (15–30 m). August–October adds whale season. December–March brings warmer water but occasionally reduced visibility. Dolphins are present year-round.'],
                ['Do I need DAN dive insurance?', 'DAN (Divers Alert Network) insurance is strongly recommended for diving in Mozambique. The nearest recompression chamber is in Durban or Maputo — DAN provides emergency evacuation cover in addition to standard dive accident insurance.'],
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
              <a href="/ponta-do-ouro-accommodation" className="related-link">All accommodation at DEVOCEAN Lodge</a>
              <a href="/safari-tents-ponta-do-ouro" className="related-link">Safari tents in Ponta do Ouro</a>
              <a href="/getting-to-ponta-do-ouro" className="related-link">Getting to Ponta do Ouro</a>
              <a href="/ponta-do-ouro" className="related-link">Ponta do Ouro travel guide</a>
            </div>
          </section>

          <div className="cta">
            <h2>Book Your Dive Base</h2>
            <p>Four accommodation options within minutes of Ponta do Ouro's dive operators and The Dolphin Centre. Check live availability and book direct for best rates.</p>
            <div className="btn-row">
              <a href={bookUrl} className="gbtn gbtn-primary">Check Availability →</a>
              <a href="/ponta-do-ouro-accommodation" className="gbtn gbtn-secondary">View All Rooms</a>
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
