import { useState, memo } from 'react';
import { useLocation } from 'wouter';
import { Menu, Phone, Mail, Globe2 } from 'lucide-react';

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.22 8.22 0 012.41 5.82c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.19-.32a8.188 8.188 0 01-1.26-4.37c.01-4.54 3.7-8.24 8.24-8.24zm-3.6 4.28c-.18 0-.46.07-.7.33-.24.26-.91.89-.91 2.17 0 1.28.93 2.52 1.06 2.7.13.17 1.83 2.79 4.43 3.91.62.27 1.1.43 1.48.55.62.2 1.19.17 1.63.1.5-.07 1.53-.63 1.75-1.23.22-.61.22-1.13.15-1.24-.06-.11-.24-.17-.5-.3-.26-.13-1.54-.76-1.78-.84-.24-.09-.41-.13-.58.13-.17.26-.66.84-.81 1.01-.15.17-.3.19-.56.06-.26-.12-1.1-.41-2.09-1.3-.77-.69-1.29-1.54-1.44-1.8-.15-.26-.02-.4.11-.53.12-.11.26-.3.39-.45.13-.15.17-.26.26-.44.09-.17.04-.32-.02-.45-.06-.13-.58-1.4-.8-1.91-.21-.5-.43-.43-.59-.44-.15 0-.32-.01-.5-.01z"/>
    </svg>
  );
}
import { IMG } from '../data/content';
import { trackBookingSession } from '../utils/analytics';
import LazyImage from './LazyImage';

