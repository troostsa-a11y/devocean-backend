import { useEffect } from 'react';
import { ROUTE_DESCRIPTIONS } from '../utils/routeDescriptions.js';
import './GuidePage.css';


export default function WithoutFourByFourPage({ bookUrl = '/book-direct' }) {
  useEffect(() => {
    document.title = 'Visiting Ponta do Ouro Without a 4×4 | Complete Guide | DEVOCEAN Lodge';
    document.querySelector('meta[name="description"]')?.setAttribute('content',
      ROUTE_DESCRIPTIONS['/ponta-do-ouro-without-4x4']);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', 'https://devoceanlodge.com/ponta-do-ouro-without-4x4');
  }, []);


  return (
    <div className="guide-page">
      <main>
        <div className="wrap">

          <div className="hero">
            <span className="eyebrow">Practical Travel Guide · Ponta do Ouro</span>
            <h1>Visiting Ponta do Ouro Without a 4×4</h1>
            <p>The main village road is tarred and a standard car gets you to DEVOCEAN Lodge without difficulty. Here is exactly what to expect, what is sandy, and how to get here without your own vehicle.</p>
          </div>

          <div className="answer-box">
            <span className="answer-box-check">✓</span>
            <p>Yes, you can visit Ponta do Ouro without a 4×4. DEVOCEAN Lodge is on a navigable road. The main beach is walkable from the lodge. A standard car or public transport handles the full journey from the Kosi Bay border.</p>
          </div>

          <div className="facts">
            {[
              ['Tarred road to village', 'green'],
              ['No 4×4 to reach lodge', 'green'],
              ['Beach walkable from lodge', ''],
              ['Chapas from border', 'teal'],
              ['Bakkies to beach & Malongane', ''],
              ['150 m from transport terminal', 'blue'],
            ].map(([t, c]) => (
              <div key={t} className="fact"><span className={`fact-dot${c ? ' ' + c : ''}`} />{t}</div>
            ))}
          </div>

          <hr className="divider" />

          <section className="section" aria-labelledby="roads-title">
            <h2 className="section-title" id="roads-title">Road Conditions — What to Expect</h2>
            <div className="grid-2">
              <div className="card">
                <h3>Kosi Bay border to village centre</h3>
                <p>The 13 km from the border to the village centre is largely tarred, with a few short sandy sections. Under normal dry-season conditions (April–November), a standard sedan or hatchback handles it comfortably. After heavy rain, the sandy sections can become soft — check local conditions if travelling in the wet season (December–March).</p>
              </div>
              <div className="card">
                <h3>Village centre and DEVOCEAN Lodge</h3>
                <p>The village centre roads are tarred or compacted. DEVOCEAN Lodge is on a navigable road — no soft sand between the main road and the gate. On-site parking is available for guests who drive.</p>
              </div>
              <div className="card">
                <h3>Beach access</h3>
                <p>The main Ponta do Ouro beach is <strong>walkable from the lodge</strong> in a few minutes through the village. No vehicle is needed. The beach is accessible entirely on foot.</p>
              </div>
              <div className="card">
                <h3>Malongane and remote beaches</h3>
                <p>Malongane (approximately 10 km north) is reached via deep coastal sand tracks — a <strong>4×4 is required to drive there</strong>. However, local bakkie taxis run this route daily and are an inexpensive and easy way to visit without your own 4×4.</p>
              </div>
            </div>
          </section>

          <section className="section" aria-labelledby="without-vehicle-title">
            <h2 className="section-title" id="without-vehicle-title">Getting Here Without Your Own Vehicle</h2>
            <div className="grid-2">
              <div className="card">
                <h3>Shared chapas from Kosi Bay border</h3>
                <p>Shared minibuses (chapas) run throughout the day from the border to the village, departing when full. The journey takes 20–30 minutes. DEVOCEAN Lodge is just <strong>150 metres from the village transport terminal</strong>.</p>
              </div>
              <div className="card">
                <h3>Private transfer from the border or Maputo</h3>
                <p>DEVOCEAN Lodge can arrange private transfers from the Kosi Bay border (~20 min) or from Maputo city and airport (~2 hours). Book in advance — ask Marin when you make your reservation.</p>
              </div>
              <div className="card">
                <h3>Bakkie taxis within the village</h3>
                <p>Once at the lodge, shared bakkie taxis (pickup trucks) run throughout the village and along the coast. Inexpensive, frequent, and practical for reaching the beach, restaurants, dive operators, and the transport terminal.</p>
              </div>
              <div className="card">
                <h3>Motorbikes and scooters</h3>
                <p>Motorbikes handle the sandy sections far better than cars. The road from the border is manageable on a motorcycle. Scooters are fine for paved village roads. Motorbikes can be hired locally in the village.</p>
              </div>
            </div>
          </section>

          <section className="section" aria-labelledby="rental-title">
            <h2 className="section-title" id="rental-title">Renting a Car in South Africa for Mozambique</h2>
            <p>Many South African car hire companies now permit travel to Mozambique with advance notice and a cross-border authorisation letter. The key things to confirm:</p>
            <ul className="bullet-list">
              <li><strong>Cross-border permission</strong> — confirm Mozambique is permitted, in writing</li>
              <li><strong>Road type restriction</strong> — some companies specify "tar road only"; confirm the coastal approach qualifies</li>
              <li><strong>Insurance coverage</strong> — standard SA rental insurance rarely covers Mozambique; additional cover is usually available</li>
              <li><strong>Vehicle specification</strong> — a standard hatchback or sedan is sufficient for DEVOCEAN Lodge; no need to upgrade to a 4×4</li>
              <li><strong>Third-party liability</strong> — Mozambique requires third-party insurance; ensure this is included or purchase at the border</li>
            </ul>
            <div className="highlight-box">
              <h3>If your rental company doesn't allow Mozambique</h3>
              <p>Leave the car on the South African side at Kosi Bay — there is parking near the border — and cross on foot. Take a chapa or arrange a transfer with DEVOCEAN Lodge for the 13 km to the village.</p>
            </div>
          </section>

          <hr className="divider" />

          <section className="section" aria-labelledby="faq-title">
            <h2 className="section-title" id="faq-title">Frequently Asked Questions</h2>
            <ul className="faq-list">
              {[
                ['Is the road from the Kosi Bay border fully tarred?', 'It is largely tarred with some short sandy sections that can worsen after heavy rain. Under normal dry-season conditions (April–November), a standard sedan handles it comfortably. Check local conditions if travelling in the rainy season.'],
                ['Can I reach the beach without a 4×4?', 'Yes. The main Ponta do Ouro beach is walkable from the lodge and from the village centre. No vehicle is needed to reach the beach on foot. For more remote beach sections, local bakkie taxis operate the route daily.'],
                ['What about Malongane — can I visit without a 4×4?', 'Malongane is reached via deep coastal sand — a 4×4 is required to drive there. However, local bakkie taxis run the route and are an inexpensive way to visit without your own 4×4.'],
                ['Do chapas run daily from the border to the village?', 'Yes. Shared chapas run throughout the day from the Kosi Bay border to the village, departing when full. The journey is approximately 20–30 minutes. DEVOCEAN Lodge is 150 m from the village transport terminal.'],
                ['Can I travel on a motorcycle or scooter?', 'A motorbike or larger scooter handles the route easily — motorbikes navigate sandy sections far better than cars. Small scooters are fine within the village. Bikes can be hired locally for getting around once you are in Ponta do Ouro.'],
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
              <a href="/getting-to-ponta-do-ouro" className="related-link">Getting to Ponta do Ouro</a>
              <a href="/ponta-do-ouro-accommodation" className="related-link">Accommodation at DEVOCEAN Lodge</a>
              <a href="/ponta-do-ouro" className="related-link">Ponta do Ouro travel guide</a>
              <a href="/diving-dolphin-accommodation" className="related-link">Diving &amp; dolphin swims</a>
            </div>
          </section>

          <div className="cta">
            <h2>Book Your Stay</h2>
            <p>DEVOCEAN Lodge is easy to reach by standard car, transfer or public transport — no 4×4 required. Check live availability and book direct.</p>
            <div className="btn-row">
              <a href={bookUrl} className="gbtn gbtn-primary">Check Availability →</a>
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
