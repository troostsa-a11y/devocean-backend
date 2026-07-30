import { useEffect, useState } from 'react';
import './StoryPage.css';


/** Resolve a dot-path like "hero.title" against the translations object. */
function g(t, path, fallback = '') {
  const val = path.split('.').reduce((o, k) => o?.[k], t);
  return val ?? fallback;
}

export default function StoryPage({ lang = 'en-GB', bookUrl = '/book-direct' }) {
  const [t, setT] = useState(null);

  // Load translations whenever lang changes
  useEffect(() => {
    fetch('/translations/story-translations-template.json')
      .then((r) => r.json())
      .then((data) => setT(data[lang] || data['en-GB']))
      .catch(() => {});
  }, [lang]);

  // SEO — title + meta description
  useEffect(() => {
    document.title = 'Our Story | DEVOCEAN Lodge';
    const meta = document.querySelector('meta[name="description"]');
    if (meta)
      meta.setAttribute(
        'content',
        "Discover DEVOCEAN Lodge's journey since 2015. Family-run, community-focused eco-lodge in Ponta do Ouro with plans for sustainable growth and local impact.",
      );
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', 'https://devoceanlodge.com/story');
  }, []);


  // Mark hero overlay as seen when visitor navigates back to the homepage
  // (prevents the 5s intro animation for returning visitors)
  const markHeroSeen = () => {
    try {
      sessionStorage.setItem('devocean-hero-seen', 'true');
      localStorage.setItem('devocean-hero-seen', 'true');
    } catch (_) {}
  };

  return (
    <div className="story-page">
      <main>
        <section className="dl-wrap" aria-label="Welcome to DEVOCEAN Lodge">
          {/* Hero */}
          <div className="dl-hero">
            <img
              src="/images/sustainability-partnership.png"
              alt="Sustainability Partnership"
              className="dl-hero-icon"
              loading="eager"
              fetchpriority="high"
            />
            <div className="dl-eyebrow">
              {g(t, 'hero.eyebrow', 'Since 2015 • Ponta do Ouro')}
            </div>
            <h1 className="dl-title">
              <span>{g(t, 'hero.title', 'Adventure meets sustainability')}</span>
              <br />
              <span>{g(t, 'hero.titleSpan', 'Your stay makes a difference.')}</span>
            </h1>
            <p className="dl-sub">
              {g(
                t,
                'hero.subtitle',
                'Family-run, community-focused, and growing with purpose. Book direct to support local projects — and enjoy a warm, effortless stay by the beach.',
              )}
            </p>
            <ul className="dl-proofs" role="list" aria-label="Reasons to book">
              <li>
                <span className="i-check" aria-hidden="true" />
                <span>{g(t, 'hero.proofPoints.support', 'Friendly, local support')}</span>
              </li>
              <li>
                <span className="i-check" aria-hidden="true" />
                <span>{g(t, 'hero.proofPoints.booking', 'Secure, hassle-free booking')}</span>
              </li>
              <li>
                <span className="i-check" aria-hidden="true" />
                <span>
                  {g(
                    t,
                    'hero.proofPoints.restaurant',
                    'Breakfast included · Dinner by pre-order',
                  )}
                </span>
              </li>
            </ul>
          </div>

          {/* Content grid */}
          <div className="dl-grid">
            <article className="dl-card">
              <h2 className="dl-h2">
                {g(t, 'cards.today.title', 'Today at DEVOCEAN Lodge')}
              </h2>
              <p
                dangerouslySetInnerHTML={{
                  __html: g(
                    t,
                    'cards.today.content',
                    'We offer <strong>9 unique accommodation options</strong>, blending adventure with comfort, while continually enhancing the guest experience together with our dedicated staff and the local community.',
                  ),
                }}
              />
            </article>

            <article className="dl-card">
              <h2 className="dl-h2">
                {g(t, 'cards.sotiba.title', 'Lake Sotiba Guest Farm')}
              </h2>
              <p
                dangerouslySetInnerHTML={{
                  __html: g(
                    t,
                    'cards.sotiba.content',
                    "Trusted by local leaders, we're developing a guest farm at <strong>Lake Sotiba</strong> — a hub for hands-on, sustainable practices in self-reliance and knowledge sharing.",
                  ),
                }}
              />
              <p>
                <a
                  href="https://earth.google.com/earth/d/1ciM9i62JNuZjuGklTSpgYC2z7_CsNN3J?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {g(t, 'cards.sotiba.linkText', 'View farm plan on Google Earth →')}
                </a>
              </p>
              <p>
                <a
                  href="https://aldeiasotiba.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ALDEIA Sotiba →
                </a>
              </p>
            </article>

            <article className="dl-card">
              <h2 className="dl-h2">
                {g(t, 'cards.farm.title', 'From our land to your plate')}
              </h2>
              <p
                dangerouslySetInnerHTML={{
                  __html: g(
                    t,
                    'cards.farm.content',
                    'Enjoy a breakfast included with every stay, and pre-order a freshly prepared dinner from our in-house kitchen.',
                  ),
                }}
              />
              <p>
                <a href="https://coopagri.org" target="_blank" rel="noopener noreferrer">
                  COOPAgri →
                </a>
              </p>
            </article>

            <article className="dl-card dl-card-impact">
              <h2 className="dl-h2">
                {g(t, 'cards.impact.title', 'Your stay creates impact')}
              </h2>
              <p>
                {g(
                  t,
                  'cards.impact.content',
                  'Every booking supports sustainable development and empowers the local community — bringing our vision of a flourishing, eco-conscious southern Mozambique to life.',
                )}
              </p>
            </article>
          </div>

          {/* CTA */}
          <div className="dl-cta">
            <h2>{g(t, 'cta.title', 'Ready to experience DEVOCEAN Lodge?')}</h2>
            <p>
              {g(
                t,
                'cta.subtitle',
                'Choose your perfect accommodation and start your sustainable beach adventure.',
              )}
            </p>
            <div className="dl-cta-buttons">
              <a
                href={bookUrl}
                className="dl-btn dl-btn-primary"
                data-testid="button-book-now"
              >
                {g(t, 'cta.bookButton', 'Book Your Stay')}
              </a>
              <a
                href="/#stay"
                className="dl-btn dl-btn-secondary"
                data-testid="link-view-accommodations"
                onClick={markHeroSeen}
              >
                {g(t, 'cta.viewButton', 'View Accommodations')}
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
