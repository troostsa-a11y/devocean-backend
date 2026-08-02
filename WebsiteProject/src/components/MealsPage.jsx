import { useEffect, useState } from 'react';
import { useSeoPage, getMealsTitle, getMealsDescription } from '../utils/seoMeta';
import './MealsPage.css';


/** Resolve a dot-path like "hero.title" against the translations object. */
function g(t, path, fallback = '') {
  const val = path.split('.').reduce((o, k) => o?.[k], t);
  return val ?? fallback;
}

export default function MealsPage({ lang = 'en-GB', bookUrl = '/book-direct' }) {
  const [t, setT] = useState(null);

  // Load translations whenever lang changes
  useEffect(() => {
    if (lang === 'en-GB') { setT(null); return; } // page is authored in en-GB
    // __BUILD_ID__ is injected by Vite (define) — cache-busts after each deploy
    fetch(`/translations/meals-translations.json?v=${typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : 'dev'}`)
      .then((r) => r.json())
      .then((data) => setT(data[lang] || null))
      .catch(() => {});
  }, [lang]);

  // SEO — title + meta description
  // description MUST match ROUTE_META['/devocean-lodge-meals'].description in _middleware.js exactly
  const localTitle = getMealsTitle(lang);
  const localDescription = getMealsDescription(lang);
  useSeoPage({
    title: localTitle,
    description: localDescription,
    canonical: 'https://devoceanlodge.com/devocean-lodge-meals',
    ogTitle: localTitle,
    ogDescription: localDescription,
    ogImage: 'https://devoceanlodge.com/photos/gallery/04-desktop.webp',
    ogUrl: 'https://devoceanlodge.com/devocean-lodge-meals',
    ogType: 'website',
    twitterTitle: localTitle,
    twitterDescription: localDescription,
    twitterImage: 'https://devoceanlodge.com/photos/gallery/04-desktop.webp',
  });


  return (
    <div className="meals-page">
      <main>
        <div className="wrap">

          {/* Hero */}
          <div className="hero">
            <span className="eyebrow">
              {g(t, 'hero.eyebrow', 'Food & Dining · DEVOCEAN Lodge')}
            </span>
            <h1
              dangerouslySetInnerHTML={{
                __html: g(
                  t,
                  'hero.title',
                  'Breakfast included.<br/><span>Dinner prepared for you on demand.</span>',
                ),
              }}
            />
            <p>
              {g(
                t,
                'hero.lead',
                'Every stay at DEVOCEAN Lodge includes breakfast, served in our tropical garden. In the evening, resident guests can pre-order a freshly prepared dinner from our in-house restaurant.',
              )}
            </p>
          </div>

          <div className="hero-img">
            <img
              src="/photos/gallery/04-desktop.webp"
              alt="Breakfast served in the garden at DEVOCEAN Lodge, Ponta do Ouro"
              width="900"
              height="394"
              loading="eager"
            />
          </div>

          {/* Key facts */}
          <div className="facts" aria-label="Meal key facts">
            <div className="fact"><span className="fact-dot green" aria-hidden="true" /> <span>{g(t, 'facts.included', 'Breakfast included')}</span></div>
            <div className="fact"><span className="fact-dot" aria-hidden="true" /> <span>{g(t, 'facts.served', 'Served 08:30–11:00')}</span></div>
            <div className="fact"><span className="fact-dot teal" aria-hidden="true" /> <span>{g(t, 'facts.flexible', 'Earlier or later by arrangement')}</span></div>
            <div className="fact"><span className="fact-dot" aria-hidden="true" /> <span>{g(t, 'facts.dinner', 'Dinner by pre-order')}</span></div>
            <div className="fact"><span className="fact-dot teal" aria-hidden="true" /> <span>{g(t, 'facts.residents', 'Resident guests only')}</span></div>
          </div>

          <hr className="divider" />

          {/* Breakfast */}
          <section className="section" aria-labelledby="breakfast-title">
            <h2 className="section-title" id="breakfast-title">
              <span>{g(t, 'breakfast.title', 'Breakfast in the Garden')}</span>
              <span className="badge">{g(t, 'breakfast.badge', 'Included')}</span>
            </h2>
            <p dangerouslySetInnerHTML={{ __html: g(t, 'breakfast.p1', 'Breakfast is <strong>included in your accommodation rate</strong> and is normally served between 08:30 and 11:00 in the tropical garden.') }} />
            <p>{g(t, 'breakfast.p2', 'Guests can choose from our breakfast menu, with both cooked and lighter options. Fresh Portuguese bread is served daily, accompanied by coffee, tea or hot chocolate.')}</p>
            <div className="highlight-box">
              <h3>{g(t, 'breakfast.boxTitle', 'Early dive or dolphin swim?')}</h3>
              <p dangerouslySetInnerHTML={{ __html: g(t, 'breakfast.boxText', 'If you have an early departure, dive trip, dolphin swim or other morning activity, please speak with us beforehand. An <strong>earlier or later breakfast can usually be arranged</strong>.') }} />
            </div>
          </section>

          {/* Dinner */}
          <section className="section" aria-labelledby="dinner-title">
            <h2 className="section-title" id="dinner-title">
              <span>{g(t, 'dinner.title', 'Dinner at DEVOCEAN')}</span>
              <span className="badge">{g(t, 'dinner.badge', 'Pre-order')}</span>
            </h2>
            <p dangerouslySetInnerHTML={{ __html: g(t, 'dinner.p1', 'Our in-house restaurant prepares dinner <strong>exclusively for guests staying at the lodge</strong>. Meals are prepared to order using ingredients purchased fresh each day, so the available choices may vary.') }} />
            <p dangerouslySetInnerHTML={{ __html: g(t, 'dinner.p2', 'Please order in advance — preferably earlier in the day. <strong>The latest time for placing a dinner order is 20:00</strong>, and the kitchen closes at 21:00.') }} />
            <p>{g(t, 'dinner.p3', 'Because we cook specifically for the guests who order, we can concentrate on freshness and quality while avoiding unnecessary food waste.')}</p>
            <div className="grid-2">
              <div className="card">
                <h3>{g(t, 'dinner.orderTitle', 'How to order')}</h3>
                <ul>
                  <li>{g(t, 'dinner.order1', 'Let us know your dinner choice during the day')}</li>
                  <li>{g(t, 'dinner.order2', 'Latest order time: 20:00')}</li>
                  <li>{g(t, 'dinner.order3', 'Kitchen closes: 21:00')}</li>
                  <li>{g(t, 'dinner.order4', 'Choices may vary with daily market availability')}</li>
                  <li>{g(t, 'dinner.order5', 'Prepared fresh to order — no set menu')}</li>
                </ul>
              </div>
              <div className="card">
                <h3>{g(t, 'dinner.residentsTitle', 'Resident guests only')}</h3>
                <p>{g(t, 'dinner.residentsText', 'Dinner service is reserved for guests staying at DEVOCEAN Lodge. We do not offer the kitchen to outside visitors. This lets us focus entirely on freshness and quality for the guests in our care.')}</p>
              </div>
            </div>
          </section>

          {/* Drinks */}
          <section className="section" aria-labelledby="drinks-title">
            <h2 className="section-title" id="drinks-title">{g(t, 'drinks.title', 'Drinks & Guest Facilities')}</h2>
            <p>{g(t, 'drinks.intro', 'Throughout your stay, the following are available to all guests:')}</p>
            <div className="grid-2">
              <div className="card">
                <h3>{g(t, 'drinks.hotTitle', 'Hot drinks')}</h3>
                <p>{g(t, 'drinks.hotText', 'Coffee, tea and hot chocolate are available at the lodge throughout the day.')}</p>
              </div>
              <div className="card">
                <h3>{g(t, 'drinks.sharedTitle', 'Shared facilities')}</h3>
                <ul>
                  <li>{g(t, 'drinks.shared1', 'Shared refrigerator for guest use')}</li>
                  <li>{g(t, 'drinks.shared2', 'Filtered-water fountain — refill your bottle at any time')}</li>
                  <li>{g(t, 'drinks.shared3', 'Honesty bar with a selection of cold drinks')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Dietary */}
          <section className="section" aria-labelledby="dietary-title">
            <h2 className="section-title" id="dietary-title">{g(t, 'dietary.title', 'Dietary Requirements')}</h2>
            <p dangerouslySetInnerHTML={{ __html: g(t, 'dietary.p1', 'Please tell us about any <strong>vegetarian, vegan or other dietary requirements</strong> before arrival, or as early as possible during your stay. Our kitchen is small and local supplies vary, but we will always explain honestly what we can accommodate.') }} />
            <p>{g(t, 'dietary.p2', 'The earlier we know, the better we can plan around what is available locally on the day.')}</p>
          </section>

          {/* Lunch */}
          <section className="section" aria-labelledby="lunch-title">
            <h2 className="section-title" id="lunch-title">{g(t, 'lunch.title', 'Lunch')}</h2>
            <p dangerouslySetInnerHTML={{ __html: g(t, 'lunch.p1', 'DEVOCEAN Lodge does not operate a regular lunch service. Ponta do Ouro has numerous cafés, beach bars and restaurants within walking distance of the lodge. We are happy to suggest places based on what is <strong>currently open and what you would like to eat</strong> — just ask us or Marin.') }} />
          </section>

          <hr className="divider" />

          {/* FAQ */}
          <section className="section" aria-labelledby="faq-title">
            <h2 className="section-title" id="faq-title">{g(t, 'faq.title', 'Frequently Asked Questions')}</h2>
            <ul className="faq-list">
              {[
                ['faq.q1', 'Is breakfast included?',                       'faq.a1', 'Yes. Breakfast is included in the accommodation rate for all stays.'],
                ['faq.q2', 'What time is breakfast served?',               'faq.a2', 'Breakfast is normally served from 08:30 until 11:00. Earlier or later service can often be arranged when requested beforehand — for example, for an early dive or dolphin swim departure.'],
                ['faq.q3', 'Can I have dinner at the lodge?',              'faq.a3', 'Yes. Resident guests can order dinner from our in-house restaurant. Please order in advance and no later than 20:00. The kitchen closes at 21:00.'],
                ['faq.q4', 'Is the kitchen open to outside visitors?',     'faq.a4', 'No. Our meal service is reserved for guests staying at DEVOCEAN Lodge.'],
                ['faq.q5', 'Do you serve lunch?',                          'faq.a5', 'We do not offer regular lunch service. We are happy to suggest nearby cafés and restaurants based on what is currently open and what you would like to eat.'],
                ['faq.q6', 'Can you accommodate dietary requirements?',    'faq.a6', 'Often, yes. Please advise us beforehand so that we can confirm what can be prepared with the ingredients available locally. Our kitchen is small and local supplies vary, but we will always be honest about what we can accommodate.'],
              ].map(([qk, qfb, ak, afb]) => (
                <li key={qk} className="faq-item">
                  <div className="faq-q">{g(t, qk, qfb)}</div>
                  <div className="faq-a">{g(t, ak, afb)}</div>
                </li>
              ))}
            </ul>
          </section>

          {/* Related guides */}
          <section className="section" aria-labelledby="guides-title">
            <h2 className="section-title" id="guides-title">{g(t, 'guides.title', 'More Useful Guides')}</h2>
            <div className="related">
              <a href="/ponta-do-ouro-accommodation" className="related-link">{g(t, 'guides.link1', 'All accommodation at DEVOCEAN Lodge')}</a>
              <a href="/getting-to-ponta-do-ouro" className="related-link">{g(t, 'guides.link2', 'Getting to Ponta do Ouro')}</a>
              <a href="/ponta-do-ouro-without-4x4" className="related-link">{g(t, 'guides.link3', 'Visiting without a 4×4')}</a>
              <a href="/ponta-do-ouro" className="related-link">{g(t, 'guides.link4', 'Ponta do Ouro travel guide')}</a>
            </div>
          </section>

          {/* CTA */}
          <div className="cta">
            <h2>{g(t, 'cta.title', 'Stay with Breakfast Included')}</h2>
            <p>{g(t, 'cta.text', 'Check current rates, availability and accommodation options directly through our website. Breakfast is included with every stay.')}</p>
            <div className="btn-row">
              <a href={bookUrl} className="mbtn mbtn-primary">{g(t, 'cta.check', 'Check Availability →')}</a>
              <a href="/ponta-do-ouro-accommodation" className="mbtn mbtn-secondary">{g(t, 'cta.view', 'View Accommodation')}</a>
            </div>
            <p style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.8)' }}>
                {g(t, 'cta.ask', 'Questions about meals or dietary needs? Ask Marin')}
              </span>
              <button
                type="button"
                onClick={() => window.dvAsk?.()}
                aria-label="Ask Marin"
                style={{ width: 48, height: 48, borderRadius: '50%', background: '#f97316', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(249,115,22,0.4)', flexShrink: 0 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            </p>
          </div>

        </div>
      </main>

      <footer className="page-footer">
        <p>
          &copy; 2026 <a href="/">DEVOCEAN Lodge</a>, Ponta do Ouro, Mozambique &mdash;{' '}
          <a href="/legal/privacy.html">Privacy</a> &middot; <a href="/legal/terms.html">Terms</a>
        </p>
      </footer>
    </div>
  );
}
