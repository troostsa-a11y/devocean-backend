import { useEffect } from 'react';
import './GuidePage.css';


export default function SafariTentsPage({ bookUrl = '/book-direct' }) {
  useEffect(() => {
    document.title = 'Safari Tents in Ponta do Ouro, Mozambique | DEVOCEAN Lodge';
    document.querySelector('meta[name="description"]')?.setAttribute('content',
      'DEVOCEAN Lodge offers two safari tents in Ponta do Ouro — a classic canvas tent on a raised platform and a more private Comfort Tent with en-suite bathroom. Sleep under canvas in Southern Mozambique with breakfast included.');
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', 'https://devoceanlodge.com/safari-tents-ponta-do-ouro');
  }, []);


  return (
    <div className="guide-page">
      <main>
        <div className="wrap">

          <div className="hero">
            <span className="eyebrow">Canvas Accommodation · Southern Mozambique</span>
            <h1>Safari Tents in Ponta do Ouro</h1>
            <p>Sleep under canvas on a raised wooden platform in a tropical garden. Two tents, each a different balance of wildness and comfort — both a few minutes from the Indian Ocean and the dive boats.</p>
          </div>

          <div className="facts">
            {[
              ['Two tent options', 'green'],
              ['King or Twin configuration', ''],
              ['Raised wooden platform', ''],
              ['Shared or en-suite bathroom', 'teal'],
              ['Breakfast included', 'green'],
              ['Minutes from the beach', 'blue'],
            ].map(([t, c]) => (
              <div key={t} className="fact"><span className={`fact-dot${c ? ' ' + c : ''}`} />{t}</div>
            ))}
          </div>

          <hr className="divider" />

          <section className="section" aria-labelledby="experience-title">
            <h2 className="section-title" id="experience-title">The Canvas Safari Tent Experience</h2>
            <p>There are few sleeping environments more attuned to the African outdoors than a canvas tent. At night in Ponta do Ouro, the canvas walls let in the sound of the sea breeze through the palm trees, the distant rhythm of the ocean, and in the early morning, the chorus of birds that inhabit the tropical garden. It is a fundamentally different experience from a walled room — lighter, more immediate, more alive.</p>
            <p>DEVOCEAN Lodge's tents are genuine canvas structures on raised wooden platforms, with the feel and sounds of the African outdoors intact. What they add to that foundation is a proper bed, fresh linen, power points, mosquito protection, and a private terrace from which to watch the sun set over the garden.</p>
          </section>

          <section className="section" aria-labelledby="choose-title">
            <h2 className="section-title" id="choose-title">Choose Your Tent <span className="badge">Two options</span></h2>
            <div className="grid-2">
              <div className="card">
                <h3>Safari Tent — Adventure in Canvas</h3>
                <p>The classic canvas safari experience. A 12 m² tent on a raised 3×6 m wooden platform with protective side and back walls that give privacy and shelter while keeping you connected to the garden and the outdoors.</p>
                <ul>
                  <li>12 m², raised 3×6 m wooden platform</li>
                  <li>King-size or twin bed configuration</li>
                  <li>Strong fan for cooling</li>
                  <li>Private wooden terrace</li>
                  <li>Mosquito mesh windows and doors</li>
                  <li>Power points for device charging</li>
                  <li>Shared clean bathroom (safari tent guests only)</li>
                </ul>
              </div>
              <div className="card">
                <h3>Comfort Safari Tent — More privacy, same charm</h3>
                <p>All the soul of the canvas experience, with the added convenience of an en-suite bathroom and greater seclusion. The private thatched bathroom is attached to the back of the tent.</p>
                <ul>
                  <li>Spacious canvas tent on raised platform</li>
                  <li>King-size or twin bed configuration</li>
                  <li>Strong fan for cooling</li>
                  <li>Private wooden terrace, night-lit garden</li>
                  <li>Mosquito mesh windows and doors</li>
                  <li>Power points for device charging</li>
                  <li>Private en-suite thatched bathroom</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="section" aria-labelledby="practical-title">
            <h2 className="section-title" id="practical-title">Practical Information</h2>
            <div className="grid-2">
              <div className="card">
                <h3>Climate and comfort</h3>
                <p>Ponta do Ouro's position on the Indian Ocean keeps it cooler than inland Mozambique. The sea breeze is a constant companion. Summer (December–March) is warm and humid; winter (June–August) is dry, mild and breezy. Both tents have fans. Canvas breathes better than solid walls on hot nights.</p>
              </div>
              <div className="card">
                <h3>What to bring</h3>
                <ul>
                  <li>DEET insect repellent (malaria area)</li>
                  <li>Antimalarial medication (see your doctor)</li>
                  <li>Light clothing — it is a beach destination</li>
                  <li>Rash vest and reef shoes for diving/snorkelling</li>
                  <li>A torch/headlamp for evening garden walks</li>
                </ul>
              </div>
            </div>
            <div className="highlight-box">
              <h3>For divers and early starters</h3>
              <p>Dive operators in Ponta do Ouro typically launch early morning. The lodge's central village location means you can walk to the boat launch point without stress. See our guide: <a href="/diving-dolphin-accommodation">accommodation for divers and dolphin swimmers</a>.</p>
            </div>
          </section>

          <hr className="divider" />

          <section className="section" aria-labelledby="faq-title">
            <h2 className="section-title" id="faq-title">Frequently Asked Questions</h2>
            <ul className="faq-list">
              {[
                ['Is it real camping or glamping?', 'Somewhere in between. Genuine canvas tent on a wooden platform — so the sounds, feel and connection to the outdoors are real. But with a proper bed, fresh linen, a private terrace and a well-maintained garden. The Comfort Tent adds an en-suite bathroom.'],
                ['What is the bathroom situation for the standard Safari Tent?', 'The standard Safari Tent uses a shared bathroom — clean, maintained, and used only by safari tent guests. The Comfort Safari Tent has its own private en-suite bathroom attached to the rear of the tent.'],
                ['Are there mosquitoes? Is Ponta do Ouro a malaria area?', 'Yes, Ponta do Ouro is in a malaria-risk zone. Standard precautions apply: consult your doctor about prophylaxis before travel, and bring DEET insect repellent. The tents are fitted with mosquito-mesh windows and doors.'],
                ['How hot does it get inside the tent?', "Ponta do Ouro's coastal position and sea breeze keep temperatures comfortable. Both tents have strong fans. Canvas breathes better than solid walls. Most guests sleep comfortably year-round. If you're very heat-sensitive, the Garden Cottage and Thatched Chalet both have AC inverters."],
                ["What's the difference between the Safari Tent and the Comfort Tent?", 'The Comfort Safari Tent has a private en-suite thatched bathroom (vs. shared bathroom for the standard tent) and offers slightly more privacy and seclusion. Both are canvas tents with a fan, private terrace, King/Twin beds and mosquito protection.'],
                ['Can I book direct without paying OTA fees?', 'Yes — devoceanlodge.com/book-direct gives live availability and confirmed best rates for both tents.'],
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
              <a href="/diving-dolphin-accommodation" className="related-link">Accommodation for diving &amp; dolphins</a>
              <a href="/ponta-do-ouro-without-4x4" className="related-link">Visiting without a 4×4</a>
              <a href="/getting-to-ponta-do-ouro" className="related-link">Getting to Ponta do Ouro</a>
              <a href="/ponta-do-ouro" className="related-link">Ponta do Ouro travel guide</a>
            </div>
          </section>

          <div className="cta">
            <h2>Check Availability for Both Tents</h2>
            <p>Live rates for the Safari Tent and Comfort Safari Tent. Book direct for best rates — confirmed instantly.</p>
            <div className="btn-row">
              <a href={bookUrl} className="gbtn gbtn-primary">Check Availability →</a>
              <a href="/ponta-do-ouro-accommodation" className="gbtn gbtn-secondary">Safari Tent details</a>
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
