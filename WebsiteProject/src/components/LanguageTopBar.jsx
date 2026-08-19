import { Mail, Globe2 } from 'lucide-react';
import { LOCALES } from '../i18n/localeCatalog.js';

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.22 8.22 0 012.41 5.82c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.19-.32a8.188 8.188 0 01-1.26-4.37c.01-4.54 3.7-8.24 8.24-8.24zm-3.6 4.28c-.18 0-.46.07-.7.33-.24.26-.91.89-.91 2.17 0 1.28.93 2.52 1.06 2.7.13.17 1.83 2.79 4.43 3.91.62.27 1.1.43 1.48.55.62.2 1.19.17 1.63.1.5-.07 1.53-.63 1.75-1.23.22-.61.22-1.13.15-1.24-.06-.11-.24-.17-.5-.3-.26-.13-1.54-.76-1.78-.84-.24-.09-.41-.13-.58.13-.17.26-.66.84-.81 1.01-.15.17-.3.19-.56.06-.26-.12-1.1-.41-2.09-1.3-.77-.69-1.29-1.54-1.44-1.8-.15-.26-.02-.4.11-.53.12-.11.26-.3.39-.45.13-.15.17-.26.26-.44.09-.17.04-.32-.02-.45-.06-.13-.58-1.4-.8-1.91-.21-.5-.43-.43-.59-.44-.15 0-.32-.01-.5-.01z"/>
    </svg>
  );
}

// Shared brand-color top bar (contact info + language selector).
// Used by the landing Header (fixed, id="nav-stack") and the /book-direct page
// (in-flow via the topbar-static modifier). The two buttonLocation props keep
// GTM whatsapp_click analytics granular per breakpoint.
export default function LanguageTopBar({
  ui,
  lang,
  currency,
  onLangChange = () => {},
  id,
  className = '',
  buttonLocationDesktop = 'header_desktop',
  buttonLocationMobile = 'header_mobile',
}) {
  const pushWhatsappEvent = (buttonLocation) => {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'whatsapp_click',
        button_location: buttonLocation,
        page_path: window.location.pathname,
        language: lang,
        currency: currency,
        contact_method: 'whatsapp',
      });
    }
  };

  return (
    <div id={id} className={className}>
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
        {/* Desktop: full contact info */}
        <div className="hidden lg:flex items-center gap-4">
          <a
            href="https://wa.me/258844182252"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1"
            onClick={() => pushWhatsappEvent(buttonLocationDesktop)}
          >
            <WhatsAppIcon /> +258 84 418 2252
          </a>
          <a href="mailto:info@devoceanlodge.com" className="flex items-center gap-1">
            <Mail size={20} /> info@devoceanlodge.com
          </a>
        </div>

        {/* Mobile/tablet: icon-only contact */}
        <div className="flex lg:hidden items-center gap-3">
          <a
            href="https://wa.me/258844182252"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1"
            aria-label="WhatsApp"
            onClick={() => pushWhatsappEvent(buttonLocationMobile)}
          >
            <WhatsAppIcon />
          </a>
          <a href="mailto:info@devoceanlodge.com" className="flex items-center gap-1" aria-label="Email">
            <Mail size={20} />
          </a>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language is selected directly. Region and display currency are
              intentionally separate concepts, so choosing a language cannot
              silently alter a guest's currency preference. */}
          <Globe2 size={20} className="hidden sm:block" />
          <select
            value={lang}
            onChange={(e) => onLangChange(e.target.value)}
            className="border border-white/40 rounded px-2 py-1 w-[178px] max-w-[48vw] text-white"
            aria-label="Select language"
          >
            {LOCALES.map((locale) => (
              <option key={locale.code} value={locale.code}>
                {locale.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
