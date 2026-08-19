import { useState, memo } from 'react';
import { useLocation } from 'wouter';
import { Menu } from 'lucide-react';
import LanguagePicker from './LanguagePicker.jsx';

// Preload lazy route chunks on hover/focus so the module is cached before the click.
// These mirror the lazy() calls in App.jsx — same module path hits the same browser cache.
const preloadStory = () => import('./StoryPage').catch(() => {});
const preloadMeals = () => import('./MealsPage').catch(() => {});

import { IMG } from '../data/content';
import { trackBookingSession } from '../utils/analytics';
import LazyImage from './LazyImage';

function Header({ ui, lang, currency, onLangChange, bookUrl }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, navigate] = useLocation();

  // SPA navigation — prevents full page reload for internal routes.
  // navigate() goes through the Router's useTransitionLocation hook so
  // startTransition activates and the old route stays on screen while
  // the new chunk loads (no blank intermediate frame).
  const handleSpaNav = (e, path) => {
    e.preventDefault();
    navigate(path);
    setMenuOpen(false);
  };

  // SPA navigate to / then scroll to a section.
  // navigate('/#section') issues a single history.pushState that retains the
  // hash, so App.jsx's route-change useEffect reads window.location.hash and
  // the tryScroll retry loop scrolls to the target — no full-page reload.
  const handleSpaNavToSection = (e, sectionId) => {
    e.preventDefault();
    navigate(`/#${sectionId}`);
    setMenuOpen(false);
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
        <div className="max-w-7xl mx-auto px-1.5 sm:px-4 py-2 flex items-center justify-between text-sm">

          {/* Left: searchable language picker */}
          <LanguagePicker lang={lang} onLangChange={onLangChange} />

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
              href={(isExperiencePage || isStandalonePage) ? '/' : '#home'}
              className="flex items-center gap-3 text-slate-800"
              onClick={(isExperiencePage || isStandalonePage) ? (e) => handleSpaNav(e, '/') : (e) => handleNavClick(e, '#home')}
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
                href={(isExperiencePage || isStandalonePage) ? '/' : '#home'}
                className="text-slate-700 hover:text-[#9e4b13] whitespace-nowrap"
                onClick={(isExperiencePage || isStandalonePage) ? (e) => handleSpaNav(e, '/') : (e) => handleNavClick(e, '#home')}
              >
                {ui.nav.home}
              </a>
            </li>

            {/* Our Story */}
            <li>
              <a
                href={'/story'}
                className="text-slate-700 hover:text-[#9e4b13] whitespace-nowrap"
                onClick={(e) => handleSpaNav(e, '/story')}
                onMouseEnter={preloadStory}
                onFocus={preloadStory}
                onTouchStart={preloadStory}
              >
                {ui.stay?.ourStory || "Our Story"}
              </a>
            </li>

            {/* Stay */}
            <li>
              <a
                href={(isExperiencePage || isStandalonePage) ? '/#stay' : '#stay'}
                className="text-slate-700 hover:text-[#9e4b13] whitespace-nowrap"
                onClick={(isExperiencePage || isStandalonePage) ? (e) => handleSpaNavToSection(e, 'stay') : (e) => handleNavClick(e, '#stay')}
              >
                {ui.nav.stay}
              </a>
            </li>

            {/* Food */}
            <li>
              <a
                href={'/devocean-lodge-meals'}
                className="text-slate-700 hover:text-[#9e4b13] whitespace-nowrap"
                onClick={(e) => handleSpaNav(e, '/devocean-lodge-meals')}
                onMouseEnter={preloadMeals}
                onFocus={preloadMeals}
                onTouchStart={preloadMeals}
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
                  href={(isExperiencePage || isStandalonePage) ? `/${href}` : href}
                  className="text-slate-700 hover:text-[#9e4b13] whitespace-nowrap"
                  onClick={(isExperiencePage || isStandalonePage) ? (e) => handleSpaNavToSection(e, href.slice(1)) : (e) => handleNavClick(e, href)}
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
                href={(isExperiencePage || isStandalonePage) ? '/' : "#home"}
                data-testid="link-mobile-home"
                className="block px-5 py-3 text-slate-700 hover:bg-[#fffaf6] border-b border-gray-100 transition-colors"
                onClick={(isExperiencePage || isStandalonePage) ? (e) => handleSpaNav(e, '/') : (e) => handleNavClick(e, "#home")}
                tabIndex={menuOpen ? 0 : -1}
              >
                {ui.nav.home}
              </a>

              {/* Our Story */}
              <a
                href={'/story'}
                data-testid="link-mobile-story"
                className="block px-5 py-3 text-slate-700 hover:bg-[#fffaf6] border-b border-gray-100 transition-colors"
                onClick={(e) => handleSpaNav(e, '/story')}
                onMouseEnter={preloadStory}
                onFocus={preloadStory}
                onTouchStart={preloadStory}
                tabIndex={menuOpen ? 0 : -1}
              >
                {ui.stay?.ourStory || "Our Story"}
              </a>

              {/* Stay */}
              <a
                href={(isExperiencePage || isStandalonePage) ? '/#stay' : "#stay"}
                data-testid="link-mobile-stay"
                className="block px-5 py-3 text-slate-700 hover:bg-[#fffaf6] border-b border-gray-100 transition-colors"
                onClick={(isExperiencePage || isStandalonePage) ? (e) => handleSpaNavToSection(e, 'stay') : (e) => handleNavClick(e, "#stay")}
                tabIndex={menuOpen ? 0 : -1}
              >
                {ui.nav.stay}
              </a>

              {/* Food */}
              <a
                href={'/devocean-lodge-meals'}
                data-testid="link-mobile-food"
                className="block px-5 py-3 text-slate-700 hover:bg-[#fffaf6] border-b border-gray-100 transition-colors"
                onClick={(e) => handleSpaNav(e, '/devocean-lodge-meals')}
                onMouseEnter={preloadMeals}
                onFocus={preloadMeals}
                onTouchStart={preloadMeals}
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
                  href={(isExperiencePage || isStandalonePage) ? `/${href}` : href}
                  data-testid={`link-mobile-${k}`}
                  className="block px-5 py-3 text-slate-700 hover:bg-[#fffaf6] border-b border-gray-100 transition-colors"
                  onClick={(isExperiencePage || isStandalonePage) ? (e) => handleSpaNavToSection(e, href.slice(1)) : (e) => handleNavClick(e, href)}
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
