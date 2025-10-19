import { L10N } from '../i18n/translations';
import { ACCOMMODATION_TRANSLATIONS } from '../i18n/accommodationTranslations';
import { UNIT_BASE, EXP_BASE } from '../data/content';

export function localizeUnits(lang) {
  // Map language-region codes to base language keys for translations
  const langKey = 
    (lang === "en-US") ? "en" :
    (lang === "pt-PT" || lang === "pt-BR") ? "pt" :
    (lang === "af-ZA") ? "af" :
    lang;
  const tr = ACCOMMODATION_TRANSLATIONS[langKey] || ACCOMMODATION_TRANSLATIONS['en'] || {};
  
  return UNIT_BASE.map((u) => ({
    ...u,
    title: tr[u.key]?.title || u.title,
    short: tr[u.key]?.short || u.short,
    details: tr[u.key]?.details || u.details,
  }));
}

export function localizeExperiences(lang) {
  const tr = L10N[lang]?.experiences || {};
  return EXP_BASE.map((e) => ({
    ...e,
    title: tr[e.key]?.title || e.title,
    desc: tr[e.key]?.desc || e.desc,
  }));
}

export const toDDMMYYYY = (iso) => (iso ? iso.split("-").reverse().join("/") : "");

export const fromDDMMYYYY = (s) => {
  if (!s) return "";
  const m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
  if (!m) return "";
  const d = m[1].padStart(2, "0");
  const mo = m[2].padStart(2, "0");
  return `${m[3]}-${mo}-${d}`;
};

export const mapEmbed = (lat, lng, zoom = 13) =>
  `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;

export const directionsUrl = (lat, lng) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

export const buildBookingUrl = (locale, currency, countryCode = null, ccToCurrency = {}) => {
  return `https://book.devoceanlodge.com/bv3/search?locale=${locale}&currency=${currency}`;
};
