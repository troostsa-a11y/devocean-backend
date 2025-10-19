/**
 * Accommodation Detail Pages i18n System
 * Standalone vanilla JavaScript translation system for safari.html, comfort.html, cottage.html, chalet.html
 */

// Supported languages (must match main site)
const SUPPORTED_LANGS = [
  "en-GB", "en-US", "pt-PT", "pt-BR", "nl-NL", "fr-FR", "it-IT", "de-DE", "es-ES",
  "sv", "pl", "af-ZA", "zu", "sw", "ja-JP", "zh-CN", "ru"
];

// Map country codes to primary language (IP-based fallback)
const CC_TO_LANGUAGE = {
  // English-speaking countries
  US: "en-US", GB: "en-GB", IE: "en-GB", AU: "en-GB", NZ: "en-GB", CA: "en-GB",
  ZA: "en-GB", NA: "en-GB", ZW: "en-GB", BW: "en-GB", NG: "en-GB", GH: "en-GB", ZM: "en-GB", MW: "en-GB",
  SZ: "en-GB", LS: "en-GB", MU: "en-GB", SC: "en-GB", JM: "en-GB", TT: "en-GB",
  BB: "en-GB", FJ: "en-GB", PG: "en-GB", SB: "en-GB", VU: "en-GB",
  
  // Portuguese-speaking countries
  PT: "pt-PT", BR: "pt-BR", MZ: "pt-BR", AO: "pt-BR",
  
  // Dutch-speaking countries
  NL: "nl-NL", BE: "nl-NL", SR: "nl-NL",
  
  // French-speaking countries
  FR: "fr-FR", MC: "fr-FR", LU: "fr-FR", CH: "fr-FR", RE: "fr-FR",
  SN: "fr-FR", CI: "fr-FR", CM: "fr-FR", DJ: "fr-FR", NC: "fr-FR", PF: "fr-FR",
  
  // Italian-speaking countries
  IT: "it-IT", SM: "it-IT", VA: "it-IT",
  
  // German-speaking countries
  DE: "de-DE", AT: "de-DE", LI: "de-DE",
  
  // Spanish-speaking countries
  ES: "es-ES", MX: "es-ES", AR: "es-ES", CO: "es-ES", PE: "es-ES", VE: "es-ES",
  CL: "es-ES", EC: "es-ES", GT: "es-ES", CU: "es-ES", BO: "es-ES", DO: "es-ES",
  HN: "es-ES", PY: "es-ES", SV: "es-ES", NI: "es-ES", CR: "es-ES", PA: "es-ES",
  UY: "es-ES", GQ: "es-ES",
  
  // Swedish-speaking countries
  SE: "sv", FI: "sv",
  
  // Polish-speaking countries
  PL: "pl",
  
  // Japanese-speaking countries
  JP: "ja-JP",
  
  // Chinese-speaking countries/regions
  CN: "zh-CN", HK: "zh-CN", TW: "zh-CN", SG: "zh-CN",
  
  // Russian-speaking countries
  RU: "ru", BY: "ru", KZ: "ru", UA: "ru", UZ: "ru", KG: "ru",
  
  // Swahili-speaking countries
  KE: "sw", TZ: "sw", UG: "sw",
};

// Comprehensive country-to-currency mapping
const CC_TO_CURRENCY = {
  // Europe
  GB: "GBP", IE: "EUR", NL: "EUR", BE: "EUR", FR: "EUR",
  DE: "EUR", IT: "EUR", ES: "EUR", PT: "EUR", AT: "EUR",
  FI: "EUR", SE: "SEK", PL: "PLN", NO: "NOK", DK: "DKK",
  CH: "CHF", CZ: "CZK", HU: "HUF",
  
  // Africa
  ZA: "ZAR", MZ: "MZN", KE: "KES", TZ: "TZS", UG: "UGX",
  ZW: "USD", BW: "BWP", NA: "NAD",
  
  // Americas
  US: "USD", CA: "CAD", MX: "MXN", BR: "BRL", AR: "ARS",
  
  // Asia & Middle East
  CN: "CNY", JP: "JPY", IN: "INR", TH: "THB",
  SG: "SGD", RU: "RUB",
  
  // Oceania
  AU: "AUD", NZ: "NZD",
};

