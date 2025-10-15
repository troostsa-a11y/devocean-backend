import { useState } from 'react';
import { Menu, Phone, Mail, Globe2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { IMG } from '../data/content';
import LazyImage from './LazyImage';

export default function Header({ ui, lang, currency, region, onLangChange, onCurrencyChange, onRegionChange, bookUrl }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);

  // Define regions with metadata
  const regions = {
    europe: { name: 'Europe', short: 'EU', languages: ['en', 'pt', 'nl', 'fr', 'it', 'de', 'es', 'sv', 'pl'], currencies: ['USD', 'EUR', 'GBP', 'SEK', 'PLN'] },
    asia: { name: 'Asia', short: 'AS', languages: ['en', 'ja', 'zh', 'ru'], currencies: ['USD', 'JPY', 'CNY', 'RUB', 'EUR', 'GBP'] },
    americas: { name: 'Americas', short: 'AM', languages: ['en', 'es', 'fr'], currencies: ['USD', 'EUR', 'GBP'] },
    africa: { name: 'Africa', short: 'AF', languages: ['en', 'fr', 'pt', 'af', 'zu'], currencies: ['USD', 'MZN', 'ZAR', 'EUR', 'GBP'] },
    oceania: { name: 'Oceania', short: 'OC', languages: ['en'], currencies: ['USD', 'EUR', 'GBP'] }
  };

  const handleRegionChange = (newRegion) => {
    onRegionChange(newRegion);
    
    // If current language is not available in the new region, switch to English
    if (!regions[newRegion].languages.includes(lang)) {
      onLangChange('en');
    }
    
    // Africa region language-currency auto-switching
    if (lang === 'pt' && newRegion === 'africa' && currency !== 'MZN') {
      onCurrencyChange('MZN');
    }
    else if (lang === 'en' && newRegion === 'africa' && currency !== 'ZAR') {
      onCurrencyChange('ZAR');
    }
    else if (lang === 'af' && newRegion === 'africa' && currency !== 'ZAR') {
      onCurrencyChange('ZAR');
    }
    else if (lang === 'zu' && newRegion === 'africa' && currency !== 'ZAR') {
      onCurrencyChange('ZAR');
    }
    // Europe region language-currency auto-switching
    else if (lang === 'en' && newRegion === 'europe' && currency !== 'GBP') {
      onCurrencyChange('GBP');
    }
    else if (lang === 'pt' && newRegion === 'europe' && currency !== 'EUR') {
      onCurrencyChange('EUR');
    }
    else if (lang === 'sv' && newRegion === 'europe' && currency !== 'SEK') {
      onCurrencyChange('SEK');
    }
    else if (lang === 'pl' && newRegion === 'europe' && currency !== 'PLN') {
      onCurrencyChange('PLN');
    }
    // Asia region language-currency auto-switching
    else if (lang === 'ja' && newRegion === 'asia' && currency !== 'JPY') {
      onCurrencyChange('JPY');
    }
    else if (lang === 'zh' && newRegion === 'asia' && currency !== 'CNY') {
      onCurrencyChange('CNY');
    }
    else if (lang === 'ru' && newRegion === 'asia' && currency !== 'RUB') {
      onCurrencyChange('RUB');
    }
    // If current currency is not available in the new region, switch to USD
    else if (!regions[newRegion].currencies.includes(currency)) {
      onCurrencyChange('USD');
    }
  };

  const handleLangChange = (newLang) => {
    onLangChange(newLang);
    
    // Auto-switch to language-specific currencies when available in current region
    // Africa region
    if (newLang === 'pt' && region === 'africa' && regions[region].currencies.includes('MZN') && currency !== 'MZN') {
      onCurrencyChange('MZN');
    }
    else if (newLang === 'en' && region === 'africa' && regions[region].currencies.includes('ZAR') && currency !== 'ZAR') {
      onCurrencyChange('ZAR');
    }
    else if (newLang === 'af' && region === 'africa' && regions[region].currencies.includes('ZAR') && currency !== 'ZAR') {
      onCurrencyChange('ZAR');
    }
    else if (newLang === 'zu' && region === 'africa' && regions[region].currencies.includes('ZAR') && currency !== 'ZAR') {
      onCurrencyChange('ZAR');
    }
    // Europe region
    else if (newLang === 'en' && region === 'europe' && regions[region].currencies.includes('GBP') && currency !== 'GBP') {
      onCurrencyChange('GBP');
    }
    else if (newLang === 'pt' && region === 'europe' && regions[region].currencies.includes('EUR') && currency !== 'EUR') {
      onCurrencyChange('EUR');
    }
    else if (newLang === 'sv' && region === 'europe' && regions[region].currencies.includes('SEK') && currency !== 'SEK') {
      onCurrencyChange('SEK');
    }
    else if (newLang === 'pl' && region === 'europe' && regions[region].currencies.includes('PLN') && currency !== 'PLN') {
      onCurrencyChange('PLN');
    }
    // Asia region
    else if (newLang === 'ja' && region === 'asia' && regions[region].currencies.includes('JPY') && currency !== 'JPY') {
      onCurrencyChange('JPY');
    }
    else if (newLang === 'zh' && region === 'asia' && regions[region].currencies.includes('CNY') && currency !== 'CNY') {
      onCurrencyChange('CNY');
    }
    else if (newLang === 'ru' && region === 'asia' && regions[region].currencies.includes('RUB') && currency !== 'RUB') {
      onCurrencyChange('RUB');
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
            {/* Region selector */}
            <div className="relative flex items-center gap-1">
              <Globe2 size={20} />
              <button
                onClick={() => setRegionMenuOpen(!regionMenuOpen)}
                className="border border-white/40 rounded px-2 py-1 w-[40px] text-left"
                aria-label="Select region"
              >
                {regions[region].short}
              </button>
              
              {regionMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setRegionMenuOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-1 bg-[#8B4513] text-white rounded py-1 w-[90px] z-50">
                    {Object.entries(regions).map(([key, regionData]) => (
                      <button
                        key={key}
                        onClick={() => {
                          handleRegionChange(key);
                          setRegionMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-[#6B3410] transition-colors ${
                          region === key ? 'bg-blue-600' : ''
                        }`}
                      >
                        {regionData.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <select
              value={lang}
              onChange={(e) => handleLangChange(e.target.value)}
              className="border border-white/40 rounded px-2 py-1 w-[95px] text-white"
            >
              {regions[region].languages.includes('en') && <option value="en">English</option>}
              {regions[region].languages.includes('pt') && <option value="pt">Português</option>}
              {regions[region].languages.includes('nl') && <option value="nl">Nederlands</option>}
              {regions[region].languages.includes('fr') && <option value="fr">Français</option>}
              {regions[region].languages.includes('it') && <option value="it">Italiano</option>}
              {regions[region].languages.includes('de') && <option value="de">Deutsch</option>}
              {regions[region].languages.includes('es') && <option value="es">Español</option>}
              {regions[region].languages.includes('sv') && <option value="sv">Svenska</option>}
              {regions[region].languages.includes('pl') && <option value="pl">Polski</option>}
              {regions[region].languages.includes('af') && <option value="af">Afrikaans</option>}
              {regions[region].languages.includes('zu') && <option value="zu">isiZulu</option>}
              {regions[region].languages.includes('ru') && <option value="ru">Русский</option>}
              {regions[region].languages.includes('ja') && <option value="ja">日本語</option>}
              {regions[region].languages.includes('zh') && <option value="zh">中文</option>}
            </select>

            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="border border-white/40 rounded px-2 py-1 w-[80px] text-white"
            >
              {regions[region].currencies.includes('USD') && <option value="USD">{ui.currencies?.USD || 'US-Dollar'}</option>}
              {regions[region].currencies.includes('JPY') && <option value="JPY">{ui.currencies?.JPY || 'Yen'}</option>}
              {regions[region].currencies.includes('CNY') && <option value="CNY">{ui.currencies?.CNY || 'Yuan'}</option>}
              {regions[region].currencies.includes('RUB') && <option value="RUB">{ui.currencies?.RUB || 'Ruble'}</option>}
              {regions[region].currencies.includes('MZN') && <option value="MZN">{ui.currencies?.MZN || 'Meticais'}</option>}
              {regions[region].currencies.includes('ZAR') && <option value="ZAR">{ui.currencies?.ZAR || 'Rand'}</option>}
              {regions[region].currencies.includes('EUR') && <option value="EUR">{ui.currencies?.EUR || 'Euro'}</option>}
              {regions[region].currencies.includes('GBP') && <option value="GBP">{ui.currencies?.GBP || 'GB-Pound'}</option>}
              {regions[region].currencies.includes('SEK') && <option value="SEK">{ui.currencies?.SEK || 'Krona'}</option>}
              {regions[region].currencies.includes('PLN') && <option value="PLN">{ui.currencies?.PLN || 'Zloty'}</option>}
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
                className={`btn-cta ${lang === 'ru' || lang === 'zu' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} rounded-xl bg-[#9e4b13] text-white whitespace-nowrap`}
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
            data-testid="button-mobile-menu"
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#9e4b13] text-white hover:bg-[#8a4211] transition-colors"
            onClick={() => setMenuOpen(v => !v)}
            aria-expanded={menuOpen}
            aria-controls="mnav"
            aria-label="Toggle menu"
          >
            <Menu />
          </button>
        </nav>

        {/* Mobile/Tablet menu */}
        {menuOpen && (
          <div id="mnav" data-testid="menu-mobile-nav" className="lg:hidden border-t bg-white">
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
              data-testid="button-mobile-book-now"
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
