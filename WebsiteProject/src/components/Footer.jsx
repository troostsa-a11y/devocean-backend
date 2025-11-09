import { Phone, Mail, MapPin } from 'lucide-react';
import { IMG, EMAIL, PHONE } from '../data/content';
import LazyImage from './LazyImage';

export default function Footer({ units, experiences, ui }) {
  const handleAnchorNav = (e, href) => {
    const id = href.startsWith('#') ? href.slice(1) : '';
    const el = id ? document.getElementById(id) : null;

    if (el) {
      e.preventDefault();
      const rectTop = el.getBoundingClientRect().top + window.scrollY;
      // Read cached CSS variable (avoids forced reflow vs getComputedStyle)
      const stackH = document.documentElement.style.getPropertyValue('--stack-h');
      const offset = parseFloat(stackH) || (window.innerWidth < 768 ? 96 : 104);
      window.scrollTo({ top: Math.max(0, rectTop - offset), behavior: 'smooth' });

      const newUrl = `${window.location.pathname}${window.location.search}#${id}`;
      window.history.replaceState({}, '', newUrl);
    }
  };

  // Countries that require "Do Not Sell My Info" link (CCPA/similar laws)
  const CCPA_COUNTRIES = [
    'US', // USA (CCPA - California Consumer Privacy Act)
    'CA', // Canada (some provinces have similar requirements)
  ];

  // Check if user is from a country that requires "Do Not Sell My Info" link
  const countryCode = typeof window !== 'undefined' ? window.__CF_COUNTRY__ : null;
  const showConsentLink = countryCode && CCPA_COUNTRIES.includes(countryCode);

  return (
    <footer className="bg-slate-900 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-5 gap-8">
        {/* Brand / About */}
        <div>
          <a
            href="#home"
            className="flex items-center gap-3 hover:text-white"
            onClick={(e) => handleAnchorNav(e, '#home')}
          >
            <LazyImage 
              srcWebP="/images/devocean_logo_header-small.webp"
              alt="DEVOCEAN Lodge" 
              className="h-9 w-9 rounded-full object-cover" 
              loading="lazy" 
            />
            <span className="font-semibold">DEVOCEAN Lodge</span>
          </a>
          <p className="mt-3 text-sm text-slate-400">{ui.footer.desc}</p>
        </div>

        {/* Stay */}
        <div>
          <a
            href="#stay"
            className="font-semibold hover:text-white"
            onClick={(e) => handleAnchorNav(e, '#stay')}
          >
            {ui.nav.stay}
          </a>
          <ul className="mt-2 space-y-1 text-sm text-slate-400">
            {units.map((u) => (
              <li key={u.key}>
                <a
                  className="hover:text-white"
                  href="#stay"
                  onClick={(e) => handleAnchorNav(e, '#stay')}
                >
                  {u.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Experiences */}
        <div>
          <a
            href="#experiences"
            className="font-semibold hover:text-white"
            onClick={(e) => handleAnchorNav(e, '#experiences')}
          >
            {ui.nav.experiences}
          </a>
          <ul className="mt-2 space-y-1 text-sm text-slate-400">
            {experiences.slice(0, 4).map((ex) => (
              <li key={ex.key}>
                <a
                  className="hover:text-white"
                  href="#experiences"
                  onClick={(e) => handleAnchorNav(e, '#experiences')}
                >
                  {ex.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <a
            href="#contact"
            className="font-semibold hover:text-white"
            onClick={(e) => handleAnchorNav(e, '#contact')}
          >
            {ui.nav.contact}
          </a>
          <ul className="mt-2 space-y-2 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <Phone size={16} />
              <a href={`tel:${PHONE}`} className="hover:text-white whitespace-nowrap">
                {PHONE}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} />
              <a href={`mailto:${EMAIL}`} className="hover:text-white">{EMAIL}</a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} /> Ponta do Ouro, Mozambique
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <div className="font-semibold">{ui?.legal?.title ?? "Legal"}</div>
          <ul className="mt-2 space-y-1 text-sm text-slate-400">
            <li><a className="hover:text-white" href="/legal/privacy.html">{ui?.legal?.privacy ?? "Privacy Policy"}</a></li>
            <li><a className="hover:text-white" href="/legal/cookies.html">{ui?.legal?.cookies ?? "Cookie Policy"}</a></li>
            <li><a className="hover:text-white" href="/legal/terms.html">{ui?.legal?.terms ?? "Terms & Conditions"}</a></li>
            <li><a className="hover:text-white" href="/legal/GDPR.html">{ui?.legal?.gdpr ?? "GDPR Info"}</a></li>
            <li><a className="hover:text-white" href="/legal/CRIC.html">{ui?.legal?.cric ?? "Consumer Rights & Contact"}</a></li>
            {showConsentLink && (
              <li>
                <a 
                  href="#"
                  className="cky-banner-element hover:text-white cursor-pointer"
                >
                  {ui?.legal?.ccpa ?? "Do Not Sell My Info"}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-700 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} DEVOCEAN Lodge. {ui.footer.rights}
        </div>
      </div>
    </footer>
  );
}