// Import translations from accommodation-translations.json
// Define base translations first
const baseTranslations = {
  "en-GB": {
    "backToAccommodations": "Back to Accommodations",
    "readyToBook": "Ready to Book",
    "secureYourEscape": "Secure your nature-immersed escape at DEVOCEAN Lodge. Direct booking means the best rates and full support from our team.",
    "bookYourStay": "Book Your Stay",
    "viewAllAccommodations": "View All Accommodations"
  },
  "pt-PT": {
    "backToAccommodations": "Voltar às Acomodações",
    "readyToBook": "Pronto para Reservar",
    "secureYourEscape": "Garanta sua escapada imersa na natureza no DEVOCEAN Lodge. Reserva direta significa melhores tarifas e suporte completo da nossa equipe.",
    "bookYourStay": "Reserve Sua Estadia",
    "viewAllAccommodations": "Ver Todas as Acomodações"
  },
  "af-ZA": {
    "backToAccommodations": "Terug na Akkommodasie",
    "readyToBook": "Gereed om te Bespreek",
    "secureYourEscape": "Verseker jou natuurgeïnspireerde ontvlugting by DEVOCEAN Lodge. Direkte bespreking beteken die beste tariewe en volledige ondersteuning van ons span.",
    "bookYourStay": "Bespreek Jou Verblyf",
    "viewAllAccommodations": "Bekyk Alle Akkommodasie"
  }
};

