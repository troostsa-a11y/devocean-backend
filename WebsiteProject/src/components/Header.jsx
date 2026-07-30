import { useState, memo } from 'react';
import { useLocation } from 'wouter';
import { Menu, Globe2 } from 'lucide-react';

import { IMG } from '../data/content';
import { trackBookingSession } from '../utils/analytics';
import LazyImage from './LazyImage';

function Header({ ui, lang, currency, region, onLangChange, onRegionChange, bookUrl }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  // Define regions with metadata (currency auto-assigned by IP, not selectable)
  const regions = {
    westEu: { name: 'Western Europe', languages: ['en-GB', 'pt-PT', 'nl-NL', 'fr-FR', 'it-IT', 'de-DE', 'es-ES', 'sv'] },
    eastEu: { name: 'Eastern Europe', languages: ['pl', 'ro', 'sr', 'hr', 'cs'] },
    asia: { name: 'Asia', languages: ['en-GB', 'ja-JP', 'zh-CN', 'ru', 'tr'] },
    americas: { name: 'Americas', languages: ['en-US', 'pt-BR', 'es-ES', 'fr-FR'] },
    africa: { name: 'Africa', languages: ['en-GB', 'fr-FR', 'pt-BR', 'af-ZA', 'zu', 'sw'] },
    oceania: { name: 'Oceania', languages: ['en-GB'] }
  };

  const handleRegionChange = (newRegion) => {
    onRegionChange(newRegion);
    if (!regions[newRegion].languages.includes(lang)) {
      const fallback = regions[newRegion].languages[0] || 'en-GB';
      onLangChange(fallback);
    }
  };

  // Detect if we're on an experience detail page - use Wouter's location
  const isExperiencePage = location.startsWith('/experiences/');

  // Detect if we're on a standalone HTML page (not index.html)
  // These pages include: safari.html, comfort.html, cottage.html, chalet.html, story.html, etc.
  const isBookDirectPage = typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/book-direct');
  const isStandalonePage = typeof window !== 'undefined' &&
    window.location.pathname !== '/' &&
    window.location.pathname !== '/index.html' &&
    !window.location.pathname.startsWith('/experiences/');

  const handleNavClick = (e, href) => {
    const id = href.startsWith('#') ? href.slice(1) : '';
    const el = id ? document.getElementById(id) : null;

    if (el) {
      e.preventDefault();
      const rectTop = el.getBoundingClientRect().top + window.scrollY;
      const stackH = document.documentElement.style.getPropertyValue('--stack-h');
      const offset = parseFloat(stackH) || (window.innerWidth < 768 ? 96 : 104);
      window.scrollTo({ top: Math.max(0, rectTop - offset), behavior: 'smooth' });

      if (location === '/') {
        const newUrl = `${window.location.pathname}${window.location.search}#${id}`;
        window.history.replaceState({}, '', newUrl);
      }
    }

    setMenuOpen(false);
  };

  // Shared Book Now click handler
  const handleBookClick = (buttonLocation) => {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'reservation_initiated',
        button_location: buttonLocation,
        language: lang,
        currency: currency
      });
    }
    trackBookingSession(lang, currency);
  };

  return (
    <>
      {/* Top bar — language/region dropdowns left, Book Now right */}
      <div id="nav-stack" className="topbar bg-[#9e4b13] text-white border-b border-[#8a4211]">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-sm">

          {/* Left: continent + language selectors */}
          <div className="flex items-center gap-1.5">
            <Globe2 size={16} className="hidden sm:block shrink-0 opacity-80" />
            <select
              value={region}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="border border-white/40 rounded pl-1 pr-2 py-1 w-[130px] text-white bg-transparent text-sm"
              aria-label="Select region"
            >
              {Object.entries(regions).map(([key]) => (
                <option key={key} value={key} className="text-slate-800">
                  {ui.regions[key]}
                </option>
              ))}
            </select>

            <select
              value={lang}
              onChange={(e) => onLangChange(e.target.value)}
              className="border border-white/40 rounded pl-1 pr-2 py-1 w-[93px] text-white bg-transparent text-sm"
              aria-label="Select language"
            >
              {regions[region]?.languages.includes('en-US') && <option value="en-US" className="text-slate-800">English</option>}
              {regions[region]?.languages.includes('en-GB') && <option value="en-GB" className="text-slate-800">English</option>}
              {regions[region]?.languages.includes('pt-PT') && <option value="pt-PT" className="text-slate-800">Português</option>}
              {regions[region]?.languages.includes('pt-BR') && <option value="pt-BR" className="text-slate-800">Português</option>}
              {regions[region]?.languages.includes('nl-NL') && <option value="nl-NL" className="text-slate-800">Nederlands</option>}
              {regions[region]?.languages.includes('fr-FR') && <option value="fr-FR" className="text-slate-800">Français</option>}
              {regions[region]?.languages.includes('it-IT') && <option value="it-IT" className="text-slate-800">Italiano</option>}
              {regions[region]?.languages.includes('de-DE') && <option value="de-DE" className="text-slate-800">Deutsch</option>}
              {regions[region]?.languages.includes('es-ES') && <option value="es-ES" className="text-slate-800">Español</option>}
              {regions[region]?.languages.includes('sv')    && <option value="sv"    className="text-slate-800">Svenska</option>}
              {regions[region]?.languages.includes('pl')    && <option value="pl"    className="text-slate-800">Polski</option>}
              {regions[region]?.languages.includes('ro')    && <option value="ro"    className="text-slate-800">Română</option>}
              {regions[region]?.languages.includes('sr')    && <option value="sr"    className="text-slate-800">Srpski</option>}
              {regions[region]?.languages.includes('hr')    && <option value="hr"    className="text-slate-800">Hrvatski</option>}
              {regions[region]?.languages.includes('cs')    && <option value="cs"    className="text-slate-800">Čeština</option>}
              {regions[region]?.languages.includes('tr')    && <option value="tr"    className="text-slate-800">Türkçe</option>}
              {regions[region]?.languages.includes('af-ZA') && <option value="af-ZA" className="text-slate-800">Afrikaans</option>}
              {regions[region]?.languages.includes('zu')    && <option value="zu"    className="text-slate-800">isiZulu</option>}
              {regions[region]?.languages.includes('sw')    && <option value="sw"    className="text-slate-800">Kiswahili</option>}
              {regions[region]?.languages.includes('ru')    && <option value="ru"    className="text-slate-800">Русский</option>}
              {regions[region]?.languages.includes('ja-JP') && <option value="ja-JP" className="text-slate-800">日本語</option>}
              {regions[region]?.languages.includes('zh-CN') && <option value="zh-CN" className="text-slate-800">中文</option>}
            </select>
          </div>

          {/* Right: Book Now (hidden on the booking page itself) */}
          {!isBookDirectPage && (
            <a
              href={bookUrl}
              className="inline-flex items-center justify-center px-2 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm rounded-lg border border-white text-white font-semibold whitespace-nowrap hover:bg-white/10 transition-colors"
              onClick={() => handleBookClick('topbar')}
            >
              {ui.contact.bookNow}
            </a>
          )}
        </div>
      </div>

      {/* Main header */}
      <header className="fixed top-[var(--topbar-h)] left-0 right-0 z-50 bg-white border-b">
        <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href={(isExperiencePage || isStandalonePage) ? `/?lang=${lang}#home` : '#home'}
              className="flex items-center gap-3 text-slate-800"
              onClick={(isExperiencePage || isStandalonePage) ? undefined : (e) => handleNavClick(e, '#home')}
              data-testid="link-home-logo"
            >
              <LazyImage
                srcWebP="/images/devocean_logo_header-small.webp"
                alt="DEVOCEAN Lodge"
                className="h-9 w-9 rounded-full object-cover"
                loading="eager"
              />
              <span className="font-semibold">DEVOCEAN Lodge</span>
            </a>
          </div>

          {/* Desktop nav — Home · Our Story · Stay · Food · Explore Ponta · Gallery · Location · Contact */}
          <ul className="hidden lg:flex items-center gap-4">

            {/* Home */}
            <li>
              <a
                href={(isExperiencePage || isStandalonePage) ? `/?lang=${lang}#home` : '#home'}
                className="text-slate-700 hover:text-[#9e4b13] whitespace-nowrap"
                onClick={(isExperiencePage || isStandalonePage) ? undefined : (e) => handleNavClick(e, '#home')}
              >
                {ui.nav.home}
              </a>
            </li>

            {/* Our Story */}
            <li>
              <a
                href={`/story?lang=${lang}`}
                className="text-slate-700 hover:text-[#9e4b13] whitespace-nowrap"
              >
                {ui.stay?.ourStory || "Our Story"}
              </a>
            </li>

            {/* Stay */}
            <li>
              <a
                href={(isExperiencePage || isStandalonePage) ? `/?lang=${lang}#stay` : '#stay'}
                className="text-slate-700 hover:text-[#9e4b13] whitespace-nowrap"
                onClick={(isExperiencePage || isStandalonePage) ? undefined : (e) => handleNavClick(e, '#stay')}
              >
                {ui.nav.stay}
              </a>
            </li>

            {/* Food */}
            <li>
              <a
                href={`/devocean-lodge-meals?lang=${lang}`}
                className="text-slate-700 hover:text-[#9e4b13] whitespace-nowrap"
              >
                {ui.nav?.food || "Food"}
              </a>
            </li>

            {/* Explore Ponta · Gallery · Location · Contact */}
            {[
              ["experiences", "#experiences"],
              ["gallery",     "#gallery"],
              ["location",    "#location"],
              ["contact",     "#contact"],
            ].map(([k, href]) => (
              <li key={k}>
                <a
                  href={(isExperiencePage || isStandalonePage) ? `/?lang=${lang}${href}` : href}
                  className="text-slate-700 hover:text-[#9e4b13] whitespace-nowrap"
                  onClick={(isExperiencePage || isStandalonePage) ? undefined : (e) => handleNavClick(e, href)}
                >
                  {ui.nav[k]}
                </a>
              </li>
            ))}
          </ul>

          {/* Burger (mobile & tablet) */}
          <div className="lg:hidden relative">
            <button
              data-testid="button-mobile-menu"
              className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#9e4b13] text-white hover:bg-[#8a4211] transition-all shadow-md hover:shadow-lg"
              onClick={() => setMenuOpen(v => !v)}
              aria-expanded={menuOpen}
              aria-controls="mnav"
              aria-label="Toggle menu"
            >
              <Menu className={`transition-transform ${menuOpen ? 'rotate-90' : ''}`} />
              <span className="text-sm font-semibold hidden sm:inline-flex">{ui.menu}</span>
            </button>

            {/* Mobile/Tablet dropdown menu — always in DOM, CSS transform prevents layout thrash */}
            <div
              id="mnav"
              data-testid="menu-mobile-nav"
              className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50 transition-all duration-200 origin-top-right"
              style={{
                transform: menuOpen ? 'scale(1)' : 'scale(0.95)',
                opacity: menuOpen ? 1 : 0,
                pointerEvents: menuOpen ? 'auto' : 'none',
                visibility: menuOpen ? 'visible' : 'hidden',
                willChange: 'transform, opacity',
              }}
              inert={menuOpen ? undefined : ''}
            >
              {/* Home */}
              <a
                href={(isExperiencePage || isStandalonePage) ? `/?lang=${lang}#home` : "#home"}
                data-testid="link-mobile-home"
                className="block px-5 py-3 text-slate-700 hover:bg-[#fffaf6] border-b border-gray-100 transition-colors"
                onClick={(isExperiencePage || isStandalonePage) ? () => setMenuOpen(false) : (e) => handleNavClick(e, "#home")}
                tabIndex={menuOpen ? 0 : -1}
              >
                {ui.nav.home}
              </a>

              {/* Our Story */}
              <a
                href={`/story?lang=${lang}`}
                data-testid="link-mobile-story"
                className="block px-5 py-3 text-slate-700 hover:bg-[#fffaf6] border-b border-gray-100 transition-colors"
                onClick={() => setMenuOpen(false)}
                tabIndex={menuOpen ? 0 : -1}
              >
                {ui.stay?.ourStory || "Our Story"}
              </a>

              {/* Stay */}
              <a
                href={(isExperiencePage || isStandalonePage) ? `/?lang=${lang}#stay` : "#stay"}
                data-testid="link-mobile-stay"
                className="block px-5 py-3 text-slate-700 hover:bg-[#fffaf6] border-b border-gray-100 transition-colors"
                onClick={(isExperiencePage || isStandalonePage) ? () => setMenuOpen(false) : (e) => handleNavClick(e, "#stay")}
                tabIndex={menuOpen ? 0 : -1}
              >
                {ui.nav.stay}
              </a>

              {/* Food */}
              <a
                href={`/devocean-lodge-meals?lang=${lang}`}
                data-testid="link-mobile-food"
                className="block px-5 py-3 text-slate-700 hover:bg-[#fffaf6] border-b border-gray-100 transition-colors"
                onClick={() => setMenuOpen(false)}
                tabIndex={menuOpen ? 0 : -1}
              >
                {ui.nav?.food || "Food"}
              </a>

              {/* Explore Ponta · Gallery · Location · Contact */}
              {[
                ["experiences", "#experiences"],
                ["gallery",     "#gallery"],
                ["location",    "#location"],
                ["contact",     "#contact"],
              ].map(([k, href]) => (
                <a
                  key={k}
                  href={(isExperiencePage || isStandalonePage) ? `/?lang=${lang}${href}` : href}
                  data-testid={`link-mobile-${k}`}
                  className="block px-5 py-3 text-slate-700 hover:bg-[#fffaf6] border-b border-gray-100 transition-colors"
                  onClick={(isExperiencePage || isStandalonePage) ? () => setMenuOpen(false) : (e) => handleNavClick(e, href)}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  {ui.nav[k]}
                </a>
              ))}

              {/* Book Now (hidden on the booking page itself) */}
              {!isBookDirectPage && (
              <div className="p-3">
                <a
                  href={bookUrl}
                  data-testid="button-mobile-book-now"
                  className="block text-center btn-cta px-4 py-2.5 rounded-xl bg-[#9e4b13] text-white hover:bg-[#8a4211] transition-colors font-semibold shadow-md"
                  onClick={() => {
                    setMenuOpen(false);
                    handleBookClick('mobile_nav_drawer');
                  }}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  {ui.contact.bookNow}
                </a>
              </div>
              )}
            </div>
          </div>
        </nav>

        {/* Backdrop — always in DOM, fades in/out without mount cost */}
        <div
          className="lg:hidden fixed inset-0 z-40 transition-opacity duration-200"
          style={{
            opacity: menuOpen ? 1 : 0,
            pointerEvents: menuOpen ? 'auto' : 'none',
            background: 'rgba(0,0,0,0.2)',
          }}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      </header>
    </>
  );
}

// Memoize Header to prevent unnecessary re-renders (improves INP)
export default memo(Header);
