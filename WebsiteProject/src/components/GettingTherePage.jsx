import { useEffect } from 'react';
import { ROUTE_DESCRIPTIONS } from '../utils/routeDescriptions.js';
import './GuidePage.css';


export default function GettingTherePage({ bookUrl = '/book-direct' }) {
  useEffect(() => {
    document.title = 'Getting to Ponta do Ouro from Kosi Bay and Maputo | Travel Guide';
    document.querySelector('meta[name="description"]')?.setAttribute('content',
      ROUTE_DESCRIPTIONS['/getting-to-ponta-do-ouro']);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', 'https://devoceanlodge.com/getting-to-ponta-do-ouro');
  }, []);


  return (
    <div className="guide-page">
      <main>
        <div className="wrap">

          <div className="hero">
            <span className="eyebrow">Travel Guide · Southern Mozambique</span>
            <h1>Getting to Ponta do Ouro from Kosi Bay and Maputo</h1>
            <p>Via the Kosi Bay border crossing (13 km), from Maputo by road or transfer (120 km), or by public chapa from the border. No 4×4 required to reach DEVOCEAN Lodge.</p>
          </div>

          <div className="facts">
            {[
              ['Kosi Bay border 13 km', ''],
              ['Maputo ~120 km', 'green'],
              ['~2 hours from Maputo', 'teal'],
              ['eVisa / VoA available', ''],
              ['Public chapas from border', 'blue'],
              ['Transfers available', 'green'],
            ].map(([t, c]) => (
              <div key={t} className="fact"><span className={`fact-dot${c ? ' ' + c : ''}`} />{t}</div>
            ))}
          </div>

          <hr className="divider" />

          <section className="section" aria-labelledby="routes-title">
            <h2 className="section-title" id="routes-title">The Two Main Routes</h2>
            <div className="grid-2">
              <div className="card">
                <h3>Via Kosi Bay Border — from South Africa</h3>
                <p>The most popular route. Cross at Kosi Bay into Mozambique — the village is 13 km from the border post on a largely tarred road. Standard cars handle the route comfortably in dry conditions.</p>
                <ul>
                  <li><strong>Distance to village:</strong> 13 km from border</li>
                  <li><strong>Road:</strong> Largely tarred, some sandy sections</li>
                  <li><strong>Border hours:</strong> 08:00–17:00 daily</li>
                  <li><strong>No 4×4 required</strong> for DEVOCEAN Lodge</li>
                </ul>
              </div>
              <div className="card">
                <h3>Via Maputo &amp; Katembe Bridge</h3>
                <p>From Maputo, cross the Maputo–Katembe Bridge and follow the coastal road south. Approximately 120 km, taking around 2 hours by car. Transfers from Maputo city and airport can be arranged through the lodge.</p>
                <ul>
                  <li><strong>Distance:</strong> ~120 km from Maputo</li>
                  <li><strong>Drive time:</strong> ~2 hours</li>
                  <li><strong>Road:</strong> Mostly tarred coastal road</li>
                  <li>Private transfers available</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="section" aria-labelledby="kosi-title">
            <h2 className="section-title" id="kosi-title">From South Africa via the Kosi Bay Border</h2>
            <ol className="steps">
              <li className="step"><span className="step-num">1</span><span className="step-text"><strong>Check visa requirements</strong> for your nationality before travel. Mozambique offers an online eVisa and visa-on-arrival at some crossings. Have USD or Metical cash for any fees.</span></li>
              <li className="step"><span className="step-num">2</span><span className="step-text"><strong>Cross at Kosi Bay</strong> (open 08:00–17:00 daily). Clear South African exit and Mozambican entry. Allow extra time on public holidays and peak December–January travel.</span></li>
              <li className="step"><span className="step-num">3</span><span className="step-text"><strong>Drive or take a chapa</strong> the 13 km to the village. Shared chapas depart from near the border when full (20–30 min journey). DEVOCEAN Lodge is 150 m from the village transport terminal.</span></li>
            </ol>
            <div className="highlight-box">
              <h3>Border hours and queues</h3>
              <p>The Kosi Bay border is listed as open <strong>08:00–17:00 daily</strong>. Hours may extend on public holidays. Plan to clear the border well before 17:00. Peak queues occur during South African and Mozambican public holidays and December–January.</p>
            </div>
          </section>

          <section className="section" aria-labelledby="maputo-title">
            <h2 className="section-title" id="maputo-title">From Maputo by Road or Transfer</h2>
            <div className="grid-2">
              <div className="card">
                <h3>Self-drive from Maputo</h3>
                <p>Cross the Maputo–Katembe Bridge (toll road), then head south along the coastal road. The route is largely tarred. Allow approximately 2 hours. A standard car is sufficient — no 4×4 needed to reach the lodge.</p>
              </div>
              <div className="card">
                <h3>Private transfer</h3>
                <p>DEVOCEAN Lodge can arrange private transfers from the Kosi Bay border (~20 min) or from Maputo city and airport (~2 hours). Book in advance — ask Marin when you make your reservation. The most comfortable option if you are arriving without a vehicle.</p>
              </div>
            </div>
          </section>

          <section className="section" aria-labelledby="chapa-title">
            <h2 className="section-title" id="chapa-title">Public Transport — Chapas</h2>
            <p>Shared chapas (minibuses) run throughout the day from the Kosi Bay border to the village, departing when full. The journey takes approximately 20–30 minutes. <strong>DEVOCEAN Lodge is 150 metres from the village transport terminal</strong> — one of the closest lodges to the drop-off point.</p>
            <p>Once at the lodge, shared bakkie taxis (pickup trucks used as shared taxis) run throughout the village and along the coast. They are inexpensive, frequent, and practical for reaching the beach, restaurants, dive operators and the transport terminal.</p>
          </section>

          <section className="section" aria-labelledby="rental-title">
            <h2 className="section-title" id="rental-title">Renting a Car in South Africa for Mozambique</h2>
            <p>Many South African car hire companies now permit travel to Mozambique with advance notice and a cross-border authorisation letter. Confirm these points with your rental company before booking:</p>
            <ul className="bullet-list">
              <li><strong>Cross-border permission</strong> — confirm Mozambique is permitted, in writing</li>
              <li><strong>Road type restriction</strong> — some companies specify "tar road only"; confirm the coastal approach qualifies</li>
              <li><strong>Insurance coverage</strong> — standard SA rental insurance rarely covers Mozambique; additional cover is usually available</li>
              <li><strong>Vehicle specification</strong> — a standard hatchback or sedan is sufficient for DEVOCEAN Lodge; no 4×4 needed</li>
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
                ['Do I need a visa to enter Mozambique at the Kosi Bay border?', 'Entry requirements depend on your nationality and purpose of travel. Mozambique offers an online eVisa as well as visa-on-arrival at some crossings. Visa rules change — check the official Mozambique eVisa portal for the rule that applies to your passport before you travel. Have USD or Metical cash for any border fees.'],
                ['What are the border opening hours?', 'The Kosi Bay border is listed as open 08:00–17:00 daily (last checked July 2026). Hours can be extended on public holidays. Always verify current hours at the official SARBMA page before travel. Peak queues on South African and Mozambican public holidays and December–January — plan to clear the border well before 17:00.'],
                ['Can I take a normal car (not a 4×4) to Ponta do Ouro?', 'Yes. The main route from the Kosi Bay border to the village centre is navigable by standard vehicles. DEVOCEAN Lodge is on a navigable road. See our full guide: Visiting Ponta do Ouro Without a 4×4.'],
                ['Is there public transport from the border?', 'Yes — shared chapas run between the border and the village throughout the day, departing when full. The journey is about 20–30 minutes. DEVOCEAN Lodge is 150 m from the village transport terminal.'],
                ['Can DEVOCEAN Lodge arrange a transfer?', 'Yes. We arrange transfers from the Kosi Bay border (~20 min) and from Maputo city or airport (~2 hours). Contact us in advance or ask Marin when you book.'],
                ['Can I take a rental car from South Africa into Mozambique?', 'Many rental companies now permit Mozambique travel with advance notice and a cross-border letter. Confirm with your rental company before booking. Some companies restrict standard vehicles to the tar road, so clarify if they allow the coastal route.'],
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
              <a href="/ponta-do-ouro-without-4x4" className="related-link">Visiting without a 4×4</a>
              <a href="/ponta-do-ouro-accommodation" className="related-link">Accommodation at DEVOCEAN Lodge</a>
              <a href="/ponta-do-ouro" className="related-link">Ponta do Ouro travel guide</a>
              <a href="/diving-dolphin-accommodation" className="related-link">Diving &amp; dolphin swims</a>
            </div>
          </section>

          <div className="cta">
            <h2>Book Your Stay</h2>
            <p>DEVOCEAN Lodge is on a navigable road in the village centre — easy to reach by standard car, transfer or public transport.</p>
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