function Header({ ui, lang, currency, region, onLangChange, onRegionChange, bookUrl }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);
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
    
    // If current language is not available in the new region, switch to the
    // first language in that region (e.g. East-EU → Polish), falling back to English.
    if (!regions[newRegion].languages.includes(lang)) {
      const fallback = regions[newRegion].languages[0] || 'en-GB';
      onLangChange(fallback);
    }
  };

  // Detect if we're on an experience detail page - use Wouter's location
  const isExperiencePage = location.startsWith('/experiences/');
  
  // Detect if we're on a standalone HTML page (not index.html)
  // These pages include: safari.html, comfort.html, cottage.html, chalet.html, story.html, etc.
  const isStandalonePage = typeof window !== 'undefined' && 
    window.location.pathname !== '/' && 
    window.location.pathname !== '/index.html' &&
    !window.location.pathname.startsWith('/experiences/');

  const handleNavClick = (e, href) => {
    // On homepage, do smooth scroll to section
    const id = href.startsWith('#') ? href.slice(1) : '';
    const el = id ? document.getElementById(id) : null;

    if (el) {
      e.preventDefault();
      const rectTop = el.getBoundingClientRect().top + window.scrollY;
      // Read cached CSS variable (avoids forced reflow vs getComputedStyle)
      const stackH = document.documentElement.style.getPropertyValue('--stack-h');
      const offset = parseFloat(stackH) || (window.innerWidth < 768 ? 96 : 104);
      window.scrollTo({ top: Math.max(0, rectTop - offset), behavior: 'smooth' });

      // Only update history if we're on the homepage
      if (location === '/') {
        const newUrl = `${window.location.pathname}${window.location.search}#${id}`;
        window.history.replaceState({}, '', newUrl);
      }
    }
    
    setMenuOpen(false);
  };

  return (
    <>
      {/* Top bar with contact & language/currency */}
      <div id="nav-stack" className="topbar bg-[#9e4b13] text-white border-b border-[#8a4211]">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
          {/* Desktop: Full contact info */}
          <div className="hidden lg:flex items-center gap-4">
            <a 
              href="https://wa.me/258844182252" 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-1"
              onClick={() => {
                if (window.dataLayer) {
                  window.dataLayer.push({
                    event: 'whatsapp_click',
                    button_location: 'header_desktop',
                    page_path: window.location.pathname,
                    language: lang,
                    currency: currency,
                    contact_method: 'whatsapp'
                  });
                }
              }}
            >
              <WhatsAppIcon /> +258 84 418 2252
            </a>
            <a href="mailto:info@devoceanlodge.com" className="flex items-center gap-1">
              <Mail size={20} /> info@devoceanlodge.com
            </a>
          </div>

          {/* Mobile/Tablet: Icon-only contact */}
          <div className="flex lg:hidden items-center gap-3">
            <a 
              href="https://wa.me/258844182252" 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-1" 
              aria-label="WhatsApp"
              onClick={() => {
                if (window.dataLayer) {
                  window.dataLayer.push({
                    event: 'whatsapp_click',
                    button_location: 'header_mobile',
                    page_path: window.location.pathname,
                    language: lang,
                    currency: currency,
                    contact_method: 'whatsapp'
                  });
                }
              }}
            >
              <WhatsAppIcon />
            </a>
            <a href="mailto:info@devoceanlodge.com" className="flex items-center gap-1" aria-label="Email">
              <Mail size={20} />
            </a>
          </div>

          <div className="flex items-center gap-1.5">
            <Globe2 size={20} />
            {/* Region selector - same width as language dropdown */}
            <select
              value={region}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="border border-white/40 rounded px-2 py-1 w-[140px] text-white"
              aria-label="Select region"
            >
              {Object.entries(regions).map(([key]) => (
                <option key={key} value={key}>
                  {ui.regions[key]}
                </option>
              ))}
            </select>

            {/* Language selector */}
            <select
              value={lang}
              onChange={(e) => onLangChange(e.target.value)}
              className="border border-white/40 rounded px-2 py-1 w-[93px] text-white"
              aria-label="Select language"
            >
              {regions[region]?.languages.includes('en-US') && <option value="en-US">English</option>}
              {regions[region]?.languages.includes('en-GB') && <option value="en-GB">English</option>}
              {regions[region]?.languages.includes('pt-PT') && <option value="pt-PT">Português</option>}
              {regions[region]?.languages.includes('pt-BR') && <option value="pt-BR">Português</option>}
              {regions[region]?.languages.includes('nl-NL') && <option value="nl-NL">Nederlands</option>}
              {regions[region]?.languages.includes('fr-FR') && <option value="fr-FR">Français</option>}
              {regions[region]?.languages.includes('it-IT') && <option value="it-IT">Italiano</option>}
              {regions[region]?.languages.includes('de-DE') && <option value="de-DE">Deutsch</option>}
              {regions[region]?.languages.includes('es-ES') && <option value="es-ES">Español</option>}
              {regions[region]?.languages.includes('sv') && <option value="sv">Svenska</option>}
              {regions[region]?.languages.includes('pl') && <option value="pl">Polski</option>}
              {regions[region]?.languages.includes('ro') && <option value="ro">Română</option>}
              {regions[region]?.languages.includes('sr') && <option value="sr">Srpski</option>}
              {regions[region]?.languages.includes('hr') && <option value="hr">Hrvatski</option>}
              {regions[region]?.languages.includes('cs') && <option value="cs">Čeština</option>}
              {regions[region]?.languages.includes('tr') && <option value="tr">Türkçe</option>}
              {regions[region]?.languages.includes('af-ZA') && <option value="af-ZA">Afrikaans</option>}
              {regions[region]?.languages.includes('zu') && <option value="zu">isiZulu</option>}
              {regions[region]?.languages.includes('sw') && <option value="sw">Kiswahili</option>}
              {regions[region]?.languages.includes('ru') && <option value="ru">Русский</option>}
              {regions[region]?.languages.includes('ja-JP') && <option value="ja-JP">日本語</option>}
              {regions[region]?.languages.includes('zh-CN') && <option value="zh-CN">中文</option>}
            </select>
          </div>
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

          {/* Desktop nav (large screens only) */}
          <ul className={`hidden lg:flex items-center ${lang === 'ru' || lang === 'zu' ? 'gap-3 text-sm' : 'gap-6'}`}>
            {[
              ["home", "#home"],
              ["stay", "#stay"],
              ["experiences", "#experiences"],
              ["todo", "#todo"],
              ["gallery", "#gallery"],
              ["location", "#location"],
              ["contact", "#contact"],
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
            <li>
              <a
                href={bookUrl}
                className={`btn-cta inline-flex items-center justify-center w-[15rem] ${lang === 'ru' || lang === 'zu' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} rounded-xl bg-[#9e4b13] text-white whitespace-nowrap`}
                onClick={() => {
                  if (window.dataLayer) {
                    window.dataLayer.push({
                      event: 'reservation_initiated',
                      button_location: 'desktop_nav_header',
                      language: lang,
                      currency: currency
                    });
                  }
                  trackBookingSession(lang, currency);
                }}
              >
                {ui.contact.bookNow}
              </a>
            </li>
          </ul>

          {/* Burger (mobile & tablet) - Enhanced visibility */}
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

            {/* Mobile/Tablet dropdown menu — always in DOM, CSS transform prevents layout thrash on open/close */}
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
              <a
                href={(isExperiencePage || isStandalonePage) ? `/?lang=${lang}#home` : "#home"}
                data-testid="link-mobile-home"
                className="block px-5 py-3 text-slate-700 hover:bg-[#fffaf6] border-b border-gray-100 transition-colors"
                onClick={(isExperiencePage || isStandalonePage) ? () => setMenuOpen(false) : (e) => handleNavClick(e, "#home")}
                tabIndex={menuOpen ? 0 : -1}
              >
                {ui.nav.home}
              </a>
              <a
                href={`/story.html?lang=${lang}`}
                data-testid="link-mobile-story"
                className="block px-5 py-3 text-slate-700 hover:bg-[#fffaf6] border-b border-gray-100 transition-colors"
                onClick={() => setMenuOpen(false)}
                tabIndex={menuOpen ? 0 : -1}
              >
                {ui.stay?.ourStory || "Our Story"}
              </a>
              {[
                ["stay", "#stay"],
                ["experiences", "#experiences"],
                ["todo", "#todo"],
                ["gallery", "#gallery"],
                ["location", "#location"],
                ["contact", "#contact"],
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
              <div className="p-3">
                <a
                  href={bookUrl}
                  data-testid="button-mobile-book-now"
                  className="block text-center btn-cta px-4 py-2.5 rounded-xl bg-[#9e4b13] text-white hover:bg-[#8a4211] transition-colors font-semibold shadow-md"
                  onClick={() => {
                    setMenuOpen(false);
                    if (window.dataLayer) {
                      window.dataLayer.push({
                        event: 'reservation_initiated',
                        button_location: 'mobile_nav_drawer',
                        language: lang,
                        currency: currency
                      });
                    }
                    trackBookingSession(lang, currency);
                  }}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  {ui.contact.bookNow}
                </a>
              </div>
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
