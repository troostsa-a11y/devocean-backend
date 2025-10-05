import { useState } from 'react';
import { Menu, Phone, Mail, Globe2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { IMG } from '../data/content';
import LazyImage from './LazyImage';

export default function Header({ ui, lang, currency, onLangChange, onCurrencyChange, bookUrl }) {
  const [menuOpen, setMenuOpen] = useState(false);

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
            <div className="flex items-center gap-1 border border-white/40 rounded px-2 py-1">
              <Globe2 size={16} />
              <select
                value={lang}
                onChange={(e) => onLangChange(e.target.value)}
              >
                <option value="en">EN</option>
                <option value="pt">PT</option>
                <option value="nl">NL</option>
                <option value="fr">FR</option>
                <option value="it">IT</option>
                <option value="de">DE</option>
                <option value="es">ES</option>
              </select>
            </div>

            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="border border-white/40 rounded px-2 py-1"
            >
              <option value="USD">USD</option>
              <option value="MZN">MZN</option>
              <option value="ZAR">ZAR</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
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
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border"
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
