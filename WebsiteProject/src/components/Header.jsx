import { useState } from 'react';
import { Menu, Phone, Mail, Globe2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { IMG } from '../data/content';
import LazyImage from './LazyImage';

export default function Header({ ui, lang, currency, region, onLangChange, onRegionChange, bookUrl }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);

  // Define regions with metadata (currency auto-assigned by IP, not selectable)
  const regions = {
    europe: { name: 'Europe', languages: ['en-GB', 'pt-PT', 'nl-NL', 'fr-FR', 'it-IT', 'de-DE', 'es-ES', 'sv', 'pl'] },
    asia: { name: 'Asia', languages: ['en-GB', 'ja-JP', 'zh-CN', 'ru'] },
    americas: { name: 'Americas', languages: ['en-US', 'pt-BR', 'es-ES', 'fr-FR'] },
    africa: { name: 'Africa', languages: ['en-GB', 'fr-FR', 'pt-BR', 'af-ZA', 'zu', 'sw'] },
    oceania: { name: 'Oceania', languages: ['en-GB'] }
  };

  const handleRegionChange = (newRegion) => {
    onRegionChange(newRegion);
    
    // If current language is not available in the new region, switch to English
    if (!regions[newRegion].languages.includes(lang)) {
      onLangChange('en-GB');
    }
  };

  const handleAnchorNav = (e, href) => {
    // Let the browser handle smooth scrolling natively
    // The CSS scroll-margin-top will handle the offset
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
              <FaWhatsapp size={20} /> +258 84 418 2252
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
              <FaWhatsapp size={20} />
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
              className="border border-white/40 rounded px-2 py-1 w-[93px] text-white"
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
            <a href="#home" className="flex items-center gap-3">
              <LazyImage src={IMG.logo} alt="DEVOCEAN Lodge" className="h-9 w-9 rounded-full object-cover" loading="eager" />
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
                  href={href}
                  className="hover:text-[#9e4b13] whitespace-nowrap"
                >
                  {ui.nav[k]}
                </a>
              </li>
            ))}
            <li>
              <a
                href={bookUrl}
                target="_blank"
                rel="noreferrer"
                className={`btn-cta inline-flex items-center justify-center w-[15rem] ${lang === 'ru' || lang === 'zu' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} rounded-xl bg-[#9e4b13] text-white whitespace-nowrap`}
                onClick={() => {
                  if (window.dataLayer) {
                    window.dataLayer.push({
                      event: 'reservation_complete',
                      button_location: 'header_desktop',
                      language: lang,
                      currency: currency
                    });
                  }
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
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#9e4b13] text-white hover:bg-[#8a4211] transition-all shadow-md hover:shadow-lg"
              onClick={() => setMenuOpen(v => !v)}
              aria-expanded={menuOpen}
              aria-controls="mnav"
              aria-label="Toggle menu"
            >
              <Menu className={`transition-transform ${menuOpen ? 'rotate-90' : ''}`} />
              <span className="text-sm font-semibold">{ui.menu}</span>
            </button>

            {/* Mobile/Tablet dropdown menu - positioned under button */}
            {menuOpen && (
              <div 
                id="mnav" 
                data-testid="menu-mobile-nav" 
                className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {[
                  ["home", "#home"],
                  ["stay", "#stay"],
                  ["experiences", "#experiences"],
                  ["todo", "#todo"],
                  ["gallery", "#gallery"],
                  ["location", "#location"],
                  ["contact", "#contact"],
                ].map(([k, href]) => (
                  <a
                    key={k}
                    href={href}
                    data-testid={`link-mobile-${k}`}
                    className="block px-5 py-3 hover:bg-[#fffaf6] border-b border-gray-100 transition-colors"
                    onClick={(e) => handleAnchorNav(e, href)}
                  >
                    {ui.nav[k]}
                  </a>
                ))}
                <a
                  href={`/story.html?lang=${lang}`}
                  data-testid="link-mobile-story"
                  className="block px-5 py-3 hover:bg-[#fffaf6] border-b border-gray-100 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {ui.stay?.ourStory || "Our Story"}
                </a>
                <div className="p-3">
                  <a
                    href={bookUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="button-mobile-book-now"
                    className="block text-center btn-cta px-4 py-2.5 rounded-xl bg-[#9e4b13] text-white hover:bg-[#8a4211] transition-colors font-semibold shadow-md"
                    onClick={() => {
                      setMenuOpen(false);
                      if (window.dataLayer) {
                        window.dataLayer.push({
                          event: 'reservation_complete',
                          button_location: 'header_mobile',
                          language: lang,
                          currency: currency
                        });
                      }
                    }}
                  >
                    {ui.contact.bookNow}
                  </a>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Overlay to close menu when clicking outside */}
        {menuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/20 z-40"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </header>
    </>
  );
}
