import { useState } from 'react';
import { Menu, Phone, Mail, Globe2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { IMG } from '../data/content';
import LazyImage from './LazyImage';

export default function Header({ ui, lang, currency, onLangChange, onCurrencyChange, bookUrl }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);

  // Define regions with metadata
  const regions = {
    europe: { name: 'Europe', short: 'EU', languages: ['en', 'pt', 'nl', 'fr', 'it', 'de', 'es', 'sv'], currencies: ['USD', 'EUR', 'GBP', 'SEK', 'ZAR'] },
    asia: { name: 'Asia', short: 'AS', languages: ['en'], currencies: ['USD', 'EUR', 'GBP', 'SEK'] },
    americas: { name: 'Americas', short: 'AM', languages: ['en', 'es', 'fr'], currencies: ['USD', 'EUR', 'GBP'] },
    africa: { name: 'Africa', short: 'AF', languages: ['en', 'fr'], currencies: ['USD', 'MZN', 'ZAR', 'EUR', 'GBP'] },
    oceania: { name: 'Oceania', short: 'OC', languages: ['en'], currencies: ['USD', 'EUR', 'GBP'] }
  };

  // Determine initial region based on current language
  const getRegionForLanguage = (language) => {
    // Priority: if language is only in one region, use that
    // Otherwise default to Europe (most languages)
    for (const [regionKey, regionData] of Object.entries(regions)) {
      if (regionData.languages.includes(language) && regionKey !== 'europe') {
        // Check if language is exclusive to this region
        const exclusiveToRegion = !regions.europe.languages.includes(language) || 
                                   Object.values(regions).filter(r => r.languages.includes(language)).length === 1;
        if (exclusiveToRegion) return regionKey;
      }
    }
    return 'europe'; // Default to Europe
  };

  const [selectedRegion, setSelectedRegion] = useState(getRegionForLanguage(lang));

  const handleRegionChange = (region) => {
    setSelectedRegion(region);
    
    // If current language is not available in the new region, switch to English
    if (!regions[region].languages.includes(lang)) {
      onLangChange('en');
    }
    
    // If current currency is not available in the new region, switch to USD
    if (!regions[region].currencies.includes(currency)) {
      onCurrencyChange('USD');
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
            <a href="tel:+258844182252" className="flex items-center gap-1">
              <Phone size={14} /> +258 84 418 2252
            </a>
            <a href="mailto:info@devoceanlodge.com" className="flex items-center gap-1">
              <Mail size={14} /> info@devoceanlodge.com
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
                    language: lang,
                    currency: currency
                  });
                }
              }}
            >
              <FaWhatsapp size={16} />
            </a>
            <a href="mailto:info@devoceanlodge.com" className="flex items-center gap-1" aria-label="Email">
              <Mail size={16} />
            </a>
          </div>

          <div className="flex items-center gap-3">
            {/* Region selector */}
            <div className="relative flex items-center gap-1">
              <Globe2 size={20} />
              <button
                onClick={() => setRegionMenuOpen(!regionMenuOpen)}
                className="border border-white/40 rounded px-2 py-1 w-[60px] text-left"
                aria-label="Select region"
              >
                {regions[selectedRegion].short}
              </button>
              
              {regionMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setRegionMenuOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-1 bg-[#8B4513] text-white rounded py-1 w-[100px] z-50">
                    {Object.entries(regions).map(([key, region]) => (
                      <button
                        key={key}
                        onClick={() => {
                          handleRegionChange(key);
                          setRegionMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-[#6B3410] transition-colors ${
                          selectedRegion === key ? 'bg-blue-600' : ''
                        }`}
                      >
                        {region.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <select
              value={lang}
              onChange={(e) => onLangChange(e.target.value)}
              className="border border-white/40 rounded px-2 py-1 w-[120px] text-white"
            >
              {regions[selectedRegion].languages.includes('en') && <option value="en">English</option>}
              {regions[selectedRegion].languages.includes('pt') && <option value="pt">Português</option>}
              {regions[selectedRegion].languages.includes('nl') && <option value="nl">Nederlands</option>}
              {regions[selectedRegion].languages.includes('fr') && <option value="fr">Français</option>}
              {regions[selectedRegion].languages.includes('it') && <option value="it">Italiano</option>}
              {regions[selectedRegion].languages.includes('de') && <option value="de">Deutsch</option>}
              {regions[selectedRegion].languages.includes('es') && <option value="es">Español</option>}
              {regions[selectedRegion].languages.includes('sv') && <option value="sv">Svenska</option>}
            </select>

            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="border border-white/40 rounded px-2 py-1 w-[100px] text-white"
            >
              {regions[selectedRegion].currencies.includes('USD') && <option value="USD">Dollar</option>}
              {regions[selectedRegion].currencies.includes('MZN') && <option value="MZN">Meticais</option>}
              {regions[selectedRegion].currencies.includes('ZAR') && <option value="ZAR">Rand</option>}
              {regions[selectedRegion].currencies.includes('EUR') && <option value="EUR">Euro</option>}
              {regions[selectedRegion].currencies.includes('GBP') && <option value="GBP">Pound</option>}
              {regions[selectedRegion].currencies.includes('SEK') && <option value="SEK">Krona</option>}
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
          <ul className="hidden lg:flex items-center gap-6">
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
                  className="hover:text-[#9e4b13]"
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
                className="btn-cta px-4 py-2 rounded-xl bg-[#9e4b13] text-white"
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

          {/* Burger (mobile & tablet) */}
          <button
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border hover:bg-[#9e4b13] hover:text-white transition-colors"
            onClick={() => setMenuOpen(v => !v)}
            aria-expanded={menuOpen}
            aria-controls="mnav"
          >
            <Menu />
          </button>
        </nav>

        {/* Mobile/Tablet menu */}
        {menuOpen && (
          <div id="mnav" className="lg:hidden border-t bg-white">
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
                className="block px-4 py-3 hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}
              >
                {ui.nav[k]}
              </a>
            ))}
            <a
              href={bookUrl}
              target="_blank"
              rel="noreferrer"
              className="block m-4 text-center btn-cta px-4 py-2 rounded-xl bg-[#9e4b13] text-white"
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
        )}
      </header>
    </>
  );
}