const TRANSLATIONS = {
  "common": {
    "en-GB": baseTranslations["en-GB"],
    "en-US": baseTranslations["en-GB"], // US English uses same translations as UK English
    "pt-PT": baseTranslations["pt-PT"], // Portugal Portuguese
    "pt-BR": baseTranslations["pt-PT"], // Brazilian Portuguese (same translations)
    "af-ZA": baseTranslations["af-ZA"], // Afrikaans (South Africa)
    "nl-NL": {
      "backToAccommodations": "Terug naar Accommodaties",
      "readyToBook": "Klaar om te Boeken",
      "secureYourEscape": "Verzeker uw natuurlijke ontsnapping bij DEVOCEAN Lodge. Direct boeken betekent de beste tarieven en volledige ondersteuning van ons team.",
      "bookYourStay": "Boek Uw Verblijf",
      "viewAllAccommodations": "Bekijk Alle Accommodaties"
    },
    "fr-FR": {
      "backToAccommodations": "Retour aux Hébergements",
      "readyToBook": "Prêt à Réserver",
      "secureYourEscape": "Sécurisez votre évasion immergée dans la nature au DEVOCEAN Lodge. La réservation directe signifie les meilleurs tarifs et un soutien complet de notre équipe.",
      "bookYourStay": "Réservez Votre Séjour",
      "viewAllAccommodations": "Voir Tous les Hébergements"
    },
    "it-IT": {
      "backToAccommodations": "Torna agli Alloggi",
      "readyToBook": "Pronto a Prenotare",
      "secureYourEscape": "Assicurati la tua fuga immersa nella natura al DEVOCEAN Lodge. La prenotazione diretta significa le migliori tariffe e il supporto completo del nostro team.",
      "bookYourStay": "Prenota il Tuo Soggiorno",
      "viewAllAccommodations": "Vedi Tutti gli Alloggi"
    },
    "de-DE": {
      "backToAccommodations": "Zurück zu Unterkünften",
      "readyToBook": "Bereit zu Buchen",
      "secureYourEscape": "Sichern Sie sich Ihren naturverbundenen Rückzugsort im DEVOCEAN Lodge. Direktbuchung bedeutet beste Preise und volle Unterstützung von unserem Team.",
      "bookYourStay": "Buchen Sie Ihren Aufenthalt",
      "viewAllAccommodations": "Alle Unterkünfte Ansehen"
    },
    "es-ES": {
      "backToAccommodations": "Volver a Alojamientos",
      "readyToBook": "Listo para Reservar",
      "secureYourEscape": "Asegure su escape inmerso en la naturaleza en DEVOCEAN Lodge. La reserva directa significa las mejores tarifas y el apoyo completo de nuestro equipo.",
      "bookYourStay": "Reserve Su Estadía",
      "viewAllAccommodations": "Ver Todos los Alojamientos"
    },
    "sv": {
      "backToAccommodations": "Tillbaka till Boenden",
      "readyToBook": "Redo att Boka",
      "secureYourEscape": "Säkra din naturinspirerade flykt på DEVOCEAN Lodge. Direktbokning innebär bästa priser och fullt stöd från vårt team.",
      "bookYourStay": "Boka Din Vistelse",
      "viewAllAccommodations": "Se Alla Boenden"
    },
    "pl": {
      "backToAccommodations": "Powrót do Zakwaterowania",
      "readyToBook": "Gotowy do Rezerwacji",
      "secureYourEscape": "Zabezpiecz swój pobyt w przyrodzie w DEVOCEAN Lodge. Bezpośrednia rezerwacja oznacza najlepsze ceny i pełne wsparcie naszego zespołu.",
      "bookYourStay": "Zarezerwuj Swój Pobyt",
      "viewAllAccommodations": "Zobacz Wszystkie Zakwaterowanie"
    },
    "zu": {
      "backToAccommodations": "Buyela Ezindaweni Zokuhlala",
      "readyToBook": "Kulungele Ukubhukha",
      "secureYourEscape": "Qinisekisa ukubaleka kwakho emvelweni ku-DEVOCEAN Lodge. Ukubhukha ngqo kusho amanani angcono nokusekelwa okugcwele yithimba lethu.",
      "bookYourStay": "Bhukha Ukunhlala Kwakho",
      "viewAllAccommodations": "Buka Zonke Izindawo Zokuhlala"
    },
    "sw": {
      "backToAccommodations": "Rudi kwa Malazi",
      "readyToBook": "Tayari Kuhifadhi",
      "secureYourEscape": "Hakikisha utoroaji wako katika asili katika DEVOCEAN Lodge. Uhifadhi wa moja kwa moja maana bei bora na usaidizi kamili kutoka kwa timu yetu.",
      "bookYourStay": "Hifadhi Kukaa Kwako",
      "viewAllAccommodations": "Tazama Malazi Yote"
    },
    "ja-JP": {
      "backToAccommodations": "宿泊施設に戻る",
      "readyToBook": "予約準備完了",
      "secureYourEscape": "DEVOCEAN Lodgeで自然に浸る逃避を確保してください。直接予約は最高の料金と私たちのチームからの完全なサポートを意味します。",
      "bookYourStay": "ご滞在を予約",
      "viewAllAccommodations": "すべての宿泊施設を表示"
    },
    "zh-CN": {
      "backToAccommodations": "返回住宿",
      "readyToBook": "准备预订",
      "secureYourEscape": "在DEVOCEAN Lodge确保您沉浸在大自然中的逃离。直接预订意味着最优惠的价格和我们团队的全力支持。",
      "bookYourStay": "预订您的住宿",
      "viewAllAccommodations": "查看所有住宿"
    },
    "ru": {
      "backToAccommodations": "Вернуться к Размещению",
      "readyToBook": "Готовы Забронировать",
      "secureYourEscape": "Обеспечьте свой побег в природу в DEVOCEAN Lodge. Прямое бронирование означает лучшие цены и полную поддержку от нашей команды.",
      "bookYourStay": "Забронируйте Ваше Пребывание",
      "viewAllAccommodations": "Посмотреть Все Варианты Размещения"
    }
  }
};

