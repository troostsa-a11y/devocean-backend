import { Mail, Globe2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

// Region metadata (currency auto-assigned by IP, not selectable)
const regions = {
  westEu: { name: 'Western Europe', languages: ['en-GB', 'pt-PT', 'nl-NL', 'fr-FR', 'it-IT', 'de-DE', 'es-ES', 'sv'] },
  eastEu: { name: 'Eastern Europe', languages: ['pl', 'ro', 'sr', 'hr', 'cs'] },
  asia: { name: 'Asia', languages: ['en-GB', 'ja-JP', 'zh-CN', 'ru', 'tr'] },
  americas: { name: 'Americas', languages: ['en-US', 'pt-BR', 'es-ES', 'fr-FR'] },
  africa: { name: 'Africa', languages: ['en-GB', 'fr-FR', 'pt-BR', 'af-ZA', 'zu', 'sw'] },
  oceania: { name: 'Oceania', languages: ['en-GB'] },
};

export { regions };

// Shared brand-color top bar (contact info + region/language selectors).
// Used by the landing Header (fixed, id="nav-stack") and the /book-direct page
// (in-flow via the topbar-static modifier). The two buttonLocation props keep
// GTM whatsapp_click analytics granular per breakpoint.
export default function LanguageTopBar({
  ui,
  lang,
  currency,
  region,
  onLangChange = () => {},
  onRegionChange = () => {},
  id,
  className = '',
  buttonLocationDesktop = 'header_desktop',
  buttonLocationMobile = 'header_mobile',
}) {
  const handleRegionChange = (newRegion) => {
    onRegionChange(newRegion);
    // If the current language isn't offered in the new region, fall back to the
    // first language there (e.g. East-EU → Polish), or English.
    if (!regions[newRegion].languages.includes(lang)) {
      const fallback = regions[newRegion].languages[0] || 'en-GB';
      onLangChange(fallback);
    }
  };

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
            <FaWhatsapp size={20} /> +258 84 418 2252
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
            <FaWhatsapp size={20} />
          </a>
          <a href="mailto:info@devoceanlodge.com" className="flex items-center gap-1" aria-label="Email">
            <Mail size={20} />
          </a>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Globe + region selector — hidden on xs (<640px) to prevent topbar horizontal overflow */}
          <Globe2 size={20} className="hidden sm:block" />
          <select
            value={region}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="hidden sm:block border border-white/40 rounded px-2 py-1 w-[140px] text-white"
            aria-label="Select region"
          >
            {Object.entries(regions).map(([key]) => (
              <option key={key} value={key}>
                {ui?.regions?.[key]}
              </option>
            ))}
          </select>

          {/* Language selector — always visible */}
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
  );
}