// Normalize language code to Hotelrunner locale format
function normLang(raw) {
  if (!raw) return "en-GB";
  let s = String(raw).toLowerCase();
  
  // Preserve full Hotelrunner locale codes with proper capitalization
  if (s === "en-gb" || s === "en") return "en-GB";
  if (s === "en-us") return "en-US";
  if (s === "pt-pt") return "pt-PT";
  if (s === "pt-br") return "pt-BR";
  if (s === "pt-mz") return "pt-BR"; // Mozambique uses Brazilian variant
  if (s === "nl-nl" || s === "nl") return "nl-NL";
  if (s === "fr-fr" || s === "fr") return "fr-FR";
  if (s === "it-it" || s === "it") return "it-IT";
  if (s === "de-de" || s === "de") return "de-DE";
  if (s === "es-es" || s === "es") return "es-ES";
  if (s === "ja-jp" || s === "ja") return "ja-JP";
  if (s === "zh-cn" || s === "zh") return "zh-CN";
  if (s === "af-za" || s === "af") return "af-ZA";
  if (s === "sv") return "sv";
  if (s === "pl") return "pl";
  if (s === "ru") return "ru";
  if (s === "zu") return "zu";
  if (s === "sw") return "sw";
  
  return "en-GB";
}

// Get URL parameter
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Detect language
function detectLanguage() {
  // 1. Check URL parameter (for navigation from main site)
  const urlLang = getUrlParam('lang');
  if (urlLang) {
    const normalized = normLang(urlLang);
    if (SUPPORTED_LANGS.includes(normalized)) {
      // Store in localStorage for consistency
      localStorage.setItem('site.lang', normalized);
      return normalized;
    }
  }

  // 2. Check localStorage
  const stored = localStorage.getItem('site.lang');
  if (stored && SUPPORTED_LANGS.includes(stored)) {
    return stored;
  }

  // 3. Check browser language
  const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  const normalized = normLang(browserLang);
  if (SUPPORTED_LANGS.includes(normalized)) {
    return normalized;
  }

  // 4. Check Cloudflare IP geolocation
  const countryCode = window.__CF_COUNTRY__ || null;
  if (countryCode && CC_TO_LANGUAGE[countryCode]) {
    return CC_TO_LANGUAGE[countryCode];
  }

  // 5. Default to English
  return 'en-GB';
}

// Detect currency
function detectCurrency() {
  // 1. Check localStorage
  const stored = localStorage.getItem('site.currency');
  if (stored) {
    return stored;
  }

  // 2. Check Cloudflare IP geolocation
  const countryCode = window.__CF_COUNTRY__ || null;
  if (countryCode && CC_TO_CURRENCY[countryCode]) {
    return CC_TO_CURRENCY[countryCode];
  }

  // 3. Default to USD
  return 'USD';
}

// Get locale for Hotelrunner (now 1:1 mapping with unified codes)
function getHotelrunnerLocale(lang) {
  const localeMap = {
    'en-GB': 'en-GB',
    'en-US': 'en-US',
    'pt-PT': 'pt-PT',
    'pt-BR': 'pt-BR',
    'nl-NL': 'nl-NL',
    'fr-FR': 'fr-FR',
    'it-IT': 'it-IT',
    'de-DE': 'de-DE',
    'es-ES': 'es-ES',
    'sv': 'sv',
    'pl': 'pl',
    'af-ZA': 'af-ZA',
    'zu': 'en-GB', // Zulu maps to English for Hotelrunner
    'sw': 'sw',
    'ja-JP': 'ja-JP',
    'zh-CN': 'zh-CN',
    'ru': 'ru'
  };
  return localeMap[lang] || 'en-GB';
}

// Apply translations to page
function applyTranslations(lang) {
  // Direct lookup - translation keys now match language codes
  const t = TRANSLATIONS.common[lang] || TRANSLATIONS.common['en-GB'];
  
  // Update common text elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = t[key];
      } else {
        el.textContent = t[key];
      }
    }
  });

  // Update booking URLs
  const currency = detectCurrency();
  const locale = getHotelrunnerLocale(lang);
  const bookingUrl = `https://book.devoceanlodge.com/bv3/search?locale=${locale}&currency=${currency}`;
  
  document.querySelectorAll('a[href*="book.devoceanlodge.com"]').forEach(link => {
    link.href = bookingUrl;
  });

  // Update page language attribute
  document.documentElement.lang = lang;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const lang = detectLanguage();
  applyTranslations(lang);
});
